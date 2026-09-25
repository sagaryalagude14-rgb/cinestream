import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'outline' | 'filled' | 'rating' | 'accent';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'outline',
  className = '',
}) => {
  const baseClasses =
    'inline-flex items-center justify-center text-[11px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded leading-none transition-colors';

  const variants = {
    outline: 'border border-zinc-700/80 text-zinc-300 bg-zinc-900/40',
    filled: 'bg-zinc-800 text-zinc-200',
    rating: 'border border-amber-500/40 bg-amber-500/10 text-amber-400 font-mono',
    accent: 'border border-red-500/30 bg-red-950/40 text-red-400',
  };

  return <span className={`${baseClasses} ${variants[variant]} ${className}`}>{children}</span>;
};
