'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  UserPlus, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  Calendar,
  Share2,
  UserCheck
} from 'lucide-react';
import { Profile, Event } from '@/lib/types';
import { dataService } from '@/lib/data/storage';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { EventCard } from '@/components/events/EventCard';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const { user } = useAuth();
  const { events } = useEvents();
  const toast = useToast();

  const [student, setStudent] = useState<Profile | null>(null);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    async function loadStudent() {
      if (!studentId) return;
      setIsLoading(true);
      const data = await dataService.getProfile(studentId);
      if (data) {
        setStudent(data);
        const hosted = events.filter((e) => e.organizer_id === data.id);
        setCreatedEvents(hosted);

        if (user) {
          const myConns = await dataService.getConnections(user.id);
          const isConn = myConns.some((c) => c.user.id === data.id);
          if (isConn) {
            setConnectionStatus('connected');
          } else {
            const pending = await dataService.getPendingRequests(studentId);
            const hasPending = pending.some((p) => p.user.id === user.id);
            if (hasPending) setConnectionStatus('pending');
          }
        }
      }
      setIsLoading(false);
    }
    loadStudent();
  }, [studentId, user, events]);

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Student Profile Not Found</h2>
        <Button variant="outline" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
      </div>
    );
  }

  const handleConnect = async () => {
    if (!user) {
      toast.info('Sign In Required', 'Please log in to connect with students.');
      router.push('/login');
      return;
    }

    setIsConnecting(true);
    const sent = await dataService.sendConnectionRequest(user.id, student.id);
    setIsConnecting(false);

    if (sent) {
      setConnectionStatus('pending');
      toast.success('Request Sent', `Connection request sent to ${student.full_name}`);
    } else {
      toast.info('Already Connected', 'A connection or request already exists.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link Copied', 'Profile link copied to clipboard.');
  };

  const tabs = [
    { id: 'events', label: `Hosted Events (${createdEvents.length})` },
    { id: 'about', label: 'Student Bio & Skills' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to community</span>
      </button>

      {/* Header Profile Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
        <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={student.profile_image}
                alt={student.full_name}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl bg-white shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {student.full_name}
                  </h1>
                  {student.is_organizer && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 border border-brand-200">
                      Organizer
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-brand-600" />
                  <span>{student.department} • <strong>{student.year}</strong></span>
                </p>
                <p className="text-xs text-slate-400">{student.university}</p>
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

              {user?.id !== student.id && (
                connectionStatus === 'connected' ? (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Connected</span>
                  </div>
                ) : connectionStatus === 'pending' ? (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium">
                    <span>Request Sent</span>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isConnecting}
                    onClick={handleConnect}
                    leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  >
                    Connect
                  </Button>
                )
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed my-4">
            {student.bio}
          </p>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Skills &amp; Technologies
              </p>
              <div className="flex flex-wrap gap-1.5">
                {student.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Interests
              </p>
              <div className="flex flex-wrap gap-1.5">
                {student.interests?.map((interest) => (
                  <span
                    key={interest}
                    className="text-xs px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'events' && (
        <div className="space-y-4">
          {createdEvents.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              This student has not organized any public events yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {createdEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">About {student.full_name}</h3>
          <p>{student.bio}</p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p><strong>Institution:</strong> {student.university}</p>
            <p><strong>Department:</strong> {student.department}</p>
            <p><strong>Year of Study:</strong> {student.year}</p>
          </div>
        </div>
      )}
    </div>
  );
}
