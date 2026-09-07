'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, switchUser } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email required', 'Please enter your student or university email.');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      toast.success('Welcome back!', 'Successfully signed in to Campus Connect.');
      router.push('/dashboard');
    } else {
      toast.error('Login Failed', res.message || 'Check your email and password.');
    }
  };

  const handleQuickLogin = async (userId: string, name: string) => {
    setIsLoading(true);
    await switchUser(userId);
    setIsLoading(false);
    toast.success(`Signed in as ${name}`, 'Logged in using demo credentials.');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-600 text-white items-center justify-center shadow-md shadow-brand-500/30 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome to Campus Connect
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to discover events, connect with peers, and join campus communities.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="University or Personal Email"
              type="email"
              placeholder="student@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
              />
              <div className="flex justify-end pt-1">
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins for Fast Testing */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center flex items-center justify-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Or 1-Click Sign In as Test Persona</span>
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('d0000000-0000-0000-0000-000000000001', 'Anuj Verma')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50/20 text-left transition-all text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Anuj Verma</p>
                  <p className="text-[10px] text-slate-500">CS 3rd Year • Event Organizer & Hackathon Lead</p>
                </div>
                <span className="text-[10px] font-bold text-brand-600">Enter &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('d0000000-0000-0000-0000-000000000002', 'Priya Sharma')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50/20 text-left transition-all text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Priya Sharma</p>
                  <p className="text-[10px] text-slate-500">AI & DS 4th Year • GDSC Club Lead</p>
                </div>
                <span className="text-[10px] font-bold text-brand-600">Enter &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('d0000000-0000-0000-0000-000000000004', 'Sneha Patel')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50/20 text-left transition-all text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Sneha Patel</p>
                  <p className="text-[10px] text-slate-500">Design 2nd Year • Cultural & UI/UX Society</p>
                </div>
                <span className="text-[10px] font-bold text-brand-600">Enter &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500">
          New to Campus Connect?{' '}
          <Link href="/signup" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
