import React from 'react';

interface MtkTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  unit?: string;
  unitOptions?: string[];
  onUnitChange?: (unit: string) => void;
  helperText?: string;
}

export const MtkTextField: React.FC<MtkTextFieldProps> = ({
  label,
  error,
  unit,
  unitOptions,
  onUnitChange,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 mb-3">
      {label && (
        <label htmlFor={inputId} className="text-[10px] font-black text-slate-800 dark:text-slate-200 tracking-[0.2em] uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={inputId}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121215] border-2 text-sm font-semibold transition-colors text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none ${
            error
              ? 'border-rose-500 focus:border-rose-600'
              : 'border-slate-300 dark:border-white/20 focus:border-slate-900 dark:focus:border-teal-400'
          } ${unit || unitOptions ? 'pr-20' : ''} ${className}`}
          {...props}
        />
        {unitOptions && onUnitChange ? (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <select
              value={unit}
              onChange={e => onUnitChange(e.target.value)}
              className="px-2 py-1 bg-slate-100 dark:bg-[#1e1e24] text-slate-900 dark:text-slate-100 text-[11px] font-black uppercase rounded-lg border border-slate-300 dark:border-white/20 focus:outline-none"
            >
              {unitOptions.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        ) : unit ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md border border-slate-300 dark:border-white/20">
            {unit}
          </span>
        ) : null}
      </div>
      {error ? (
        <span className="text-[11px] text-rose-500 dark:text-rose-400 font-bold uppercase tracking-wider">{error}</span>
      ) : helperText ? (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{helperText}</span>
      ) : null}
    </div>
  );
};
