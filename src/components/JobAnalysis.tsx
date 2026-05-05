import { useState, useEffect } from 'react';
import { ResumeData, AnalysisReport } from '../types';
import { ClipboardList, Loader2, Sparkles, AlertCircle, ChevronRight, Search } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { analyzeJDText, generateBridgeReport } from '../services/geminiService';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface JobAnalysisProps {
  resumes: ResumeData[];
  onComplete: (report: AnalysisReport) => void;
  onCancel: () => void;
}

export function JobAnalysis({ resumes, onComplete, onCancel }: JobAnalysisProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [jdText, setJdText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Automatically select the first resume when list loads or changes
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id || '');
    }
  }, [resumes, selectedResumeId]);

  const startAnalysis = async () => {
    if (!selectedResumeId || !jdText || !jobTitle || !auth.currentUser) return;
    setLoading(true);
    setError(null);

    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    if (!selectedResume) {
      setError('Selected resume not found. Please try re-selecting.');
      setLoading(false);
      return;
    }

    try {
      // 1. Analyze JD via frontend
      const jdData = await analyzeJDText(jdText);

      // 2. Generate Report via frontend
      const reportData = await generateBridgeReport(selectedResume, jdData);

      // 3. Save to Firestore
      const report: AnalysisReport = {
        userId: auth.currentUser.uid,
        resumeId: selectedResumeId,
        jobTitle,
        company,
        matchScore: reportData.matchScore ?? reportData.match_score ?? reportData.score ?? 0,
        matchedSkills: reportData.matchedSkills ?? reportData.matched_skills ?? [],
        missingSkills: reportData.missingSkills ?? reportData.missing_skills ?? [],
        recommendations: reportData.recommendations ?? [],
        roadmap: {
          weeklyPlan: reportData.roadmap?.weeklyPlan ?? reportData.roadmap?.weekly_plan ?? [],
          milestones: reportData.roadmap?.milestones ?? []
        },
        courseSuggestions: reportData.courseSuggestions ?? reportData.course_suggestions ?? [],
        skillAssessment: reportData.skillAssessment ?? reportData.skill_assessment ?? null,
        categoryBreakdown: reportData.categoryBreakdown ?? reportData.category_breakdown ?? {},
        createdAt: new Date().toISOString(),
      };

      try {
        const docRef = await addDoc(collection(db, 'reports'), report);
        onComplete({ ...report, id: docRef.id });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'reports', auth, auth.currentUser.uid);
      }
    } catch (err: any) {
      console.error('Gap Analysis Error:', err);
      setError(`Skill Gap Analysis failed: ${err.message || 'Unknown error'}. Try providing a more detailed Job Description.`);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || !selectedResumeId || !jdText || !jobTitle;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Scan Job Opportunity</h2>
            <p className="text-slate-500">Match your profile with a specific role</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-medium">Cancel</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              1. Select Resume
            </h3>
            <div className="space-y-2">
              {resumes.length > 0 ? resumes.map(r => (
                <div 
                  key={r.id}
                  onClick={() => setSelectedResumeId(r.id!)}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all",
                    selectedResumeId === r.id 
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20" 
                      : "border-slate-100 hover:border-slate-300"
                  )}
                >
                  <p className="text-sm font-bold text-slate-900 truncate">{r.fileName}</p>
                  <p className="text-xs text-slate-500">{r.technicalSkills.length} skills detected</p>
                </div>
              )) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-sm text-slate-500 mb-2">No resumes found</p>
                  <button onClick={onCancel} className="text-xs font-bold text-blue-600">Go back and upload</button>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-400" />
              2. Basic Info
            </h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Job Title (e.g. Senior Frontend Engineer)"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input 
                type="text" 
                placeholder="Company Name"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <section className="bg-white p-6 rounded-3xl border border-slate-200 h-full flex flex-col">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-slate-400" />
              3. Paste Job Description
            </h3>
            <textarea 
              placeholder="Paste the full job description here... Our AI will extract requirements, skills, and experience levels for matching."
              className="flex-1 w-full p-4 bg-slate-50 border-none rounded-2xl resize-none text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[300px]"
              value={jdText}
              onChange={e => setJdText(e.target.value)}
            />
            
            {error && (
              <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 font-medium text-sm">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <button 
              onClick={startAnalysis}
              disabled={isButtonDisabled}
              className="mt-6 w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Bridge Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {!selectedResumeId ? 'Upload a resume first' : !jdText ? 'Paste Job Description' : !jobTitle ? 'Enter Job Title' : 'Run AI Gap Analysis'}
                </>
              )}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
