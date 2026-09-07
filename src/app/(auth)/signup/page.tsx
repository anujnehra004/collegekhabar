'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft, Check, User, Mail, Lock, GraduationCap, Compass, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil & Environmental Engineering',
  'Design & Human-Computer Interaction',
  'Management & Business Studies',
  'Fine Arts & Media Studies',
  'Physical Education & Sports',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Postgraduate'];

const AVAILABLE_INTERESTS = [
  'Hackathons',
  'AI & ML',
  'Web Development',
  'Robotics',
  'Startup Pitching',
  'UI/UX Design',
  'Competitive Coding',
  'Photography',
  'Cultural Fests',
  'Badminton & Sports',
  'Cybersecurity',
  'Placement Drives',
  'Open Source',
  'Research Seminars',
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const toast = useToast();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    university: 'National Institute of Technology',
    department: 'Computer Science & Engineering',
    year: '1st Year',
    interests: ['Hackathons', 'Web Development'],
    bio: 'Excited to discover campus events and collaborate on cool tech projects!',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    is_organizer: false,
  });

  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.full_name || !formData.email || !formData.password) {
        toast.error('Missing fields', 'Please enter your name, email, and password.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (formData.interests.length === 0) {
        toast.error('Pick at least one', 'Select at least one campus interest.');
        return;
      }
      setStep(4);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    const res = await signup(formData);
    setIsLoading(false);

    if (res.success) {
      toast.success('🎉 Welcome to Campus Connect!', 'Your profile has been created.');
      router.push('/dashboard');
    } else {
      toast.error('Signup Failed', res.message || 'Could not complete registration.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-600 text-white items-center justify-center shadow-md shadow-brand-500/30 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Join Campus Connect
          </h1>
          <p className="text-xs text-slate-500">
            Step {step} of 4: {step === 1 ? 'Account' : step === 2 ? 'Academics' : step === 3 ? 'Interests' : 'Profile'}
          </p>

          {/* Stepper Bar */}
          <div className="w-full max-w-xs mx-auto flex items-center justify-between gap-2 pt-2">
            {[1, 2, 3, 4].map((s) => (
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
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Anuj Verma"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="student@campus.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Create Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Must be at least 6 characters"
                required
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Academics
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: University & Department */}
          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <Input
                label="University / Institution"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                leftIcon={<GraduationCap className="w-4 h-4" />}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Course / Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Current Year
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {YEARS.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setFormData({ ...formData, year: yr })}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        formData.year === yr
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button type="submit" variant="primary" className="flex-1" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Select Interests
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Interests & Passions */}
          {step === 3 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                  What are you excited to explore on campus?
                </h3>
                <p className="text-xs text-slate-500">
                  We use this to personalize your dashboard recommendations. Pick at least 2.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {AVAILABLE_INTERESTS.map((interest) => {
                  const isSelected = formData.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button type="submit" variant="primary" className="flex-1" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Customize Profile
                </Button>
              </div>
            </form>
          )}

          {/* STEP 4: Bio & Avatar */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Complete Your Student Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Add a short bio so clubs and peers can connect with you.
                </p>
              </div>

              <div className="flex items-center gap-4 py-2">
                <img
                  src={formData.profile_image}
                  alt={formData.full_name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-brand-500/20 shadow-md"
                />
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Avatar Selection</p>
                  <p className="text-slate-500 text-[11px]">Choose a style or use generated student avatar</p>
                  <div className="flex gap-2 pt-1">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
                    ].map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, profile_image: img })}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 ${
                          formData.profile_image === img ? 'border-brand-600 scale-110' : 'border-transparent'
                        }`}
                      >
                        <img src={img} alt="choice" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Student Bio
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell campus peers about your passions, favorite stacks, or what you are looking to build..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                <input
                  type="checkbox"
                  id="organizer-check"
                  checked={formData.is_organizer}
                  onChange={(e) => setFormData({ ...formData, is_organizer: e.target.checked })}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <label htmlFor="organizer-check" className="cursor-pointer text-slate-700 dark:text-slate-300">
                  I plan to host or organize campus events & club activities
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  className="flex-1"
                  isLoading={isLoading}
                  onClick={handleFinish}
                  rightIcon={<Sparkles className="w-4 h-4" />}
                >
                  Enter Campus Connect
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
