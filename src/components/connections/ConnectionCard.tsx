'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserPlus, Check, X, UserCheck, Sparkles } from 'lucide-react';
import { Profile } from '@/lib/types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface ConnectionCardProps {
  profile: Profile;
  status?: 'none' | 'pending_sent' | 'pending_received' | 'connected';
  connectionId?: string;
  onConnect?: () => Promise<void>;
  onAccept?: () => Promise<void>;
  onReject?: () => Promise<void>;
}

export function ConnectionCard({
  profile,
  status = 'none',
  onConnect,
  onAccept,
  onReject,
}: ConnectionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);
  const toast = useToast();

  const handleConnect = async () => {
    if (!onConnect) return;
    setIsLoading(true);
    await onConnect();
    setLocalStatus('pending_sent');
    setIsLoading(false);
    toast.success('Request Sent', `Connection request sent to ${profile.full_name}`);
  };

  const handleAccept = async () => {
    if (!onAccept) return;
    setIsLoading(true);
    await onAccept();
    setLocalStatus('connected');
    setIsLoading(false);
    toast.success('Connected! 🤝', `You and ${profile.full_name} are now connected.`);
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsLoading(true);
    await onReject();
    setLocalStatus('none');
    setIsLoading(false);
    toast.info('Request Ignored', 'Connection request was removed.');
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:shadow-card p-4 flex flex-col justify-between transition-all">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${profile.id}`}>
          <img
            src={profile.profile_image}
            alt={profile.full_name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0 hover:opacity-90"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/profile/${profile.id}`}>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-brand-600 transition-colors truncate">
              {profile.full_name}
            </h4>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {profile.department}
          </p>
          <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
            {profile.year}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 my-3 leading-relaxed">
        {profile.bio}
      </p>

      {/* Skills or Interests Pills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {profile.skills?.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        {localStatus === 'connected' ? (
          <div className="w-full py-1.5 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Connected</span>
          </div>
        ) : localStatus === 'pending_sent' ? (
          <div className="w-full py-1.5 flex items-center justify-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <span>Request Sent</span>
          </div>
        ) : localStatus === 'pending_received' ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              className="flex-1 text-xs py-1"
              isLoading={isLoading}
              onClick={handleAccept}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs py-1 text-slate-400 hover:text-rose-500"
              isLoading={isLoading}
              onClick={handleReject}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs py-1.5"
            isLoading={isLoading}
            onClick={handleConnect}
            leftIcon={<UserPlus className="w-3.5 h-3.5 text-brand-600" />}
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
