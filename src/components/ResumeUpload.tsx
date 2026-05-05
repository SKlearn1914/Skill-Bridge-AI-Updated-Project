import React, { useState } from 'react';
import { Upload, X, Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { analyzeResumeText } from '../services/geminiService';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface ResumeUploadProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function ResumeUpload({ onComplete, onCancel }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const allowedExtensions = ['.pdf', '.txt', '.docx'];
      const ext = selected.name.toLowerCase().slice(selected.name.lastIndexOf('.'));
      
      if (allowedTypes.includes(selected.type) || allowedExtensions.includes(ext)) {
        setFile(selected);
        setError(null);
      } else {
        setError('Please upload a PDF, TXT or DOCX file.');
      }
    }
  };

  const uploadAndParse = async () => {
    if (!file || !auth.currentUser) return;
    setLoading(true);
    setError(null);

    try {
      console.log('Sending file to extraction API...');

      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // strip "data:...;base64," prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 1. Extract text via backend
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // ← changed
        },
        body: JSON.stringify({
          fileData: base64,        // ← changed
          mimeType: file.type,     // ← changed
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `Server responded with ${response.status}`;
        if (contentType && contentType.includes('application/json')) {
          const errData = await response.json().catch(() => ({}));
          errorMessage = errData.error || errorMessage;
        } else {
          const text = await response.text().catch(() => '');
          console.error('Non-JSON error response:', text.substring(0, 500));
          errorMessage = 'The server returned an unexpected response.';
        }
        throw new Error(errorMessage);
      }

      const { result } = await response.json();  // ← changed "text" to "result"
      console.log('Text extracted successfully, calling AI analysis...');

      // 2. Analyze via frontend Gemini
      const analysis = await analyzeResumeText(result);
      console.log('AI Analysis complete:', analysis);

      // 3. Save to Firestore
      try {
        await addDoc(collection(db, 'resumes'), {
          userId: auth.currentUser.uid,
          fileName: file.name,
          rawText: result,
          technicalSkills: analysis.technicalSkills || analysis.TechnicalSkills || analysis.technical_skills || [],
          softSkills: analysis.softSkills || analysis.SoftSkills || analysis.soft_skills || [],
          experience: analysis.yearsOfExperience || analysis.YearsOfExperience || analysis.years_of_experience || 0,
          education: analysis.education || analysis.Education || '',
          createdAt: new Date().toISOString(),
        });
        console.log('Resume saved to Firestore');
      } catch (err) {
        console.error('Firestore Save Error:', err);
        handleFirestoreError(err, OperationType.CREATE, 'resumes', auth, auth.currentUser.uid);
      }

      onComplete();
    } catch (err: any) {
      console.error('Full Upload Process Error:', err);
      setError(`Failed to process resume: ${err.message || 'Unknown error'}. Please ensure the file is not empty and try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upload Resume</h2>
            <p className="text-slate-500">Supported formats: PDF, TXT, DOCX</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const dropFile = e.dataTransfer.files[0];
              if (dropFile) {
                const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                const allowedExtensions = ['.pdf', '.txt', '.docx'];
                const ext = dropFile.name.toLowerCase().slice(dropFile.name.lastIndexOf('.'));
                
                if (allowedTypes.includes(dropFile.type) || allowedExtensions.includes(ext)) {
                  setFile(dropFile);
                  setError(null);
                } else {
                  setError('Please upload a PDF, TXT or DOCX file.');
                }
              }
            }}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer relative",
              isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50",
              file ? "border-emerald-500 bg-emerald-50/10" : ""
            )}
          >
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFile}
              accept=".pdf,.txt,.docx"
              disabled={loading}
            />
            {file ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{file.name}</p>
                  <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-sm font-semibold text-rose-600 hover:underline"
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Click to upload or drag and drop</p>
                  <p className="text-slate-500 text-sm">Your data is processed securely with AI</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={uploadAndParse}
              disabled={!file || loading}
              className="flex-3 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Extract Skills & Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
