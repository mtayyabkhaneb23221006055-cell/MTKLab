import React from 'react';
import { useApp } from '../../context/AppContext';
import { MtkCard } from '../common/MtkCard';
import { StatusChip, TagChip } from '../common/TagChip';
import { EmptyState } from '../common/EmptyState';
import {
  PlusCircle,
  Play,
  Pause,
  Square,
  Timer as TimerIcon,
  FlaskConical,
  Atom,
  Dna,
  Scale,
  FolderKanban,
  Clock,
  ArrowRight,
  Microscope,
  Sparkles,
  Bot,
  BookOpen,
  Calendar as CalendarIcon,
  FileText,
  Cloud,
  ShieldAlert,
} from 'lucide-react';
import { formatScientific } from '../../utils/calculatorLogic';

export const DashboardScreen: React.FC = () => {
  const {
    projects,
    activeTimers,
    upcomingTimers,
    navigateTo,
    openProjectDetail,
    pauseTimer,
    startTimer,
    stopTimer,
    saveTimer,
  } = useApp();

  const safeProjects = projects || [];
  const safeActiveTimers = activeTimers || [];
  const safeUpcomingTimers = upcomingTimers || [];

  const recentProjects = [...safeProjects].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

  // Dynamic Greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Format time remaining for timer card
  const formatTimerMs = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const quickTools = [
    {
      id: 'food_safety',
      name: 'Food Safety',
      desc: 'Phase 4 Engine',
      icon: ShieldAlert,
      action: () => navigateTo({ type: 'FOOD_SAFETY' }),
      color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    },
    {
      id: 'new_project',
      name: 'New Project',
      desc: 'Start protocol',
      icon: PlusCircle,
      action: () => navigateTo({ type: 'CREATE_PROJECT' }),
      color: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    },
    {
      id: 'start_timer',
      name: 'Start Timer',
      desc: 'Quick timer',
      icon: TimerIcon,
      action: () => {
        // Quick 15 min countdown timer
        saveTimer({
          name: 'Quick Lab Timer',
          type: 'COUNTDOWN',
          totalDurationMs: 15 * 60 * 1000,
          remainingMs: 15 * 60 * 1000,
          elapsedMs: 0,
          status: 'RUNNING',
          startedAtMs: Date.now(),
          projectId: null,
          stepId: null,
        });
        navigateTo({ type: 'TIMERS', tab: 'ACTIVE' });
      },
      color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    {
      id: 'dilution',
      name: 'Dilution',
      desc: 'C1V1 = C2V2',
      icon: FlaskConical,
      action: () => navigateTo({ type: 'CALCULATOR', toolId: 'dilution' }),
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    },
    {
      id: 'molarity',
      name: 'Molarity',
      desc: 'Mass, MW, Vol',
      icon: Atom,
      action: () => navigateTo({ type: 'CALCULATOR', toolId: 'molarity' }),
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'master_mix',
      name: 'Master Mix',
      desc: 'PCR assembly',
      icon: Dna,
      action: () => navigateTo({ type: 'CALCULATOR', toolId: 'master_mix' }),
      color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    },
    {
      id: 'unit_converter',
      name: 'Unit Converter',
      desc: 'Mass, Vol, Conc',
      icon: Scale,
      action: () => navigateTo({ type: 'CALCULATOR', toolId: 'unit_converter' }),
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
  ];

  // Phase 3 Intelligence Shortcuts
  const phase3Shortcuts = [
    {
      name: 'AI Scanner',
      desc: 'Scan protocol',
      icon: Sparkles,
      action: () => navigateTo({ type: 'AI_SCANNER' }),
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/30',
    },
    {
      name: 'AI Assistant',
      desc: 'Lab Co-pilot',
      icon: Bot,
      action: () => navigateTo({ type: 'AI_ASSISTANT' }),
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
    },
    {
      name: 'Protocols',
      desc: 'SOP library',
      icon: BookOpen,
      action: () => navigateTo({ type: 'PROTOCOL_LIBRARY' }),
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
    },
    {
      name: 'Schedule',
      desc: 'Lab calendar',
      icon: CalendarIcon,
      action: () => navigateTo({ type: 'CALENDAR' }),
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30',
    },
    {
      name: 'Lab Report',
      desc: 'Print PDF',
      icon: FileText,
      action: () => navigateTo({ type: 'REPORTS' }),
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    },
    {
      name: 'Cloud Vault',
      desc: 'Sync & Backup',
      icon: Cloud,
      action: () => navigateTo({ type: 'BACKUP' }),
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30',
    },
  ];

  // Upcoming non-running 5 timers
  const upcomingList = safeUpcomingTimers.slice(0, 5);

  return (
    <div className="space-y-6 pb-8">
      {/* Greeting Banner */}
      <div className="bg-slate-900 dark:bg-[#121215] text-white rounded-2xl p-4 sm:p-6 border-2 border-slate-900 dark:border-white/20 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-teal-400">
              MTKMICRO LAB PLATFORM
            </span>
          </div>
          <h2 className="text-base sm:text-2xl font-extrabold tracking-tight text-white leading-tight uppercase">
            {getGreeting()}, Researcher
          </h2>
          <p className="text-xs text-slate-300 font-medium max-w-sm leading-relaxed">
            AI-assisted protocol extraction, multi-timer monitoring, and laboratory intelligence.
          </p>
        </div>
        <Microscope className="absolute -right-4 -bottom-6 w-28 h-28 sm:w-36 sm:h-36 text-white/5 pointer-events-none stroke-[1]" />
      </div>

      {/* LAB INTELLIGENCE & CONNECTED HUB */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xs font-black tracking-[0.2em] uppercase text-slate-900 dark:text-white">
              LAB INTELLIGENCE & CONNECTED HUB
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {phase3Shortcuts.map((sc, idx) => {
            const Icon = sc.icon;
            return (
              <button
                key={idx}
                onClick={sc.action}
                className="p-3 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 hover:border-teal-500/50 transition-all text-left flex flex-col justify-between space-y-2 shadow-xs cursor-pointer group"
              >
                <div className={`p-2 rounded-xl w-fit ${sc.color} border group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white leading-tight">{sc.name}</h4>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">{sc.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 1: ACTIVE TIMERS */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-4 h-4 text-teal-600 dark:text-teal-400 stroke-[2.5]" />
            <h3 className="text-xs font-black tracking-[0.2em] uppercase text-slate-900 dark:text-white">
              ACTIVE TIMERS
            </h3>
          </div>
          {safeActiveTimers.length > 0 && (
            <button
              onClick={() => navigateTo({ type: 'TIMERS', tab: 'ACTIVE' })}
              className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              SEE ALL ({safeActiveTimers.length}) <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          )}
        </div>

        {safeActiveTimers.length === 0 ? (
          <EmptyState
            icon={TimerIcon}
            title="No active timers"
            subtitle="Start a timer from a protocol step or create a quick timer."
            actionLabel="Start Quick Timer"
            onAction={() => {
              saveTimer({
                name: 'Incubation Timer',
                type: 'COUNTDOWN',
                totalDurationMs: 10 * 60 * 1000,
                remainingMs: 10 * 60 * 1000,
                elapsedMs: 0,
                status: 'RUNNING',
                startedAtMs: Date.now(),
                projectId: null,
                stepId: null,
              });
              navigateTo({ type: 'TIMERS', tab: 'ACTIVE' });
            }}
          />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {activeTimers.map(timer => {
              const project = timer.projectId ? projects.find(p => p.id === timer.projectId) : null;
              const isRunning = timer.status === 'RUNNING';
              const progressPct =
                timer.type === 'COUNTDOWN' && timer.totalDurationMs > 0
                  ? Math.min(100, Math.max(0, ((timer.totalDurationMs - timer.remainingMs) / timer.totalDurationMs) * 100))
                  : 100;

              return (
                <div
                  key={timer.id}
                  className="min-w-[260px] max-w-[280px] snap-start bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                        {timer.type}
                      </span>
                      {project && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[110px]" title={project.name}>
                          {project.name}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{timer.name}</h4>

                    {/* Monospaced countdown text */}
                    <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100 my-2">
                      {timer.type === 'COUNTDOWN' ? formatTimerMs(timer.remainingMs) : formatTimerMs(timer.elapsedMs)}
                    </div>

                    {/* Progress Bar */}
                    {timer.type === 'COUNTDOWN' && (
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                        <div
                          className="bg-teal-500 h-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Timer Controls */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {isRunning ? (
                      <button
                        onClick={() => pauseTimer(timer.id)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => startTimer(timer.id)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" /> Resume
                      </button>
                    )}
                    <button
                      onClick={() => stopTimer(timer.id)}
                      className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" /> Stop
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: QUICK TOOLS (2x3 Grid) */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-black tracking-[0.2em] uppercase text-slate-900 dark:text-white">
            QUICK CALCULATORS
          </h3>
          <button
            onClick={() => navigateTo({ type: 'TOOLS' })}
            className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            ALL CALCULATORS <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickTools.map(tool => {
            const Icon = tool.icon;
            return (
              <MtkCard
                key={tool.id}
                onClick={tool.action}
                className="flex flex-col justify-between p-3.5 border-2 border-slate-300 dark:border-white/15 hover:border-slate-900 dark:hover:border-teal-400 transition-all cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${tool.color} mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider leading-snug">{tool.name}</h4>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">{tool.desc}</p>
                </div>
              </MtkCard>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: RECENT PROJECTS */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-teal-600 dark:text-teal-400 stroke-[2.5]" />
            <h3 className="text-xs font-black tracking-[0.2em] uppercase text-slate-900 dark:text-white">
              RECENT PROJECTS
            </h3>
          </div>
          <button
            onClick={() => navigateTo({ type: 'PROJECTS' })}
            className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            SEE ALL ({safeProjects.length}) <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            subtitle="Create your first laboratory project to get started with protocols."
            actionLabel="New Project"
            onAction={() => navigateTo({ type: 'CREATE_PROJECT' })}
          />
        ) : (
          <div className="space-y-2.5">
            {recentProjects.map(proj => (
              <MtkCard
                key={proj.id}
                onClick={() => openProjectDetail(proj.id)}
                className="flex items-center justify-between p-4 border hover:border-teal-500 transition-all cursor-pointer"
              >
                <div className="space-y-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{proj.name}</h4>
                    <StatusChip status={proj.status} />
                  </div>
                  {proj.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{proj.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {(proj.tags || []).slice(0, 3).map(tag => (
                      <TagChip key={tag} label={tag} />
                    ))}
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </MtkCard>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: UPCOMING TIMERS */}
      {upcomingList.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
                Upcoming Timers
              </h3>
            </div>
            <button
              onClick={() => navigateTo({ type: 'TIMERS', tab: 'UPCOMING' })}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              See All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {upcomingList.map(timer => (
              <div
                key={timer.id}
                className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{timer.name}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Duration: {formatTimerMs(timer.totalDurationMs)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    startTimer(timer.id);
                    navigateTo({ type: 'TIMERS', tab: 'ACTIVE' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Start
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
