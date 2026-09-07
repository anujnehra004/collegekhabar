# 🎓 Campus Connect — University Social & Event Discovery Platform

> **"Your Campus. Your Community. Your Events."**
> A modern, full-stack university digital campus hub where students discover upcoming events, join communities, register with 1 click, network with peers, and organize campus initiatives.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)

---

## ✨ Key Features

- **🚀 High-Impact Landing Page**: Hero banner, live campus stats (16+ events, 2,400+ students, 28+ clubs, 3,200+ registrations), platform showcase mockup, and core pillars.
- **👋 Personalized Student Dashboard**: Dynamic time-of-day greeting (*"Good evening, Anuj 👋"*), upcoming tickets, smart *"Recommended For You"* feed (matching department & interests), and trending campus events.
- **🔍 Event Explorer**: Prominent search bar, category pills (Hackathon, Workshop, Seminar, Cultural, Sports, Technical, Placement, Fest, Social), format filters (In-Person / Online / Hybrid), pricing filters, and sorting.
- **🎟️ Detailed Event Pages**: Large banner, capacity progress indicator with automatic *"Event Full"* state, 1-click registration with confetti celebrations, schedule agenda timeline, speakers, attendee roster, and digital entry pass modal with `.ics` calendar export.
- **🛠️ Multi-Step Event Creation Wizard**: Basic details & image preview $\rightarrow$ Date, time & venue $\rightarrow$ Capacity, rules, pricing & interactive agenda builder $\rightarrow$ Save as Draft or Publish.
- **🏛️ University Clubs / Communities**: Directory for GDSC, Robotics Society, E-Cell, Shutterbugs, KalaKriti Cultural Guild, and ACM Chapter with 1-click Join/Leave and upcoming/past event tabs.
- **🤝 Student Networking**: Connect with peers across departments, manage incoming connection requests, and discover *"People You May Know"*.
- **👤 Student Profiles**: Academic verification (University, Department, Year), skills tags, campus interests, hosted events, and interactive Edit Profile modal.
- **📊 Organizer Analytics Dashboard**: KPI stat cards (Total Events, Total Registrations, Attendance Fill %, Upcoming Events), category turnout charts, attendee management modal, and CSV export for registration desks.
- **🔔 Real-Time Notification Center**: Unread badge counter in top navigation, automatic alerts on registrations, connection requests, and club announcements.
- **⚡ Universal Search (⌘K / Ctrl+K)**: Instant modal search across Events, Communities, and Students simultaneously.
- **📱 Fully Responsive**: Bottom navigation bar on mobile, glassmorphism headers, and accessible modal dialogs.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, PostCSS, Lucide Icons, Canvas Confetti
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Storage Buckets)
- **State Management**: React Context (`AuthContext`, `EventContext`, `NotificationContext`, `ToastProvider`)
- **Dual-Mode Engine**: Native `@supabase/supabase-js` client with an in-app Supabase Connection Manager & offline-first sync fallback.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/anujnehra004/Campus-Connect.git
cd Campus-Connect
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
*(Note: If you run without Supabase credentials, Campus Connect automatically operates in interactive demo mode with 16 events, 6 clubs, 12 students, and all 14 flows operational!)*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🗄️ Supabase Database Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Open the **SQL Editor** in Supabase.
3. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run** to generate tables, RLS policies, automated triggers, and storage buckets.
4. Paste the contents of [`supabase/seed.sql`](./supabase/seed.sql) and click **Run** to populate 16 realistic university events, 6 communities, 12 students, registrations, bookmarks, and notifications.
5. In Campus Connect, click the **"Demo Mode" / "Supabase Active"** badge in the navbar, paste your Supabase URL & Anon Key, and click **Connect**.

---

## 📁 Project Structure

```
campus-connect/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # Sign in with 1-click test personas
│   │   │   ├── signup/page.tsx       # Multi-step student onboarding
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── communities/
│   │   │   ├── page.tsx              # Club directory
│   │   │   └── [id]/page.tsx         # Single club hub & join toggle
│   │   ├── connections/page.tsx      # Student networking center
│   │   ├── dashboard/page.tsx        # Main student dashboard
│   │   ├── events/
│   │   │   ├── [id]/page.tsx         # Event details & tickets
│   │   │   └── create/page.tsx       # Multi-step event creation wizard
│   │   ├── explore/page.tsx          # Event Explorer with faceted filters
│   │   ├── my-events/page.tsx        # Registered, Saved, Created, Attended
│   │   ├── notifications/page.tsx    # Notifications center
│   │   ├── organizer/page.tsx        # Organizer analytics & CSV export
│   │   ├── profile/
│   │   │   ├── page.tsx              # Personal student profile & edit modal
│   │   │   └── [id]/page.tsx         # Public student profile
│   │   ├── globals.css               # Tailwind & micro-interactions
│   │   ├── layout.tsx                # Root layout with providers & Navbar
│   │   └── page.tsx                  # High-impact landing page
│   ├── components/
│   │   ├── communities/              # CommunityCard
│   │   ├── connections/              # ConnectionCard
│   │   ├── events/                   # EventCard, EventFilters, EventRegistrationModal, AttendeeListModal
│   │   ├── layout/                   # Navbar, Footer, MobileNav
│   │   ├── search/                   # GlobalSearchModal (⌘K)
│   │   └── ui/                       # Button, Input, Badge, Modal, Tabs, Toast, Skeleton, SupabaseConfigModal
│   ├── context/                      # AuthContext, EventContext, NotificationContext
│   └── lib/                          # types.ts, utils.ts, storage.ts, client.ts, initialData.ts
├── supabase/
│   ├── schema.sql                    # Production PostgreSQL DDL, RLS & triggers
│   └── seed.sql                      # Realistic sample seed data
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
