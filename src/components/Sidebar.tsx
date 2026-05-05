import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Settings, 
  LogOut, 
  Zap,
  BarChart3,
  UserCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: 'dashboard' | 'resumes' | 'analysis';
  onTabChange: (tab: any) => void;
  onLogout: () => void;
  userEmail?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout, userEmail }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resumes', label: 'My Resumes', icon: FileText },
    { id: 'analysis', label: 'New Analysis', icon: Zap },
  ];

  return (
    <div className="w-72 h-screen fixed left-0 top-0 bg-slate-900 text-white flex flex-col z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Bridge AI</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600 rounded-2xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-6">
        <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border-2 border-white/10">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Talent</p>
              <p className="text-sm font-bold truncate text-slate-200">{userEmail?.split('@')[0] || 'User'}</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
            "Your potential is limited only by your imagination."
          </p>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all group font-bold text-sm"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
