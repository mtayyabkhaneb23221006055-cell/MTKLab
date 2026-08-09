import React from 'react';

interface MtkDropdownOption {
  value: string;
  label: string;
}

interface MtkDropdownProps {
  label?: string;
  options: MtkDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
}

export const MtkDropdown: React.FC<MtkDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  id,
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 mb-3">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border text-sm font-medium transition-colors text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
          error
            ? 'border-rose-500 focus:border-rose-500'
            : 'border-slate-300 dark:border-slate-700 focus:border-teal-500'
        }`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
};
