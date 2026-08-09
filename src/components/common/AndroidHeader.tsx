import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Search, Timer, Microscope, Cloud, RefreshCw, WifiOff, AlertTriangle, Sparkles, User, Sun, Moon } from 'lucide-react';

export const AndroidHeader: React.FC = () => {
  const { route, navigateBack, navigateTo, activeTimers, syncStatus, triggerCloudSync, userProfile, settings, updateSettings } = useApp();

  const isRootTab =
    route.type === 'HOME' ||
    route.type === 'PROJECTS' ||
    route.type === 'TOOLS' ||
    route.type === 'TIMERS' ||
    route.type === 'SETTINGS';

  let title = 'MTKMICRO LAB';
  if (route.type === 'PROJECTS') title = 'LAB PROJECTS';
  else if (route.type === 'TOOLS') title = 'CALCULATORS';
  else if (route.type === 'TIMERS') title = 'TIMER DASHBOARD';
  else if (route.type === 'SETTINGS') title = 'SETTINGS & CONFIG';
  else if (route.type === 'PROJECT_DETAIL') title = 'PROJECT DETAIL';
  else if (route.type === 'CREATE_PROJECT') title = 'NEW PROJECT';
  else if (route.type === 'EDIT_PROJECT') title = 'EDIT PROJECT';
  else if (route.type === 'SEARCH') title = 'SEARCH LAB';
  else if (route.type === 'AUTH') title = route.subView === 'PROFILE' ? 'USER PROFILE' : 'ACCOUNT & AUTH';
  else if (route.type === 'AI_SCANNER') title = 'AI PROTOCOL SCAN';
  else if (route.type === 'AI_ASSISTANT') title = 'MTKMICRO AI';
  else if (route.type === 'PROTOCOLS') title = 'PROTOCOL LIBRARY';
  else if (route.type === 'REPORT_GENERATOR') title = 'LAB REPORT GEN';
  else if (route.type === 'CALENDAR') title = 'LAB CALENDAR';
  else if (route.type === 'PRIVACY') title = 'PRIVACY CENTER';
  else if (route.type === 'BACKUP_RESTORE') title = 'BACKUP & RESTORE';
  else if (route.type === 'CALCULATOR') {
    const map: Record<string, string> = {
      molarity: 'MOLARITY CALC',
      dilution: 'DILUTION (C1V1)',
      serial_dilution: 'SERIAL DILUTION',
      master_mix: 'MASTER MIX',
      buffer: 'BUFFER PREP',
      unit_converter: 'UNIT CONVERTER',
      scientific: 'SCIENTIFIC CALC',
      colony_counter: 'COLONY COUNTER',
      plate_labelling: 'PLATE LABELLER',
      gel_annotator: 'GEL ANNOTATOR',
      image_measurer: 'IMAGE MEASURER',
      calibration_curve: 'CALIBRATION CURVE',
      cell_counter: 'CELL COUNTER',
      blood_cell_counter: 'BLOOD COUNTER',
      cell_culture_tracker: 'CELL CULTURE',
      custom_counter: 'CUSTOM COUNTER',
    };
    title = map[route.toolId] || 'CALCULATOR';
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-md border-b-2 border-slate-900 dark:border-white/10 transition-colors">
      {/* Top Status Simulation Bar */}
      <div className="h-6 px-3 flex items-center justify-between text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-black/60 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-1.5">
          <Microscope className="w-3 h-3 text-teal-600 dark:text-teal-400" />
          <span>MTKMICRO V3.0</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          {/* Cloud Sync Status Indicator */}
          <button
            onClick={triggerCloudSync}
            title="Click to Sync Cloud Data"
            className="flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            {syncStatus === 'SYNCED' && <Cloud className="w-3 h-3 text-emerald-500" />}
            {syncStatus === 'SYNCING' && <RefreshCw className="w-3 h-3 text-teal-500 animate-spin" />}
            {syncStatus === 'OFFLINE' && <WifiOff className="w-3 h-3 text-amber-500" />}
            {syncStatus === 'SYNC_FAILED' && <AlertTriangle className="w-3 h-3 text-rose-500" />}
            <span className="hidden sm:inline">{syncStatus}</span>
          </button>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="h-14 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {!isRootTab ? (
            <button
              onClick={navigateBack}
              className="p-1.5 rounded-xl text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-white/20"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black shadow-sm">
              <Microscope className="w-4 h-4" />
            </div>
          )}
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase text-slate-900 dark:text-white leading-none">
              {title}
            </h1>
            {isRootTab && route.type === 'HOME' && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-[1px] w-3 bg-teal-600 dark:bg-teal-400"></div>
                <span className="text-[8px] font-mono uppercase tracking-[0.25em] font-bold text-teal-600 dark:text-teal-400">
                  SMART LAB COMPANION
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Active Timers Badge Button */}
          {(activeTimers || []).length > 0 && route.type !== 'TIMERS' && (
            <button
              onClick={() => navigateTo({ type: 'TIMERS', tab: 'ACTIVE' })}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-500/10 dark:bg-teal-400/10 border border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300 text-[9px] font-black uppercase tracking-wider animate-pulse cursor-pointer"
            >
              <Timer className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              <span>{(activeTimers || []).length} RUNNING</span>
            </button>
          )}

          {/* MTKmicro AI Assistant shortcut */}
          {route.type !== 'AI_ASSISTANT' && (
            <button
              onClick={() => navigateTo({ type: 'AI_ASSISTANT' })}
              title="Open MTKmicro AI"
              className="p-1.5 rounded-xl bg-gradient-to-r from-teal-500/10 to-indigo-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 transition-colors cursor-pointer border border-teal-500/30"
            >
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 stroke-[2.5]" />
            </button>
          )}

          {/* Quick Theme Toggle */}
          <button
            onClick={() => {
              const nextTheme = settings.theme === 'DARK' ? 'LIGHT' : 'DARK';
              updateSettings({ theme: nextTheme });
            }}
            title={`Switch to ${settings.theme === 'DARK' ? 'Light' : 'Dark'} Mode`}
            className="p-1.5 rounded-xl text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
            aria-label="Toggle Theme"
          >
            {settings.theme === 'DARK' ? (
              <Sun className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 stroke-[2.5]" />
            )}
          </button>

          {/* User Profile / Auth Button */}
          <button
            onClick={() => navigateTo({ type: 'AUTH', subView: 'PROFILE' })}
            title={userProfile.name || 'User Profile'}
            className="p-1.5 rounded-xl text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
          >
            <User className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Search Button */}
          {route.type !== 'SEARCH' && (
            <button
              onClick={() => navigateTo({ type: 'SEARCH' })}
              className="p-1.5 rounded-xl text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
