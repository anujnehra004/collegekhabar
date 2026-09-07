import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                Campus<span className="text-brand-600">Connect</span>
              </span>
            </Link>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              The central digital campus community platform for university event discovery, student networking, and club collaboration.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <p className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              Explore
            </p>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/explore?category=Hackathon" className="hover:text-brand-600 transition-colors">Hackathons & Sprints</Link></li>
              <li><Link href="/explore?category=Workshop" className="hover:text-brand-600 transition-colors">Hands-on Workshops</Link></li>
              <li><Link href="/explore?category=Fest" className="hover:text-brand-600 transition-colors">Cultural Fests & Shows</Link></li>
              <li><Link href="/explore?category=Placement" className="hover:text-brand-600 transition-colors">Placement & Careers</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <p className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              Campus Ecosystem
            </p>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/communities" className="hover:text-brand-600 transition-colors">University Clubs</Link></li>
              <li><Link href="/connections" className="hover:text-brand-600 transition-colors">Student Networking</Link></li>
              <li><Link href="/organizer" className="hover:text-brand-600 transition-colors">Organizer Analytics</Link></li>
              <li><Link href="/events/create" className="hover:text-brand-600 transition-colors">Host an Event</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <p className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              Platform & Tech
            </p>
            <p className="text-[11px] text-slate-500">
              Built with Next.js 14, Supabase Auth & PostgreSQL, and Tailwind CSS.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" className="hover:text-brand-600"><Github className="w-4 h-4" /></a>
              <a href="#" className="hover:text-brand-600"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-brand-600"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Campus Connect. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for modern university students with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
