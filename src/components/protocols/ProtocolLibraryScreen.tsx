import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Plus,
  Star,
  Search,
  Tag,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Copy,
  Trash2,
  FolderPlus,
  FileCode,
} from 'lucide-react';
import { SavedProtocol } from '../../types';

export const ProtocolLibraryScreen: React.FC = () => {
  const { savedProtocols, toggleProtocolFavorite, deleteProtocol, saveProject, saveStep, navigateTo } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['ALL', 'FAVORITES', 'Molecular Biology', 'Microbiology', 'Cell Culture', 'Biochemistry', 'AI Generated'];

  const filtered = savedProtocols.filter(p => {
    if (activeCategory === 'FAVORITES' && !p.isFavorite) return false;
    if (activeCategory === 'AI Generated' && !p.isAiGenerated) return false;
    if (activeCategory !== 'ALL' && activeCategory !== 'FAVORITES' && activeCategory !== 'AI Generated' && p.category !== activeCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.objective?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateProjectFromProtocol = (protocol: SavedProtocol) => {
    const project = saveProject({
      name: `${protocol.title} Run`,
      description: protocol.objective || 'Created from protocol library template.',
      tags: protocol.tags || [protocol.category],
    });

    (protocol.steps || []).forEach((st, idx) => {
      saveStep({
        projectId: project.id,
        groupName: st.groupName || 'Protocol Steps',
        title: st.title,
        description: st.description,
        notes: st.notes,
        durationMinutes: st.durationMinutes,
        isCompleted: false,
        sortOrder: idx + 1,
      });
    });

    navigateTo({ type: 'PROJECT_DETAIL', projectId: project.id });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-2 border border-teal-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>LABORATORY KNOWLEDGE BASE</span>
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">PROTOCOL LIBRARY</h2>
          <p className="text-xs text-slate-300 mt-1">
            Standard operating procedures, validated workflows, and AI-scanned laboratory protocols.
          </p>
        </div>
        <button
          onClick={() => navigateTo({ type: 'AI_SCANNER' })}
          className="px-3.5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-black font-bold text-xs font-mono uppercase tracking-wider transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">SCAN NEW PROTOCOL</span>
        </button>
      </div>

      {/* Search & Category Chips */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search protocols by title, tag, reagent, or category..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-xs font-mono focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Protocol List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(protocol => {
          const stepsList = protocol.steps || [];
          const totalDuration = stepsList.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

          return (
            <div
              key={protocol.id}
              className="bg-[#FFFFFF] dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-500/50 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 font-mono text-[9px] font-bold uppercase">
                        {protocol.category}
                      </span>
                      {protocol.isAiGenerated && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-mono text-[9px] font-bold uppercase flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> AI
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {protocol.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleProtocolFavorite(protocol.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                  >
                    <Star className={`w-4 h-4 ${protocol.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                {protocol.objective && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{protocol.objective}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-500" />
                    <span>~{totalDuration} MIN TOTAL</span>
                  </span>
                  <span>•</span>
                  <span>{stepsList.length} STEPS</span>
                  {protocol.author && (
                    <>
                      <span>•</span>
                      <span>BY {protocol.author}</span>
                    </>
                  )}
                </div>

                {protocol.tags && protocol.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {protocol.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-slate-400 text-[9px] font-mono"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <button
                  onClick={() => deleteProtocol(protocol.id)}
                  title="Delete template"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleCreateProjectFromProtocol(protocol)}
                  className="py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-mono font-bold text-xs uppercase transition-transform active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>START PROJECT</span>
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-8 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No protocols found matching criteria</p>
            <p className="text-xs text-slate-500">Scan paper protocols or create custom protocol templates.</p>
          </div>
        )}
      </div>
    </div>
  );
};
