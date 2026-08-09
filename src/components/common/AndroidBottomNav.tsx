import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, FolderKanban, Calculator, Timer, Settings } from 'lucide-react';

export const AndroidBottomNav: React.FC = () => {
  const { route, navigateTo, activeTimers } = useApp();

  const activeTab =
    route.type === 'HOME'
      ? 'HOME'
      : route.type === 'PROJECTS' || route.type === 'PROJECT_DETAIL' || route.type === 'CREATE_PROJECT' || route.type === 'EDIT_PROJECT'
      ? 'PROJECTS'
      : route.type === 'TOOLS' || route.type === 'CALCULATOR'
      ? 'TOOLS'
      : route.type === 'TIMERS'
      ? 'TIMERS'
      : route.type === 'SETTINGS' || route.type === 'ABOUT'
      ? 'SETTINGS'
      : 'HOME';

  const navItems = [
    { id: 'HOME', label: 'HOME', icon: Home, action: () => navigateTo({ type: 'HOME' }) },
    { id: 'PROJECTS', label: 'PROJECTS', icon: FolderKanban, action: () => navigateTo({ type: 'PROJECTS' }) },
    { id: 'TOOLS', label: 'TOOLS', icon: Calculator, action: () => navigateTo({ type: 'TOOLS' }) },
    { id: 'TIMERS', label: 'TIMERS', icon: Timer, badge: (activeTimers || []).length, action: () => navigateTo({ type: 'TIMERS' }) },
    { id: 'SETTINGS', label: 'CONFIG', icon: Settings, action: () => navigateTo({ type: 'SETTINGS' }) },
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-md border-t-2 border-slate-900 dark:border-white/10 py-2 px-3">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400 font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {/* Active pill indicator */}
              <div
                className={`flex items-center justify-center w-11 h-7 rounded-lg mb-1 transition-all ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black border border-slate-900 dark:border-white'
                    : 'bg-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 stroke-[2.5] ${isActive ? 'scale-110' : ''} transition-transform`} />
              </div>
              <span className="text-[9px] font-black tracking-wider uppercase leading-none">{item.label}</span>

              {/* Badge for active running timers */}
              {item.badge ? (
                <span className="absolute top-0 right-2 w-4 h-4 bg-teal-500 text-black font-black rounded-md text-[9px] flex items-center justify-center shadow-sm border border-black/20">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
