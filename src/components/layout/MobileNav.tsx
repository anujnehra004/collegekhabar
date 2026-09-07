'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Compass, Users, UserCheck, CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', href: user ? '/dashboard' : '/', icon: Sparkles },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Clubs', href: '/communities', icon: Users },
    { label: 'Connect', href: '/connections', icon: UserCheck },
    { label: 'My Events', href: '/my-events', icon: CalendarDays },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
