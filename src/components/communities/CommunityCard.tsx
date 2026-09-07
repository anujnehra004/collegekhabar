'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Check } from 'lucide-react';
import { Community } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/data/storage';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';

interface CommunityCardProps {
  community: Community;
  onJoinChange?: () => void;
}

export function CommunityCard({ community, onJoinChange }: CommunityCardProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(community.member_count);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      dataService.isCommunityMember(community.id, user.id).then(setIsMember);
    }
  }, [community.id, user]);

  const handleToggleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info('Sign In Required', 'Please log in to join university communities.');
      return;
    }

    setIsLoading(true);
    const joined = await dataService.toggleCommunityMembership(community.id, user.id);
    setIsMember(joined);
    setMemberCount((prev) => prev + (joined ? 1 : -1));
    setIsLoading(false);

    if (joined) {
      toast.success('Joined Community 🎉', `You are now a member of ${community.name}`);
    } else {
      toast.info('Left Community', `You left ${community.name}`);
    }

    if (onJoinChange) onJoinChange();
  };

  return (
    <div className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Cover image with Logo overlay */}
      <Link href={`/communities/${community.id}`} className="relative h-28 w-full bg-slate-100 dark:bg-slate-800 block overflow-hidden">
        <img
          src={community.cover_image}
          alt={community.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
        <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-md">
          {community.category}
        </span>
      </Link>

      {/* Content */}
      <div className="p-4 pt-0 flex-1 flex flex-col justify-between relative">
        {/* Floating Avatar Logo */}
        <div className="-mt-8 mb-2 flex items-end justify-between">
          <img
            src={community.logo}
            alt={community.name}
            className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-md bg-white shrink-0"
          />

          <Button
            size="sm"
            variant={isMember ? 'outline' : 'primary'}
            isLoading={isLoading}
            onClick={handleToggleJoin}
            className={`text-xs py-1 px-3 ${
              isMember ? 'text-slate-600 border-slate-300 dark:border-slate-700' : ''
            }`}
          >
            {isMember ? (
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Joined</span>
              </span>
            ) : (
              'Join Club'
            )}
          </Button>
        </div>

        <div className="space-y-1.5 mb-3">
          <Link href={`/communities/${community.id}`}>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors line-clamp-1">
              {community.name}
            </h4>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {community.description}
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{memberCount} members</span>
          </span>

          <Link
            href={`/communities/${community.id}`}
            className="text-brand-600 font-semibold hover:underline inline-flex items-center gap-0.5"
          >
            <span>Explore Club</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
