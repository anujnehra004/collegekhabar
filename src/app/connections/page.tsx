'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  UserPlus, 
  Users, 
  Search, 
  Sparkles, 
  Clock, 
  Check, 
  X,
  GraduationCap
} from 'lucide-react';
import { Profile, Connection } from '@/lib/types';
import { dataService } from '@/lib/data/storage';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { ConnectionCard } from '@/components/connections/ConnectionCard';

export default function ConnectionsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState<(Connection & { user: Profile })[]>([]);
  const [pendingRequests, setPendingRequests] = useState<(Connection & { user: Profile })[]>([]);
  const [recommended, setRecommended] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = user?.id || 'd0000000-0000-0000-0000-000000000001';

  const loadConnections = async () => {
    setIsLoading(true);
    const [conns, pending, recs] = await Promise.all([
      dataService.getConnections(currentUserId),
      dataService.getPendingRequests(currentUserId),
      dataService.getRecommendedConnections(currentUserId),
    ]);
    setConnections(conns);
    setPendingRequests(pending);
    setRecommended(recs);
    setIsLoading(false);
  };

  useEffect(() => {
    loadConnections();
  }, [currentUserId]);

  const handleSendRequest = async (targetId: string) => {
    await dataService.sendConnectionRequest(currentUserId, targetId);
    await loadConnections();
  };

  const handleAcceptRequest = async (connectionId: string) => {
    await dataService.respondToConnectionRequest(connectionId, true);
    await loadConnections();
  };

  const handleRejectRequest = async (connectionId: string) => {
    await dataService.respondToConnectionRequest(connectionId, false);
    await loadConnections();
  };

  const filteredConnections = connections.filter(
    (c) =>
      c.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.user.department.toLowerCase().includes(search.toLowerCase()) ||
      c.user.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const tabs = [
    { id: 'connections', label: `My Connections (${connections.length})` },
    { id: 'requests', label: `Requests (${pendingRequests.length})`, badge: pendingRequests.length > 0 ? pendingRequests.length : undefined },
    { id: 'discover', label: `People You May Know (${recommended.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
          <UserCheck className="w-4 h-4" />
          <span>Campus Networking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Student Connections
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Expand your university network. Find hackathon teammates, research partners, and student innovators across departments.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'connections' && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search your connections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        )}
      </div>

      {/* Tab 1: My Connections */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          {filteredConnections.length === 0 ? (
            <div className="py-16 text-center space-y-3 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No connections found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the &ldquo;People You May Know&rdquo; tab to connect with peers in your department!
              </p>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('discover')}>
                Discover Peers
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConnections.map((conn) => (
                <ConnectionCard
                  key={conn.id}
                  profile={conn.user}
                  status="connected"
                  connectionId={conn.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Incoming Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              No pending connection requests at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map((req) => (
                <ConnectionCard
                  key={req.id}
                  profile={req.user}
                  status="pending_received"
                  connectionId={req.id}
                  onAccept={() => handleAcceptRequest(req.id)}
                  onReject={() => handleRejectRequest(req.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: People You May Know */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 text-xs text-brand-800 dark:text-brand-300 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
            <span>
              Suggestions based on your university (<strong>{user?.university || 'National Institute of Technology'}</strong>), department (<strong>{user?.department || 'Engineering'}</strong>), and shared hackathon &amp; tech interests.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((prof) => (
              <ConnectionCard
                key={prof.id}
                profile={prof}
                status="none"
                onConnect={() => handleSendRequest(prof.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
