'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Image as ImageIcon, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Plus, 
  Trash2,
  Upload
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EventCategory, EventType, EventStatus, ScheduleItem, Speaker } from '@/lib/types';

const CATEGORIES: EventCategory[] = [
  'Hackathon',
  'Workshop',
  'Seminar',
  'Cultural',
  'Sports',
  'Technical',
  'Competition',
  'Club Activity',
  'Placement',
  'Fest',
  'Social',
  'Other',
];

export default function CreateEventPage() {
  const { user } = useAuth();
  const { createEvent } = useEvents();
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hackathon' as EventCategory,
    banner_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
    event_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    start_time: '10:00 AM',
    end_time: '04:00 PM',
    location: 'Main University Auditorium',
    event_type: 'offline' as EventType,
    registration_deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    max_participants: 150,
    eligibility: 'Open to all enrolled university students.',
    rules: 'Follow university code of conduct. Teams of 2 to 4 members.',
    contact_email: user?.email || 'events@campus.edu',
    is_free: true,
    price: 0,
    status: 'published' as EventStatus,
    schedule: [
      { time: '10:00 AM', title: 'Registration & Welcome Keynote', speaker: 'Faculty Coordinator' },
      { time: '01:00 PM', title: 'Hands-on Activities & Challenges', speaker: 'Club Leads' }
    ] as ScheduleItem[],
    speakers: [
      { name: 'Dr. Vikram Sharma', role: 'Faculty Coordinator', company: 'Campus Council', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }
    ] as Speaker[],
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.title.trim() || !formData.description.trim()) {
        toast.error('Required Fields', 'Please provide event title and description.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.location.trim() || !formData.event_date) {
        toast.error('Required Fields', 'Please provide event location and date.');
        return;
      }
      setStep(3);
    }
  };

  const handlePublish = async (status: EventStatus = 'published') => {
    if (!user) {
      toast.error('Authentication Required', 'You must be logged in to create an event.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createEvent({
        ...formData,
        status,
        organizer_id: user.id,
        organizer_name: user.full_name,
        organizer_avatar: user.profile_image,
        community_id: null,
      });

      setIsSubmitting(false);
      toast.success(
        status === 'published' ? '🎉 Event Published!' : 'Draft Saved!',
        `"${created.title}" is now recorded on Campus Connect.`
      );
      router.push(`/events/${created.id}`);
    } catch (err) {
      setIsSubmitting(false);
      toast.error('Error', 'Failed to publish event.');
    }
  };

  // Schedule agenda items manager
  const addScheduleItem = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { time: '02:00 PM', title: 'Next Session', speaker: '' }],
    }));
  };

  const removeScheduleItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, idx) => idx !== index),
    }));
  };

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, val: string) => {
    setFormData((prev) => {
      const copy = [...prev.schedule];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, schedule: copy };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
          <Sparkles className="w-4 h-4" />
          <span>Organizer Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Create Campus Event
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Step {step} of 3: {step === 1 ? 'Event Overview & Media' : step === 2 ? 'Date, Time & Venue' : 'Capacity, Rules & Agenda'}
        </p>

        {/* Stepper bar */}
        <div className="flex items-center gap-2 pt-2 max-w-sm">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        {/* STEP 1: Overview & Media */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-5">
            <Input
              label="Event Title"
              placeholder="e.g. AI & Robotics Hackathon 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Event Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what will happen, key takeaways, and why students should attend..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            {/* Banner Image URL / Selector */}
            <div className="space-y-2">
              <Input
                label="Banner Image URL"
                placeholder="https://images.unsplash.com/..."
                value={formData.banner_image}
                onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                leftIcon={<ImageIcon className="w-4 h-4" />}
              />

              {formData.banner_image && (
                <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 mt-2">
                  <img
                    src={formData.banner_image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
                    Banner Preview
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue to Schedule
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Date, Time & Venue */}
        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Date of Event"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
              <Input
                label="Start Time"
                placeholder="10:00 AM"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
              <Input
                label="End Time"
                placeholder="04:00 PM"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>

            <Input
              label="Location / Hall / Campus Venue"
              placeholder="e.g. CS Lab 3, Ground Floor"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Event Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'offline', label: 'In-Person (Offline)' },
                  { id: 'online', label: 'Online / Stream' },
                  { id: 'hybrid', label: 'Hybrid' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, event_type: fmt.id as EventType })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      formData.event_type === fmt.id
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Organizer Contact Email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            />

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="secondary" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button type="submit" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Participation &amp; Agenda
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: Capacity, Rules & Schedule */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Max Participants Capacity"
                type="number"
                min={1}
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 100 })}
                leftIcon={<Users className="w-4 h-4" />}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Pricing
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      checked={formData.is_free}
                      onChange={() => setFormData({ ...formData, is_free: true, price: 0 })}
                      className="text-brand-600"
                    />
                    <span>Free Event</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      checked={!formData.is_free}
                      onChange={() => setFormData({ ...formData, is_free: false, price: 100 })}
                      className="text-brand-600"
                    />
                    <span>Paid Ticket</span>
                  </label>
                  {!formData.is_free && (
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="₹ Amount"
                      className="w-24 px-2.5 py-1.5 rounded-lg border text-xs text-slate-900 dark:text-slate-100"
                    />
                  )}
                </div>
              </div>
            </div>

            <Input
              label="Eligibility"
              placeholder="e.g. Open to all students, bring your college ID."
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            />

            <Input
              label="Rules & Regulations"
              placeholder="e.g. Individual or team participation allowed."
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            />

            {/* Schedule Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Event Schedule / Agenda
                </label>
                <Button size="sm" variant="ghost" onClick={addScheduleItem} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add Session
                </Button>
              </div>

              <div className="space-y-2">
                {formData.schedule.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => updateScheduleItem(idx, 'time', e.target.value)}
                      placeholder="10:00 AM"
                      className="w-24 px-2.5 py-1 text-xs rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateScheduleItem(idx, 'title', e.target.value)}
                      placeholder="Session title"
                      className="flex-1 px-2.5 py-1 text-xs rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      value={item.speaker || ''}
                      onChange={(e) => updateScheduleItem(idx, 'speaker', e.target.value)}
                      placeholder="Speaker (opt)"
                      className="w-32 px-2.5 py-1 text-xs rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hidden sm:block"
                    />
                    <button
                      type="button"
                      onClick={() => removeScheduleItem(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  isLoading={isSubmitting}
                  onClick={() => handlePublish('draft')}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  isLoading={isSubmitting}
                  onClick={() => handlePublish('published')}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Publish Event
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
