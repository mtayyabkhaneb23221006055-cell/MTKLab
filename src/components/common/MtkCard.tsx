import React from 'react';

interface MtkCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const MtkCard: React.FC<MtkCardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'outlined',
}) => {
  let baseStyle = 'rounded-xl p-4 transition-all duration-200 ';

  if (variant === 'elevated') {
    baseStyle += 'bg-white dark:bg-[#121215] shadow-md border-2 border-slate-900 dark:border-white/20 ';
  } else if (variant === 'outlined') {
    baseStyle += 'bg-white dark:bg-[#121215] border border-slate-300 dark:border-white/15 shadow-2xs ';
  } else {
    baseStyle += 'bg-slate-100 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 ';
  }

  if (onClick) {
    baseStyle += 'cursor-pointer hover:border-teal-600 dark:hover:border-teal-400 hover:shadow-md active:scale-[0.99] ';
  }

  return (
    <div className={`${baseStyle} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};
