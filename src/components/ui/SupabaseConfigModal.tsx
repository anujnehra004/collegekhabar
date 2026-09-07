'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Database, CheckCircle, Copy, AlertTriangle, Key, ExternalLink, RefreshCw, UserCheck } from 'lucide-react';
import { isSupabaseConfigured, getSupabaseCredentials, setCustomSupabaseCredentials, clearCustomSupabaseCredentials } from '@/lib/supabase/client';
import { useToast } from './Toast';
import { useAuth } from '@/context/AuthContext';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseConfigModal({ isOpen, onClose }: SupabaseConfigModalProps) {
  const isConnected = isSupabaseConfigured();
  const credentials = getSupabaseCredentials();
  const [url, setUrl] = useState(credentials.url.includes('placeholder') ? '' : credentials.url);
  const [key, setKey] = useState(credentials.key.includes('placeholder') ? '' : credentials.key);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const { user, switchUser } = useAuth();

  const handleSave = () => {
    if (!url || !key) {
      toast.error('Missing credentials', 'Please provide both Supabase URL and Anon API key.');
      return;
    }
    if (!url.startsWith('https://')) {
      toast.error('Invalid URL', 'Supabase URL must begin with https://');
      return;
    }

    setIsSaving(true);
    setCustomSupabaseCredentials(url, key);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Supabase Configured!', 'Reloading application to connect to live Supabase PostgreSQL.');
      window.location.reload();
    }, 600);
  };

  const handleResetToDemo = () => {
    clearCustomSupabaseCredentials();
    toast.info('Switched to Demo Mode', 'Now running on high-fidelity campus dataset.');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2 text-base font-bold">
          <Database className="w-5 h-5 text-brand-600" />
          <span>Supabase Database & Backend Status</span>
        </div>
      }
      description="Connect to your live Supabase PostgreSQL database or test seamlessly in interactive demo mode."
    >
      <div className="space-y-6">
        {/* Status indicator */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            isConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          }`}
        >
          {isConnected ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {isConnected ? '🟢 Supabase Connected (Live PostgreSQL)' : '⚡ Interactive Demo & Evaluation Mode'}
            </p>
            <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
              {isConnected
                ? 'Campus Connect is connected to your Supabase project. Queries, Auth, and RLS are active.'
                : 'Running with 16 realistic university events, 6 communities, 12 students, registrations, and live notifications. You can paste your Supabase URL & Key below to switch to your remote database anytime!'}
            </p>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-brand-600" />
              <span>Connect Live Supabase Project</span>
            </h4>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
            >
              <span>Supabase Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <Input
            label="Project URL (NEXT_PUBLIC_SUPABASE_URL)"
            placeholder="https://xyzcompany.supabase.co"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <Input
            label="Anon Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)"
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />

          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              Save & Connect to Supabase
            </Button>
            {isConnected && (
              <Button
                onClick={handleResetToDemo}
                variant="outline"
                size="sm"
              >
                Reset to Demo
              </Button>
            )}
          </div>
        </div>

        {/* Personas quick switch */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Switch Student Persona for Testing</span>
            </h4>
            <span className="text-[11px] text-slate-500">Current: <strong>{user?.full_name}</strong></span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                switchUser('d0000000-0000-0000-0000-000000000001');
                toast.success('Switched Persona', 'Logged in as Anuj Verma (Organizer & Full-Stack Lead)');
                onClose();
              }}
              className="p-2 rounded-lg border text-left hover:border-brand-500 hover:bg-brand-50/30 transition-all text-xs"
            >
              <p className="font-bold truncate">Anuj Verma</p>
              <p className="text-[10px] text-brand-600">Event Organizer</p>
            </button>
            <button
              onClick={() => {
                switchUser('d0000000-0000-0000-0000-000000000002');
                toast.success('Switched Persona', 'Logged in as Priya Sharma (GDSC Lead)');
                onClose();
              }}
              className="p-2 rounded-lg border text-left hover:border-brand-500 hover:bg-brand-50/30 transition-all text-xs"
            >
              <p className="font-bold truncate">Priya Sharma</p>
              <p className="text-[10px] text-brand-600">GDSC Lead</p>
            </button>
            <button
              onClick={() => {
                switchUser('d0000000-0000-0000-0000-000000000004');
                toast.success('Switched Persona', 'Logged in as Sneha Patel (Student Designer)');
                onClose();
              }}
              className="p-2 rounded-lg border text-left hover:border-brand-500 hover:bg-brand-50/30 transition-all text-xs"
            >
              <p className="font-bold truncate">Sneha Patel</p>
              <p className="text-[10px] text-brand-600">Design Student</p>
            </button>
          </div>
        </div>

        {/* Schema and Seed Files Help */}
        <div className="text-xs text-slate-500 space-y-1.5 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Database Schema & Seed files:</p>
          <p>• Schema DDL & RLS policies: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">supabase/schema.sql</code></p>
          <p>• Sample dataset: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">supabase/seed.sql</code></p>
        </div>
      </div>
    </Modal>
  );
}
