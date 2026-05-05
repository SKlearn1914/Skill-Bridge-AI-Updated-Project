import { ResumeData, AnalysisReport } from '../types';
import { Plus, BarChart3, FileText, ClipboardList, Clock, ArrowRight, TrendingUp, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface DashboardProps {
  resumes: ResumeData[];
  reports: AnalysisReport[];
  onNewAnalysis: () => void;
  onViewReport: (report: AnalysisReport) => void;
  onDeleteReport: (reportId: string) => void;
}

export function Dashboard({ resumes, reports, onNewAnalysis, onViewReport, onDeleteReport }: DashboardProps) {
  // Sort reports chronologically
  const sortedReports = [...reports].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  // Get unique resume names for the legend
  const resumeMap = new Map(resumes.map(r => [r.id, r.fileName]));
  const activeResumeNames = Array.from(new Set(reports.map(r => resumeMap.get(r.resumeId) || 'Unknown CV')));
  
  // Create a combined data set for the chart
  // We want each point on the X-axis to potentially show values for all CVs if they had an analysis at that time
  const chartData = sortedReports.map((r, idx) => {
    const resumeName = resumeMap.get(r.resumeId) || 'Unknown CV';
    const dataPoint: any = {
      date: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' }),
      fullDate: new Date(r.createdAt).toLocaleString(),
      job: r.jobTitle,
      // For line continuity, we could carry over the previous score for this resume
      // But for accuracy, we just set the current one
      [resumeName]: r.matchScore
    };
    return dataPoint;
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h2>
          <p className="text-slate-500 font-medium">Strategic overview of your market positioning and skill gaps.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewAnalysis}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
        >
          <Plus className="w-5 h-5" />
          Intelligence Scan
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-100/20 transition-all group"
        >
          <div className="flex items-center gap-5 mb-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Assets</p>
              <h4 className="text-2xl font-black text-slate-900">{resumes.length} CVs</h4>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100/20 transition-all group"
        >
          <div className="flex items-center gap-5 mb-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Insights</p>
              <h4 className="text-2xl font-black text-slate-900">{reports.length} Scans</h4>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-100/20 transition-all group"
        >
          <div className="flex items-center gap-5 mb-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Alignment</p>
              <h4 className="text-2xl font-black text-slate-900">
                {reports.length > 0 
                  ? Math.round(reports.reduce((acc, r) => acc + r.matchScore, 0) / reports.length) 
                  : 0}%
              </h4>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 rounded-xl">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              Strategic Activity
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-hide">
            {reports.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {reports.map((report, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={report.id} 
                    className="p-8 hover:bg-slate-50/50 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div 
                      className="flex-1 min-w-0 pr-4"
                      onClick={() => {
                        console.log('Viewing report:', report.id);
                        onViewReport(report);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase border border-blue-100">
                          {resumeMap.get(report.resumeId)?.split('.')[0] || 'CV'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          {formatDistanceToNow(new Date(report.createdAt))} ago
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{report.jobTitle}</h4>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">{report.company}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className={`text-xl font-black ${report.matchScore >= 80 ? 'text-emerald-600' : report.matchScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {report.matchScore}%
                        </span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-50 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${report.matchScore}%` }}
                            className={`h-full rounded-full ${report.matchScore >= 80 ? 'bg-emerald-500' : report.matchScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteReport(report.id!);
                          }}
                          className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-rose-100"
                          title="Purge analysis"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                        <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <ClipboardList className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Intelligence Silence</h4>
                <p className="text-slate-500 text-sm mt-2 font-medium">Initiate an Analysis Scan to see your results here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Match Progress Chart */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full -mr-40 -mt-40" />
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-inner">
                <BarChart3 className="w-5 h-5" />
              </div>
              Comparison Metrics
            </h3>
            <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Live Skill Index Evolution
            </div>
          </div>

          <div className="flex-1 min-h-[350px] relative z-10">
            {reports.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} 
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                      padding: '20px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)'
                    }}
                    itemStyle={{ fontWeight: 900, fontSize: '13px' }}
                    labelStyle={{ fontWeight: 700, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '0px', paddingBottom: '30px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}
                  />
                  {activeResumeNames.map((resumeName, index) => {
                    return (
                      <Line 
                        key={resumeName}
                        type="monotone" 
                        dataKey={resumeName} 
                        stroke={COLORS[index % COLORS.length]} 
                        strokeWidth={4}
                        dot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: COLORS[index % COLORS.length] }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                        animationDuration={1500}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <BarChart3 className="w-12 h-12 opacity-20" />
                <p className="font-bold text-sm">Awaiting comparative data points...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
