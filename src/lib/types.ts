export type EventCategory = 
  | 'Hackathon'
  | 'Workshop'
  | 'Seminar'
  | 'Cultural'
  | 'Sports'
  | 'Technical'
  | 'Competition'
  | 'Club Activity'
  | 'Placement'
  | 'Fest'
  | 'Social'
  | 'Other';

export type EventType = 'offline' | 'online' | 'hybrid';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type RegistrationStatus = 'confirmed' | 'cancelled' | 'attended';
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';
export type NotificationType = 
  | 'connection_request'
  | 'connection_accepted'
  | 'registration_confirmed'
  | 'event_reminder'
  | 'community_event'
  | 'event_update'
  | 'event_cancelled';

export interface ScheduleItem {
  time: string;
  title: string;
  speaker?: string;
  description?: string;
}

export interface Speaker {
  name: string;
  role: string;
  company: string;
  avatar: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  university: string;
  department: string;
  year: string;
  bio: string;
  profile_image: string;
  banner_image?: string;
  skills: string[];
  interests: string[];
  is_organizer: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logo: string;
  cover_image: string;
  member_count: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'admin' | 'lead';
  joined_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  banner_image: string;
  organizer_id: string;
  organizer_name?: string;
  organizer_avatar?: string;
  community_id?: string | null;
  community_name?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  event_type: EventType;
  registration_deadline?: string;
  max_participants: number;
  current_participants: number;
  eligibility: string;
  rules?: string;
  contact_email?: string;
  is_free: boolean;
  price: number;
  status: EventStatus;
  schedule: ScheduleItem[];
  speakers: Speaker[];
  created_at?: string;
  updated_at?: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  status: RegistrationStatus;
  ticket_code: string;
  event?: Event;
  user?: Profile;
}

export interface Bookmark {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
  event?: Event;
}

export interface Connection {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at?: string;
  user?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  related_event_id?: string | null;
  related_user_id?: string | null;
  created_at: string;
}

export interface EventFiltersState {
  searchQuery: string;
  category: string;
  eventType: string; // 'all' | 'offline' | 'online' | 'hybrid'
  dateFilter: string; // 'all' | 'today' | 'this-week' | 'this-month'
  priceFilter: string; // 'all' | 'free' | 'paid'
  sortBy: 'date-asc' | 'date-desc' | 'popularity' | 'recently-added';
}
