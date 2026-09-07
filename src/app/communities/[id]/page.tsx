'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  PlusCircle,
  Share2
} from 'lucide-react';
import { Community, Event, Profile } from '@/lib/types';
import { dataService } from '@/lib/data/storage';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { EventCard } from '@/components/events/EventCard';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const commId = params?.id as string;

  const { user } = useAuth();
  const toast = useToast();

  const [community, setCommunity] = useState<Community | null>(null);
  const [admin, setAdmin] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    async function loadCommunity() {
      if (!commId) return;
      setIsLoading(true);
      const data = await dataService.getCommunityById(commId);
      if (data) {
        setCommunity(data);
        setMemberCount(data.member_count);

        if (data.created_by) {
          const adm = await dataService.getProfile(data.created_by);
          setAdmin(adm);
        }

        const allEvents = await dataService.getEvents();
        const clubEvents = allEvents.filter(
          (e) => e.community_id === data.id || (e.community_name && e.community_name === data.name)
        );
        setEvents(clubEvents);

        if (user) {
          const member = await dataService.isCommunityMember(data.id, user.id);
          setIsMember(member);
        }
      }
      setIsLoading(false);
    }
    loadCommunity();
  }, [commId, user]);

  if (!community) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Loading Community Hub...</h2>
        <Button variant="outline" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
      </div>
    );
  }

  const handleToggleJoin = async () => {
    if (!user) {
      toast.info('Sign In Required', 'Please log in to join communities.');
      router.push('/login');
      return;
    }

    const joined = await dataService.toggleCommunityMembership(community.id, user.id);
    setIsMember(joined);
    setMemberCount((prev) => prev + (joined ? 1 : -1));

    if (joined) {
      toast.success('Joined Club 🎉', `You are now a member of ${community.name}`);
    } else {
      toast.info('Left Club', `You left ${community.name}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link Copied', 'Community link copied to clipboard.');
  };

  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= new Date());
  const pastEvents = events.filter((e) => new Date(e.event_date) < new Date());

  const tabs = [
    { id: 'upcoming', label: `Upcoming Events (${upcomingEvents.length})` },
    { id: 'past', label: `Past Events (${pastEvents.length})` },
    { id: 'about', label: 'About Club' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to clubs</span>
      </button>

      {/* Cover Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
        <div className="h-48 sm:h-64 w-full relative overflow-hidden bg-slate-900">
          <img
            src={community.cover_image}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-lg bg-black/60 text-white backdrop-blur-md">
            {community.category}
          </span>
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={community.logo}
                alt={community.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl bg-white shrink-0"
              />
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                  {community.name}
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{memberCount}</strong> active members
                  </span>
                  <span>•</span>
                  <span>{events.length} events organized</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
              >
                Share
              </Button>
              <Button
                variant={isMember ? 'outline' : 'primary'}
                size="sm"
                onClick={handleToggleJoin}
              >
                {isMember ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Member</span>
                  </span>
                ) : (
                  'Join Club'
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {community.description}
          </p>

          {/* Admin Leader Card */}
          {admin && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Club Lead:
              </span>
              <Link href={`/profile/${admin.id}`} className="flex items-center gap-2 group">
                <img
                  src={admin.profile_image}
                  alt={admin.full_name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 transition-colors">
                  {admin.full_name} ({admin.department.split(' ')[0]})
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Content */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              No upcoming events announced yet. Stay tuned!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastEvents.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              No past archives found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">About {community.name}</h3>
          <p>{community.description}</p>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p><strong>Affiliation:</strong> Student Activity Center &amp; NIT Campus Council</p>
            <p><strong>Meeting Venue:</strong> Student Lounge &amp; Innovation Labs</p>
            <p><strong>Membership Status:</strong> Open to all enrolled undergraduate and postgraduate students.</p>
          </div>
        </div>
      )}
    </div>
  );
}
