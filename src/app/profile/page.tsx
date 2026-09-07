'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  GraduationCap, 
  Mail, 
  Edit3, 
  Sparkles, 
  Calendar, 
  Plus, 
  X, 
  Check, 
  Award,
  Layers,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { EventCard } from '@/components/events/EventCard';
import { dataService } from '@/lib/data/storage';
import { Event } from '@/lib/types';

export default function CurrentUserProfilePage() {
  const { user, updateProfile } = useAuth();
  const { events } = useEvents();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('events');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userCreatedEvents, setUserCreatedEvents] = useState<Event[]>([]);
  const [userAttendedEvents, setUserAttendedEvents] = useState<Event[]>([]);

  // Edit Form State
  const [editData, setEditData] = useState({
    full_name: '',
    department: '',
    year: '',
    bio: '',
    profile_image: '',
    skills: [] as string[],
    interests: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditData({
        full_name: user.full_name,
        department: user.department,
        year: user.year,
        bio: user.bio,
        profile_image: user.profile_image,
        skills: user.skills || [],
        interests: user.interests || [],
      });

      // Filter events created by this user
      const created = events.filter((e) => e.organizer_id === user.id);
      setUserCreatedEvents(created);

      // Filter registered events
      dataService.getUserRegistrations(user.id).then((regs) => {
        setUserAttendedEvents(regs.map((r) => r.event));
      });
    }
  }, [user, events]);

  const activeProfile = user || {
    id: 'd0000000-0000-0000-0000-000000000001',
    full_name: 'Anuj Verma',
    email: 'anuj.verma@campus.edu',
    university: 'National Institute of Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    bio: 'Passionate full-stack developer & hackathon enthusiast. Building tools for next-gen campuses.',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    skills: ['Next.js', 'TypeScript', 'Supabase', 'Python', 'Tailwind CSS'],
    interests: ['Hackathons', 'Web Development', 'AI & ML'],
    is_organizer: true,
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(editData);
      setIsSaving(false);
      setIsEditModalOpen(false);
      toast.success('Profile Updated', 'Your student details have been saved.');
    } catch (err) {
      setIsSaving(false);
      toast.error('Update Failed', 'Could not save profile.');
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (!editData.skills.includes(newSkill.trim())) {
      setEditData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setEditData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;
    if (!editData.interests.includes(newInterest.trim())) {
      setEditData((prev) => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
    }
    setNewInterest('');
  };

  const removeInterest = (interest: string) => {
    setEditData((prev) => ({ ...prev, interests: prev.interests.filter((i) => i !== interest) }));
  };

  const tabs = [
    { id: 'events', label: `Attending (${userAttendedEvents.length})` },
    { id: 'created', label: `Hosted Events (${userCreatedEvents.length})` },
    { id: 'about', label: 'Academic Details' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
        {/* Cover banner */}
        <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-brand-600 via-indigo-700 to-violet-800 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile Details */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={activeProfile.profile_image}
                alt={activeProfile.full_name}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl bg-white shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {activeProfile.full_name}
                  </h1>
                  {activeProfile.is_organizer && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 border border-brand-200 dark:border-brand-800">
                      Campus Organizer
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-brand-600" />
                  <span>{activeProfile.department} • <strong>{activeProfile.year}</strong></span>
                </p>
                <p className="text-xs text-slate-400">{activeProfile.university}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit Profile
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed my-4">
            {activeProfile.bio}
          </p>

          {/* Skills & Interests Tags */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Skills &amp; Technologies
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeProfile.skills?.map((skill) => (
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
                Campus Interests
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeProfile.interests?.map((interest) => (
                  <span
                    key={interest}
                    className="text-xs px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-medium"
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

      {/* Tab 1: Attending */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {userAttendedEvents.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              No registered events yet. Explore events and register with one click!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userAttendedEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Created */}
      {activeTab === 'created' && (
        <div className="space-y-4">
          {userCreatedEvents.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              You haven&apos;t hosted any events yet.
              <div className="pt-3">
                <Link href="/events/create">
                  <Button size="sm" variant="primary">Create an Event</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userCreatedEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Academic Details */}
      {activeTab === 'about' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Academic Verification</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400">
            <div>
              <p className="text-slate-400">University</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{activeProfile.university}</p>
            </div>
            <div>
              <p className="text-slate-400">Department</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{activeProfile.department}</p>
            </div>
            <div>
              <p className="text-slate-400">Academic Year</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{activeProfile.year}</p>
            </div>
            <div>
              <p className="text-slate-400">Registered Email</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{activeProfile.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="lg"
        title="Edit Student Profile"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={editData.full_name}
            onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
            required
          />

          <Input
            label="Avatar Image URL"
            value={editData.profile_image}
            onChange={(e) => setEditData({ ...editData, profile_image: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Department"
              value={editData.department}
              onChange={(e) => setEditData({ ...editData, department: e.target.value })}
            />
            <Input
              label="Year"
              value={editData.year}
              onChange={(e) => setEditData({ ...editData, year: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Bio
            </label>
            <textarea
              rows={3}
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Add Skills */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. Next.js, Python, Figma"
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs"
              />
              <Button type="button" size="sm" variant="secondary" onClick={addSkill}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {editData.skills.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center gap-1"
                >
                  <span>{s}</span>
                  <button type="button" onClick={() => removeSkill(s)}>
                    <X className="w-3 h-3 text-slate-400 hover:text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Add Interests */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Interests
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="e.g. Hackathons, AI, Robotics"
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs"
              />
              <Button type="button" size="sm" variant="secondary" onClick={addInterest}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {editData.interests.map((i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 flex items-center gap-1"
                >
                  <span>{i}</span>
                  <button type="button" onClick={() => removeInterest(i)}>
                    <X className="w-3 h-3 text-brand-400 hover:text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
