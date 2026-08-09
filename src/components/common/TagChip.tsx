import React from 'react';
import { ProjectStatus } from '../../types';

export const StatusChip: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  let label = 'NOT STARTED';
  let classes = 'bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-slate-200 border-slate-400 dark:border-white/20';

  if (status === 'IN_PROGRESS') {
    label = 'IN PROGRESS';
    classes = 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/40 dark:border-teal-400/30';
  } else if (status === 'COMPLETED') {
    label = 'COMPLETED';
    classes = 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 dark:border-emerald-400/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider border ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'IN_PROGRESS' ? 'bg-teal-500 animate-pulse' : status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
      {label}
    </span>
  );
};

export const TagChip: React.FC<{ label: string; onRemove?: () => void }> = ({ label, onRemove }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white border border-slate-300 dark:border-white/20 mr-1.5 mb-1.5">
      #{label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 text-slate-500 hover:text-red-500 dark:hover:text-red-400 focus:outline-none font-sans font-bold"
        >
          ×
        </button>
      )}
    </span>
  );
};
