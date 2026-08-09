import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  FolderCheck,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Bell,
  Play,
  X,
} from 'lucide-react';
import { LabCalendarEvent } from '../../types';

export const CalendarScreen: React.FC = () => {
  const { calendarEvents, saveCalendarEvent, deleteCalendarEvent, projects, navigateTo } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [type, setType] = useState<LabCalendarEvent['type']>('EXPERIMENT');
  const [projectId, setProjectId] = useState<number | undefined>(
    (projects || []).length > 0 ? projects[0].id : undefined
  );
  const [notes, setNotes] = useState('');

  const safeEvents = calendarEvents || [];
  const filteredEvents = safeEvents.filter(e => {
    if (filterType !== 'ALL' && e.type !== filterType) return false;
    return true;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    saveCalendarEvent({
      title,
      date,
      time,
      type,
      projectId: projectId ? Number(projectId) : undefined,
      notes,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setNotes('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-2 border border-teal-500/30">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>LABORATORY SCHEDULE</span>
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">LAB CALENDAR & AGENDA</h2>
          <p className="text-xs text-slate-300 mt-1">
            Schedule experiment runs, incubation milestones, equipment maintenance, and step deadlines.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-black font-bold text-xs font-mono uppercase tracking-wider transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">ADD EVENT</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 font-mono text-xs overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'EXPERIMENT', 'REMINDER', 'STEP_DEADLINE', 'MAINTENANCE'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              filterType === t
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Event Agenda Cards */}
      <div className="space-y-3">
        {filteredEvents.map(ev => {
          const project = projects.find(p => p.id === ev.projectId);

          return (
            <div
              key={ev.id}
              className="bg-white dark:bg-[#121212] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-3 rounded-2xl shrink-0 font-mono text-center min-w-[60px] ${
                    ev.type === 'EXPERIMENT'
                      ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30'
                      : ev.type === 'REMINDER'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase">{ev.type}</span>
                  <span className="block text-xs font-black">{ev.time || 'ALL DAY'}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{ev.date}</span>
                    {project && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[9px] font-mono font-bold">
                        #{project.id} {project.name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{ev.title}</h3>

                  {ev.notes && <p className="text-xs text-slate-600 dark:text-slate-400">{ev.notes}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {project && (
                  <button
                    onClick={() => navigateTo({ type: 'PROJECT_DETAIL', projectId: project.id })}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-mono font-bold text-xs uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <FolderCheck className="w-3.5 h-3.5" />
                    <span>OPEN PROJECT</span>
                  </button>
                )}

                <button
                  onClick={() => deleteCalendarEvent(ev.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 text-center space-y-2">
            <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No scheduled calendar events</p>
            <p className="text-xs text-slate-500">Add reminders or experiment deadlines to stay organized.</p>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121212] w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>SCHEDULE LAB EVENT</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">EVENT TITLE *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Inoculate 500 mL LB culture"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">DATE</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">TIME</label>
                  <input
                    type="text"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">EVENT TYPE</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-xs focus:outline-none"
                  >
                    <option value="EXPERIMENT">EXPERIMENT</option>
                    <option value="REMINDER">REMINDER</option>
                    <option value="STEP_DEADLINE">STEP DEADLINE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">LINK PROJECT</label>
                  <select
                    value={projectId || ''}
                    onChange={e => setProjectId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-xs focus:outline-none"
                  >
                    <option value="">NONE</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        #{p.id} {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">NOTES</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Target OD600, buffer requirements, incubator temperature..."
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-wider text-xs shadow-md transition-colors cursor-pointer"
              >
                SAVE CALENDAR EVENT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
