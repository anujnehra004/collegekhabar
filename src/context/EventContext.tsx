'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Event, Registration } from '../lib/types';
import { dataService } from '../lib/data/storage';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface EventContextType {
  events: Event[];
  isLoading: boolean;
  registeredEventIds: string[];
  bookmarkedEventIds: string[];
  refreshEvents: () => Promise<void>;
  registerForEvent: (eventId: string) => Promise<{ success: boolean; registration?: Registration; message?: string }>;
  cancelRegistration: (eventId: string) => Promise<boolean>;
  toggleBookmark: (eventId: string) => Promise<boolean>;
  createEvent: (eventData: Omit<Event, 'id' | 'current_participants' | 'created_at'>) => Promise<Event>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  isRegistered: (eventId: string) => boolean;
  isBookmarked: (eventId: string) => boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [bookmarkedEventIds, setBookmarkedEventIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshEvents = useCallback(async () => {
    setIsLoading(true);
    const allEvents = await dataService.getEvents();
    setEvents(allEvents);

    if (user) {
      const userRegs = await dataService.getUserRegistrations(user.id);
      setRegisteredEventIds(userRegs.map((r) => r.event_id));

      const userBookmarks = await dataService.getUserBookmarks(user.id);
      setBookmarkedEventIds(userBookmarks.map((b) => b.id));
    } else {
      setRegisteredEventIds([]);
      setBookmarkedEventIds([]);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const registerForEvent = async (eventId: string) => {
    if (!user) return { success: false, message: 'Please log in to register' };

    const result = await dataService.registerForEvent(eventId, user.id);
    if (result.success) {
      // Trigger festive confetti micro-interaction!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
      setRegisteredEventIds((prev) => [...prev, eventId]);
      await refreshEvents();
    }
    return result;
  };

  const cancelRegistration = async (eventId: string) => {
    if (!user) return false;
    const ok = await dataService.cancelRegistration(eventId, user.id);
    if (ok) {
      setRegisteredEventIds((prev) => prev.filter((id) => id !== eventId));
      await refreshEvents();
    }
    return ok;
  };

  const toggleBookmark = async (eventId: string) => {
    if (!user) return false;
    const isNowBookmarked = await dataService.toggleBookmark(eventId, user.id);
    if (isNowBookmarked) {
      setBookmarkedEventIds((prev) => [...prev, eventId]);
    } else {
      setBookmarkedEventIds((prev) => prev.filter((id) => id !== eventId));
    }
    return isNowBookmarked;
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'current_participants' | 'created_at'>) => {
    const created = await dataService.createEvent(eventData);
    await refreshEvents();
    return created;
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    const updated = await dataService.updateEvent(eventId, updates);
    await refreshEvents();
    return updated;
  };

  const deleteEvent = async (eventId: string) => {
    const ok = await dataService.deleteEvent(eventId);
    if (ok) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
    return ok;
  };

  const isRegistered = (eventId: string) => registeredEventIds.includes(eventId);
  const isBookmarked = (eventId: string) => bookmarkedEventIds.includes(eventId);

  return (
    <EventContext.Provider
      value={{
        events,
        isLoading,
        registeredEventIds,
        bookmarkedEventIds,
        refreshEvents,
        registerForEvent,
        cancelRegistration,
        toggleBookmark,
        createEvent,
        updateEvent,
        deleteEvent,
        isRegistered,
        isBookmarked,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
