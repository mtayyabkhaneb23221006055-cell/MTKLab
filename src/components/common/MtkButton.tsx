import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MtkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export const MtkButton: React.FC<MtkButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  let styles = 'inline-flex items-center justify-center font-black tracking-wider uppercase rounded-xl transition-all cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ';

  // Size
  if (size === 'sm') styles += 'px-3 py-1.5 text-[11px] gap-1.5 ';
  else if (size === 'lg') styles += 'px-6 py-3.5 text-sm gap-2.5 ';
  else styles += 'px-4 py-2.5 text-xs gap-2 ';

  // Width
  if (fullWidth) styles += 'w-full ';

  // Variant
  if (variant === 'primary') {
    styles += 'bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-teal-600 dark:hover:bg-teal-400 dark:hover:text-black border-2 border-slate-900 dark:border-white shadow-sm ';
  } else if (variant === 'secondary') {
    styles += 'bg-slate-100 hover:bg-slate-200 dark:bg-[#18181c] dark:hover:bg-[#222228] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/15 ';
  } else if (variant === 'outlined') {
    styles += 'border-2 border-slate-900 dark:border-white/30 hover:border-teal-600 dark:hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white ';
  } else if (variant === 'ghost') {
    styles += 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 ';
  } else if (variant === 'danger') {
    styles += 'bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-700 dark:border-rose-500 shadow-sm ';
  }

  return (
    <button className={`${styles} ${className}`} disabled={disabled} {...props}>
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5 stroke-[2.5]' : size === 'lg' ? 'w-5 h-5 stroke-[2.5]' : 'w-4 h-4 stroke-[2.5]'} />}
      {children}
    </button>
  );
};
