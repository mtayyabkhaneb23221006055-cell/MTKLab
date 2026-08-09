import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { Search, Folder, ListChecks, Bookmark, Timer, ArrowRight, X } from 'lucide-react';

export const SearchScreen: React.FC = () => {
  const { searchQuery, setSearchQuery, searchResults, navigateTo, openProjectDetail } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelectResult = (item: typeof searchResults[0]) => {
    if (item.type === 'project' && item.projectId) {
      openProjectDetail(item.projectId);
    } else if (item.type === 'step' && item.projectId) {
      openProjectDetail(item.projectId);
    } else if (item.type === 'recipe' && item.toolId) {
      navigateTo({ type: 'CALCULATOR', toolId: item.toolId });
    } else if (item.type === 'timer') {
      navigateTo({ type: 'TIMERS', tab: 'ACTIVE' });
    }
  };

  const safeResults = searchResults || [];

  // Group search results by type
  const grouped = {
    project: safeResults.filter(r => r.type === 'project'),
    step: safeResults.filter(r => r.type === 'step'),
    recipe: safeResults.filter(r => r.type === 'recipe'),
    timer: safeResults.filter(r => r.type === 'timer'),
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Auto-focused Search input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 dark:text-teal-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search projects, protocol steps, recipes, notes..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-teal-500/40 dark:border-teal-500/40 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!searchQuery.trim() ? (
        <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-2">
          <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
          <p>Type keywords to search across projects, protocols, saved recipes, and active timers.</p>
        </div>
      ) : searchResults.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`No results found for "${searchQuery}"`}
          subtitle="Try a different search term or check spelling."
        />
      ) : (
        <div className="space-y-5">
          {/* Projects Group */}
          {grouped.project.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
                <Folder className="w-3.5 h-3.5 text-teal-600" /> Projects ({grouped.project.length})
              </span>
              {grouped.project.map(item => (
                <div
                  key={`proj-${item.id}`}
                  onClick={() => handleSelectResult(item)}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-teal-500 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Steps Group */}
          {grouped.step.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
                <ListChecks className="w-3.5 h-3.5 text-teal-600" /> Protocol Steps ({grouped.step.length})
              </span>
              {grouped.step.map(item => (
                <div
                  key={`step-${item.id}`}
                  onClick={() => handleSelectResult(item)}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-teal-500 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Recipes Group */}
          {grouped.recipe.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
                <Bookmark className="w-3.5 h-3.5 text-teal-600" /> Saved Recipes ({grouped.recipe.length})
              </span>
              {grouped.recipe.map(item => (
                <div
                  key={`recipe-${item.id}`}
                  onClick={() => handleSelectResult(item)}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-teal-500 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Timers Group */}
          {grouped.timer.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
                <Timer className="w-3.5 h-3.5 text-teal-600" /> Timers ({grouped.timer.length})
              </span>
              {grouped.timer.map(item => (
                <div
                  key={`timer-${item.id}`}
                  onClick={() => handleSelectResult(item)}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-teal-500 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
