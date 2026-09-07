'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { 
  Sparkles, 
  Compass, 
  CalendarDays, 
  Users, 
  UserCheck, 
  Bell, 
  Search, 
  Database, 
  Menu, 
  X, 
  PlusCircle, 
  LayoutDashboard, 
  LogOut,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '../ui/Button';
import { SupabaseConfigModal } from '../ui/SupabaseConfigModal';
import { GlobalSearchModal } from '../search/GlobalSearchModal';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isDemoMode } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: user ? '/dashboard' : '/', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Explore', href: '/explore', icon: <Compass className="w-4 h-4" /> },
    { label: 'Communities', href: '/communities', icon: <Users className="w-4 h-4" /> },
    { label: 'Connections', href: '/connections', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'My Events', href: '/my-events', icon: <CalendarDays className="w-4 h-4" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-6">
              <NextLink href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-brand-500/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                    Campus<span className="text-brand-600">Connect</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                    Student Hub
                  </span>
                </div>
              </NextLink>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <NextLink
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </NextLink>
                  );
                })}
              </nav>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs transition-colors shadow-subtle"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search campus...</span>
                <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 font-mono">
                  ⌘K
                </kbd>
              </button>

              {/* Supabase Status Pill */}
              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                  isDemoMode
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
                title="Click to view or edit Supabase database settings"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isDemoMode ? 'Demo Mode' : 'Supabase Active'}</span>
              </button>

              {/* Notifications */}
              {isAuthenticated && (
                <NextLink
                  href="/notifications"
                  className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </NextLink>
              )}

              {/* Create Event CTA */}
              <NextLink href="/events/create" className="hidden sm:block">
                <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Host Event
                </Button>
              </NextLink>

              {/* Auth state / Profile */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    <img
                      src={user.profile_image}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in zoom-in-95 duration-150"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {user.full_name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <NextLink
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>Your Profile</span>
                        </NextLink>

                        <NextLink
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>Student Dashboard</span>
                        </NextLink>

                        <NextLink
                          href="/organizer"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <ShieldAlert className="w-4 h-4 text-indigo-500" />
                          <span>Organizer Center</span>
                        </NextLink>

                        <button
                          onClick={() => setIsSupabaseModalOpen(true)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <Database className="w-4 h-4 text-emerald-500" />
                          <span>Supabase Database Config</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <NextLink href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </NextLink>
                  <NextLink href="/signup">
                    <Button variant="primary" size="sm">
                      Join Free
                    </Button>
                  </NextLink>
                </div>
              )}

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown drawer */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <NextLink
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                  pathname === link.href
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </NextLink>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <NextLink href="/events/create" onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  + Create Event
                </Button>
              </NextLink>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSupabaseModalOpen(true);
                }}
                className="text-xs text-slate-600 dark:text-slate-400 py-1.5 flex items-center justify-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Supabase Connection Settings</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
