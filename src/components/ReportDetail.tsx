import { AnalysisReport } from '../types';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, ExternalLink, Calendar, Trophy, ChevronRight, 
  BookOpen, Clock, Target, Video, FileText, Book, Globe 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ReportDetailProps {
  report: AnalysisReport;
  onBack: () => void;
}

export function ReportDetail({ report, onBack }: ReportDetailProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const chartData = report.categoryBreakdown ? Object.entries(report.categoryBreakdown).map(([name, value]) => ({
    name,
    value
  })) : [
    { name: 'Technical', value: report.matchScore },
    { name: 'Soft Skills', value: Math.max(0, report.matchScore - 5) },
    { name: 'Experience', value: Math.max(0, report.matchScore - 10) },
    { name: 'Education', value: Math.max(0, report.matchScore + 5) }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const getResourceIcon = (type?: string) => {
    switch (type) {
      case 'video': return <Video className="w-6 h-6" />;
      case 'article': return <FileText className="w-6 h-6" />;
      case 'book': return <Book className="w-6 h-6" />;
      case 'blog': return <Globe className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  const getResourceColor = (type?: string) => {
    switch (type) {
      case 'video': return 'bg-rose-50 text-rose-600 group-hover:bg-rose-600';
      case 'article': return 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600';
      case 'book': return 'bg-amber-50 text-amber-600 group-hover:bg-amber-600';
      case 'blog': return 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600';
      default: return 'bg-blue-50 text-blue-600 group-hover:bg-blue-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50">
        {/* Header Section */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
          <div className="flex flex-col lg:flex-row justify-between gap-12">
            <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center px-4 py-1.5 bg-blue-600/10 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-blue-600/20">
                Strategic Gap Analysis
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  {report.jobTitle}
                </h2>
                <p className="text-2xl font-bold text-slate-400 mt-2">{report.company}</p>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-600">
                    Generated {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <Target className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-widest leading-none">
                    Verified by Gemini AI
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black text-slate-900">{report.matchScore}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match Score</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 max-w-[300px]">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* Skills Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-12">
              {/* Matched Skills */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    Matched Assets
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {report.matchedSkills.length} Found
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.matchedSkills.map((skill, i) => (
                    <motion.span 
                      key={i} 
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all hover:border-emerald-300 hover:shadow-emerald-100"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </section>

              {/* Strategic Skill Tiers */}
              {report.skillAssessment && (
                <section className="space-y-8 pt-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Strategic Proficiency Matrix</h3>
                    <p className="text-slate-500 text-sm font-medium">Deep dive into how your specific skills align with employer expectations.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Strong Points */}
                    <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 space-y-4">
                      <div className="flex items-center gap-3 text-emerald-700">
                        <Trophy className="w-5 h-5" />
                        <h4 className="font-black text-sm uppercase tracking-widest">Power Assets (Strong)</h4>
                      </div>
                      <div className="grid gap-3">
                        {report.skillAssessment.strongPoints.map((point, i) => (
                          <div key={i} className="bg-white p-4 rounded-2xl border border-emerald-100/50 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-slate-900">{point.skill}</span>
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 uppercase">Level {point.level}/10</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-3">{point.impact}</p>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${point.level * 10}%` }}
                                className="h-full bg-emerald-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Medium Points */}
                    <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 space-y-4">
                      <div className="flex items-center gap-3 text-amber-700">
                        <Target className="w-5 h-5" />
                        <h4 className="font-black text-sm uppercase tracking-widest">Growth Zones (Medium)</h4>
                      </div>
                      <div className="grid gap-3">
                        {report.skillAssessment.mediumPoints.map((point, i) => (
                          <div key={i} className="bg-white p-4 rounded-2xl border border-amber-100/50 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-slate-900">{point.skill}</span>
                              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 uppercase">{point.currentProgress}% Ready</span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium mb-1">Impact: <span className="text-slate-500 font-normal">{point.impact}</span></p>
                            <p className="text-xs text-amber-700 font-medium mb-3">Goal: <span className="text-amber-600 font-normal">{point.improvementNeeded}</span></p>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${point.currentProgress}%` }}
                                className="h-full bg-amber-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weak Points */}
                    <div className="p-6 bg-rose-50/50 rounded-3xl border border-rose-100 space-y-4">
                      <div className="flex items-center gap-3 text-rose-700">
                        <AlertCircle className="w-5 h-5" />
                        <h4 className="font-black text-sm uppercase tracking-widest">Critical Gaps (Weak)</h4>
                      </div>
                      <div className="grid gap-3">
                        {report.skillAssessment.weakPoints.map((point, i) => (
                          <div key={i} className="bg-white p-4 rounded-2xl border border-rose-100/50 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-slate-900">{point.skill}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase ${
                                point.priority === 'High' ? 'bg-rose-600 text-white border-rose-700' : 'bg-rose-50 text-rose-600 border-rose-100'
                              }`}>
                                {point.priority} Priority
                              </span>
                            </div>
                            <p className="text-xs text-rose-600 font-medium mb-1">The Risk: <span className="text-slate-500 font-normal">{point.impact}</span></p>
                            <p className="text-xs text-slate-800 font-bold mb-0">Strategy: <span className="text-slate-500 font-normal">{point.improvementNeeded}</span></p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Missing Skills */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    Identified Gaps
                  </h3>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                    {report.missingSkills.length} Needed
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.missingSkills.map((skill, i) => (
                    <motion.span 
                      key={i} 
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-100 shadow-sm transition-all hover:border-rose-300 hover:shadow-rose-100"
                    >
                      {skill}
                    </motion.span>
                  ))}
                  {report.missingSkills.length === 0 && (
                    <div className="w-full p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 font-bold text-center">
                      Exceptional! No major skill gaps identified.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Recommendations Column */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
              <div className="relative z-10 space-y-8">
                <h3 className="text-2xl font-black flex items-center gap-3 italic italic tracking-tight">
                  <Trophy className="w-7 h-7 text-amber-400" />
                  PRO RECOMMENDATIONS
                </h3>
                <div className="space-y-6">
                  {report.recommendations.map((rec, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        {rec}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="my-16 border-dashed border-slate-200" />

          {/* Learning Roadmap */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">Personalized Growth Roadmap</h3>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                Follow this AI-generated sequence to systematically acquire missing skills and outshine other candidates.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Weekly Action Plan */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Execution Phase</h4>
                </div>
                <div className="space-y-4 relative">
                  <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-100" />
                  {report.roadmap.weeklyPlan.map((step, i) => (
                    <motion.div 
                      key={i} 
                      className="relative z-10 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center font-black text-base border border-slate-100">
                        0{i + 1}
                      </span>
                      <p className="text-slate-600 text-sm leading-relaxed font-semibold italic italic">
                        {step}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-100">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Success Milestones</h4>
                </div>
                <div className="grid gap-4">
                  {report.roadmap.milestones.map((ms, i) => (
                    <div key={i} className="group p-6 bg-gradient-to-r from-amber-50 to-white rounded-2xl border border-amber-100 flex items-center gap-6 hover:from-amber-100 transition-all">
                      <div className="w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-50" />
                      <p className="font-bold text-slate-800 tracking-tight leading-none">{ms}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="my-16 border-dashed border-slate-200" />

          {/* Education & Resources */}
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Upskilling Resources</h3>
                <p className="text-slate-500 font-medium italic">Hand-picked courses to help you master identified skills.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {report.courseSuggestions.map((course, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl border border-slate-200 p-8 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 flex flex-col h-full group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl transition-colors duration-500 ${getResourceColor(course.type)}`}>
                      <div className="group-hover:text-white transition-colors">
                        {getResourceIcon(course.type)}
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-slate-100">
                      {course.platform}
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {course.title}
                  </h4>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
                    {course.reason}
                  </p>
                  
                  <div className="mt-auto">
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors group/btn">
                      {course.type === 'video' ? 'Watch Video' : 
                       course.type === 'book' ? 'Read Book' : 
                       course.type === 'article' || course.type === 'blog' ? 'Read Full' : 'Enroll Now'}
                      <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </button>
                    {course.urlHint && (
                      <p className="text-[10px] text-slate-400 text-center mt-3 font-bold uppercase tracking-widest">
                        Source: {course.urlHint}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
