'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CheckCircle2, Calendar, MapPin, Download, Share2, Ticket } from 'lucide-react';
import { Event, Registration } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '../ui/Toast';

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  registration?: Registration;
}

export function EventRegistrationModal({
  isOpen,
  onClose,
  event,
  registration,
}: EventRegistrationModalProps) {
  const toast = useToast();

  const handleDownloadCalendar = () => {
    // Generate simple .ics calendar file
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Campus Connect//Event//EN
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, ' ')}
LOCATION:${event.location}
DTSTART:${event.event_date.replace(/-/g, '')}T090000Z
DTEND:${event.event_date.replace(/-/g, '')}T180000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Calendar Added', 'Downloaded .ics file for your calendar.');
  };

  const ticketCode = registration?.ticket_code || 'TKT-CONFIRMED-2026';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
          <span>You&apos;re Registered! 🎉</span>
        </div>
      }
      description="Your registration has been confirmed. We have saved your spot."
    >
      <div className="space-y-6">
        {/* Digital Ticket Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200 flex items-center gap-1.5">
              <Ticket className="w-4 h-4" />
              <span>Campus Entry Pass</span>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-mono font-bold tracking-wider">
              {ticketCode}
            </span>
          </div>

          <h4 className="text-base font-bold mb-3">{event.title}</h4>

          <div className="grid grid-cols-2 gap-3 text-xs text-brand-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-200 shrink-0" />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-brand-200 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">What happens next?</p>
          <p>• We have added this to your <strong>My Events</strong> dashboard tab.</p>
          <p>• You will receive a reminder notification prior to the event commencement.</p>
          <p>• Present your digital pass or college ID at the registration desk.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            className="flex-1"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleDownloadCalendar}
          >
            Add to Calendar
          </Button>

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
