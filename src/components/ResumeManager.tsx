import React, { useState } from 'react';
import { ResumeData } from '../types';
import { FileText, Trash2, Plus, Calendar, ShieldCheck, Download, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeUpload } from './ResumeUpload';

interface ResumeManagerProps {
  resumes: ResumeData[];
  onDelete: (id: string) => void;
}

const ResumeManager: React.FC<ResumeManagerProps> = ({ resumes, onDelete }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDownload = (resume: ResumeData) => {
    console.log('Downloading resume text for:', resume.fileName);
    if (!resume.rawText) {
      alert('Error: No text was extracted for this resume, so there is nothing to download.');
      return;
    }
    const blob = new Blob([resume.rawText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.fileName.split('.')[0]}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredResumes = resumes.filter(r => 
    r.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.technicalSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (showUpload) {
    return <ResumeUpload onComplete={() => setShowUpload(false)} onCancel={() => setShowUpload(false)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vetted Resumes</h2>
          <p className="text-slate-500 font-medium">Manage your professional digital assets and skill extractions.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Add New Resume
        </motion.button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input 
          type="text"
          placeholder="Search by filename or skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm outline-none font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredResumes.map((resume, idx) => (
            <motion.div
              layout
              key={resume.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 p-8 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-inner">
                    <FileText className="w-8 h-8" />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (resume.id) {
                        onDelete(resume.id);
                      }
                    }}
                    className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2 truncate" title={resume.fileName}>
                  {resume.fileName}
                </h3>
                
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDistanceToNow(new Date(resume.createdAt))} ago
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {resume.technicalSkills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                      {skill}
                    </span>
                  ))}
                  {resume.technicalSkills.length > 4 && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                      +{resume.technicalSkills.length - 4} More
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider italic">Verified Analysis</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDownload(resume)}
                    className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Download extracted text"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredResumes.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No resumes found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or add a new resume.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeManager;
