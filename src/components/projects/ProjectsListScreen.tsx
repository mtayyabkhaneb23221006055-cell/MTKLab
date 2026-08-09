import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectStatus } from '../../types';
import { MtkCard } from '../common/MtkCard';
import { StatusChip, TagChip } from '../common/TagChip';
import { EmptyState } from '../common/EmptyState';
import { CreateEditProjectModal } from './CreateEditProjectModal';
import { Plus, Search, FolderKanban, Clock, ArrowRight, Filter } from 'lucide-react';

export const ProjectsListScreen: React.FC = () => {
  const { projects, openProjectDetail } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProjects = projects.filter(p => {
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchesSearch =
      !searchFilter.trim() ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.tags || []).some(t => t.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Search and Status Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Filter projects by name or tag..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'NOT_STARTED', label: 'Not Started' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'COMPLETED', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={searchFilter || filterStatus !== 'ALL' ? 'No matching projects' : 'No projects created'}
          subtitle={
            searchFilter || filterStatus !== 'ALL'
              ? 'Try adjusting your search query or status filter.'
              : 'Create your first laboratory project to organize your protocols, steps, and timers.'
          }
          actionLabel="New Project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredProjects.map(proj => (
            <MtkCard
              key={proj.id}
              onClick={() => openProjectDetail(proj.id)}
              className="flex flex-col gap-2 border hover:border-teal-500 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {proj.name}
                  </h3>
                  {proj.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {proj.description}
                    </p>
                  )}
                </div>
                <StatusChip status={proj.status} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1 flex-wrap">
                  {(proj.tags || []).map(t => (
                    <TagChip key={t} label={t} />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(proj.date).toLocaleDateString()}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </MtkCard>
          ))}
        </div>
      )}

      {/* Floating Action Button "+ New Project" */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-5 bottom-20 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all cursor-pointer"
        aria-label="Create Project"
      >
        <Plus className="w-5 h-5" />
        <span>New Project</span>
      </button>

      {/* Create Modal */}
      <CreateEditProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
