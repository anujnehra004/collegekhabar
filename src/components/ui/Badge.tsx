import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'brand',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    brand: 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800',
    success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    outline: 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium border',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium border',
  };

  return (
    <span
      className={cn('inline-flex items-center gap-1 leading-none whitespace-nowrap', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
