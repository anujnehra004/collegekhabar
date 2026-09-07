import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-subtle flex flex-col h-[380px]">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
