'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getSupabase } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      } catch (err) {
        console.warn('Supabase password reset:', err);
      }
    }

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success('Reset link dispatched', 'Check your student inbox for password reset instructions.');
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-600 text-white items-center justify-center shadow-md shadow-brand-500/30 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your university or registered email to receive a password reset link.
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Check Your Email</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                We sent a password recovery link to <strong>{email}</strong>. Follow the instructions in the email.
              </p>
              <Link href="/login" className="inline-block pt-2">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="student@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
