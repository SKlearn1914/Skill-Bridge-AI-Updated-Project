import { motion } from 'framer-motion';
import { LogIn, Sparkles, Target, TrendingUp, ShieldCheck } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
}

export function Landing({ onLogin }: LandingProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Career Accelerator
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              Bridge the Gap to Your <span className="text-blue-600">Dream Job</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Upload your resume and get an instant AI-powered skill gap analysis. Optimize your resume for ATS, identify missing skills, and get a personalized learning roadmap.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Sign in with Google
              </button>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
                <div className="flex items-center ml-4 text-sm font-medium text-slate-500">
                  Joined by 10,000+ job seekers
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Features */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Skill Gap Analysis</h3>
            <p className="text-slate-600 leading-relaxed">
              We compare your resume against specific job descriptions to find exactly what technical and soft skills you are missing.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">ATS Optimization</h3>
            <p className="text-slate-600 leading-relaxed">
              Get personalized suggestions to improve your resume's searchability and matching score for Applicant Tracking Systems.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Learning Roadmap</h3>
            <p className="text-slate-600 leading-relaxed">
              Don't just find the gaps—fill them with prioritized learning goals and recommended courses from top platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
