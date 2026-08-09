import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LabTimer } from '../../types';
import { MtkCard } from '../common/MtkCard';
import { EmptyState } from '../common/EmptyState';
import { CreateTimerModal } from './CreateTimerModal';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Square,
  Plus,
  Trash2,
  Folder,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface Props {
  initialTab?: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
}

export const TimersDashboardScreen: React.FC<Props> = ({ initialTab = 'ACTIVE' }) => {
  const {
    activeTimers,
    upcomingTimers,
    completedTimers,
    startTimer,
    pauseTimer,
    resetTimer,
    stopTimer,
    deleteTimer,
    projects,
    openProjectDetail,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'UPCOMING' | 'COMPLETED'>(initialTab);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatMs = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const safeActiveTimers = activeTimers || [];
  const safeUpcomingTimers = upcomingTimers || [];
  const safeCompletedTimers = completedTimers || [];

  return (
    <div className="space-y-4 pb-20">
      {/* Tab Selector Row */}
      <div className="grid grid-cols-3 gap-1 bg-slate-200 dark:bg-[#121215] p-1.5 rounded-xl border-2 border-slate-900 dark:border-white/20">
        {[
          { id: 'ACTIVE', label: 'ACTIVE', count: safeActiveTimers.length },
          { id: 'UPCOMING', label: 'UPCOMING', count: safeUpcomingTimers.length },
          { id: 'COMPLETED', label: 'COMPLETED', count: safeCompletedTimers.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'ACTIVE' | 'UPCOMING' | 'COMPLETED')}
            className={`py-2 px-3 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-black ${
                activeTab === tab.id
                  ? 'bg-teal-400 text-black'
                  : 'bg-slate-300 dark:bg-white/10 text-slate-900 dark:text-slate-200'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: ACTIVE TIMERS */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-3">
          {activeTimers.length === 0 ? (
            <EmptyState
              icon={Timer}
              title="No active timers running"
              subtitle="Start a timer from the upcoming list or create a new custom countdown or stopwatch."
              actionLabel="New Timer"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            activeTimers.map(timer => {
              const project = timer.projectId ? projects.find(p => p.id === timer.projectId) : null;
              const isRunning = timer.status === 'RUNNING';
              const progressPct =
                timer.type === 'COUNTDOWN' && timer.totalDurationMs > 0
                  ? Math.min(100, Math.max(0, ((timer.totalDurationMs - timer.remainingMs) / timer.totalDurationMs) * 100))
                  : 100;

              return (
                <MtkCard
                  key={timer.id}
                  className="p-5 border-teal-300 dark:border-teal-800 bg-white dark:bg-slate-900 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                          {timer.type}
                        </span>
                        {project && (
                          <button
                            onClick={() => openProjectDetail(project.id)}
                            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Folder className="w-3 h-3" /> {project.name}
                          </button>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{timer.name}</h3>
                    </div>

                    <button
                      onClick={() => deleteTimer(timer.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Timer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Countdown Big Display */}
                  <div className="flex items-center justify-between my-3">
                    <div className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">
                      {timer.type === 'COUNTDOWN' ? formatMs(timer.remainingMs) : formatMs(timer.elapsedMs)}
                    </div>
                    <span
                      className={`text-[10px] font-black font-mono tracking-wider px-2.5 py-1 rounded-md uppercase border ${
                        isRunning
                          ? 'bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-500 animate-pulse'
                          : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500'
                      }`}
                    >
                      {isRunning ? 'RUNNING' : 'PAUSED'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {timer.type === 'COUNTDOWN' && (
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4">
                      <div
                        className="bg-teal-500 h-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  )}

                  {/* Control Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {isRunning ? (
                      <button
                        onClick={() => pauseTimer(timer.id)}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Pause className="w-4 h-4" /> Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => startTimer(timer.id)}
                        className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Play className="w-4 h-4" /> Resume
                      </button>
                    )}

                    <button
                      onClick={() => resetTimer(timer.id)}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Reset
                    </button>

                    <button
                      onClick={() => stopTimer(timer.id)}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Square className="w-4 h-4" /> Finish
                    </button>
                  </div>
                </MtkCard>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: UPCOMING TIMERS */}
      {activeTab === 'UPCOMING' && (
        <div className="space-y-3">
          {upcomingTimers.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No upcoming timers"
              subtitle="All timers are currently running or completed."
              actionLabel="New Timer"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            upcomingTimers.map(timer => {
              const project = timer.projectId ? projects.find(p => p.id === timer.projectId) : null;

              return (
                <MtkCard key={timer.id} className="p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{timer.name}</h4>
                      {project && (
                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">Project: {project.name}</p>
                      )}
                      <p className="text-xs font-mono text-slate-500 mt-1">
                        Duration: {formatMs(timer.totalDurationMs)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          startTimer(timer.id);
                          setActiveTab('ACTIVE');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Start
                      </button>
                      <button
                        onClick={() => deleteTimer(timer.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </MtkCard>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED TIMERS */}
      {activeTab === 'COMPLETED' && (
        <div className="space-y-3">
          {completedTimers.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No completed timers"
              subtitle="Completed laboratory timers will appear here."
            />
          ) : (
            completedTimers.map(timer => (
              <MtkCard key={timer.id} className="p-4 border bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-0.5">
                      <CheckCircle className="w-4 h-4" /> Completed
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{timer.name}</h4>
                    {timer.completedAt && (
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Finished at: {new Date(timer.completedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        resetTimer(timer.id);
                        setActiveTab('UPCOMING');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Re-use
                    </button>
                    <button
                      onClick={() => deleteTimer(timer.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </MtkCard>
            ))
          )}
        </div>
      )}

      {/* FAB "+ New Timer" */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-5 bottom-20 z-30 flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black border-2 border-slate-900 dark:border-white font-black uppercase text-xs tracking-wider shadow-xl transition-all cursor-pointer hover:bg-teal-600 dark:hover:bg-teal-400"
        aria-label="Create Timer"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
        <span>NEW TIMER</span>
      </button>

      <CreateTimerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
