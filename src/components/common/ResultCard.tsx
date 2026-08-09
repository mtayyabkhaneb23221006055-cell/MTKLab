import React from 'react';
import { MtkCard } from './MtkCard';
import { CheckCircle2 } from 'lucide-react';

interface ResultCardProps {
  title: string;
  value: string;
  unit?: string;
  secondaryValue?: string;
  formula?: string;
  substitutedFormula?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  value,
  unit,
  secondaryValue,
  formula,
  substitutedFormula,
}) => {
  return (
    <MtkCard className="bg-white dark:bg-[#121215] border-2 border-teal-600 dark:border-teal-400 my-4 shadow-md p-5">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-black tracking-[0.2em] uppercase text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 stroke-[2.5]" />
          {title}
        </span>
      </div>

      <div className="flex items-baseline gap-2 my-2">
        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter font-mono">
          {value}
        </span>
        {unit && <span className="text-xl font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider">{unit}</span>}
      </div>

      {secondaryValue && (
        <div className="text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/20 inline-block my-1">
          {secondaryValue}
        </div>
      )}

      {(formula || substitutedFormula) && (
        <div className="mt-3 pt-3 border-t-2 border-slate-200 dark:border-white/10 text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300">
          {formula && <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">FORMULA: {formula}</p>}
          {substitutedFormula && <p className="font-extrabold text-slate-900 dark:text-slate-100">{substitutedFormula}</p>}
        </div>
      )}
    </MtkCard>
  );
};
