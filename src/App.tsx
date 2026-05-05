/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import Sidebar from './components/Sidebar';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import ResumeManager from './components/ResumeManager';
import { JobAnalysis } from './components/JobAnalysis';
import { ReportDetail } from './components/ReportDetail';
import { UserProfile, ResumeData, AnalysisReport } from './types';
import { LogOut, User as UserIcon, Loader2, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'upload' | 'analyze' | 'report'>('dashboard');
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this analysis report?')) return;
    try {
      console.log('Deleting report:', reportId);
      await deleteDoc(doc(db, 'reports', reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
        setCurrentView('dashboard');
      }
    } catch (err) {
      console.error('Delete report error:', err);
      handleFirestoreError(err, OperationType.DELETE, `reports/${reportId}`, auth);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!window.confirm('Are you sure you want to delete this resume? This will not delete associated reports, but they may lack context.')) return;
    try {
      console.log('Deleting resume:', resumeId);
      await deleteDoc(doc(db, 'resumes', resumeId));
    } catch (err) {
      console.error('Delete resume error:', err);
      handleFirestoreError(err, OperationType.DELETE, `resumes/${resumeId}`, auth);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'dashboard') setCurrentView('dashboard');
    if (tab === 'resumes') setCurrentView('upload');
    if (tab === 'analysis') setCurrentView('analyze');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync profile
        const userDoc = doc(db, 'users', user.uid);
        let snap;
        try {
          snap = await getDoc(userDoc);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`, auth, user.uid);
        }

        if (snap && !snap.exists()) {
          const newProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
          };
          try {
            await setDoc(userDoc, newProfile);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`, auth);
          }
          setProfile(newProfile as UserProfile);
        } else if (snap) {
          setProfile(snap.data() as UserProfile);
        }

        // Listen for resumes
        const resumesQuery = query(collection(db, 'resumes'), where('userId', '==', user.uid));
        const unsubResumes = onSnapshot(resumesQuery, (snapshot) => {
          const fetchedResumes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResumeData));
          setResumes(fetchedResumes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'resumes', auth, user.uid));

        // Listen for reports
        const reportsQuery = query(collection(db, 'reports'), where('userId', '==', user.uid));
        const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
          const fetchedReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnalysisReport));
          setReports(fetchedReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'reports', auth, user.uid));

        setLoading(false);
        return () => {
          unsubResumes();
          unsubReports();
        };
      } else {
        setProfile(null);
        setResumes([]);
        setReports([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Landing onLogin={signInWithGoogle} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={currentView === 'upload' ? 'resumes' : currentView === 'analyze' ? 'analysis' : 'dashboard'}
        onTabChange={handleTabChange}
        onLogout={logout}
        userEmail={user.email}
      />

      <main className="flex-1 ml-72 min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-8 py-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
              {currentView === 'dashboard' ? 'Overview' : 
               currentView === 'upload' ? 'Resume Management' : 
               currentView === 'analyze' ? 'Intelligence Lab' : 'Report Analysis'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none">{profile?.displayName || 'User'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Verified Member</p>
              </div>
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100" />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100">
                  <UserIcon className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-8 py-10">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Dashboard 
                  resumes={resumes} 
                  reports={reports} 
                  onNewAnalysis={() => setCurrentView('analyze')}
                  onDeleteReport={handleDeleteReport}
                  onViewReport={(report) => {
                    setSelectedReport(report);
                    setCurrentView('report');
                  }}
                />
              </motion.div>
            )}

            {currentView === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <ResumeManager 
                  resumes={resumes}
                  onDelete={handleDeleteResume}
                />
              </motion.div>
            )}

            {currentView === 'analyze' && (
              <motion.div
                key="analyze"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <JobAnalysis 
                  resumes={resumes}
                  onComplete={(report) => {
                    setSelectedReport(report);
                    setCurrentView('report');
                  }}
                  onCancel={() => setCurrentView('dashboard')}
                />
              </motion.div>
            )}

            {currentView === 'report' && selectedReport && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ReportDetail 
                  report={selectedReport} 
                  onBack={() => setCurrentView('dashboard')} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

