'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Download, Search, Check, User, Mail, ShieldCheck } from 'lucide-react';
import { Registration, Profile, Event } from '@/lib/types';
import { dataService } from '@/lib/data/storage';
import { useToast } from '../ui/Toast';
import { formatDate } from '@/lib/utils';

interface AttendeeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export function AttendeeListModal({ isOpen, onClose, event }: AttendeeListModalProps) {
  const [attendees, setAttendees] = useState<(Registration & { user: Profile })[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadAttendees() {
      if (!isOpen) return;
      setIsLoading(true);
      const data = await dataService.getEventAttendees(event.id);
      setAttendees(data);
      setIsLoading(false);
    }
    loadAttendees();
  }, [isOpen, event.id]);

  const filteredAttendees = attendees.filter(
    (a) =>
      a.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.user.email.toLowerCase().includes(search.toLowerCase()) ||
      a.ticket_code.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    if (attendees.length === 0) {
      toast.info('No attendees', 'There are no registered attendees to export.');
      return;
    }

    const headers = ['Full Name', 'Email', 'University', 'Department', 'Year', 'Ticket Code', 'Registered At'];
    const rows = attendees.map((a) => [
      `"${a.user.full_name}"`,
      `"${a.user.email}"`,
      `"${a.user.university}"`,
      `"${a.user.department}"`,
      `"${a.user.year}"`,
      `"${a.ticket_code}"`,
      `"${a.registered_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV Exported', `Exported ${attendees.length} attendee records.`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={`Attendees: ${event.title}`}
      description={`${attendees.length} registered students • Capacity: ${event.max_participants}`}
    >
      <div className="space-y-4">
        {/* Search & Export toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-64">
            <Input
              placeholder="Search by name, email, ticket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>

        {/* Attendees table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading attendee roster...</div>
          ) : filteredAttendees.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No attendees found.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Ticket Pass</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredAttendees.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 flex items-center gap-2.5">
                      <img
                        src={item.user.profile_image}
                        alt={item.user.full_name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.user.full_name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{item.user.email}</p>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      <p className="truncate max-w-[150px]">{item.user.department}</p>
                      <span className="text-[10px] text-slate-400">{item.user.year}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.ticket_code}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Confirmed</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
}
