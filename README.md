# Campus Connect 🎓
> A Modern University Event Discovery, Registration & Administrative Platform

**This project uses Supabase for authentication and database management.**

Built with clean, modern HTML5, CSS3, and Vanilla JavaScript, **Campus Connect** replaces scattered Google Forms, buried email threads, and outdated campus boards with an interactive, responsive, and animated university portal. It is engineered specifically for university student clubs, campus administration, and BTech CSE capstone demonstrations.

---

## 🌟 Key Features

### For Students
- **University Email Authentication**: Secure signup and signin powered by Supabase Auth.
- **Dynamic Event Discovery**: Real-time event catalog with live seat counters, categorized by Technology, Hackathons, Cultural fests, Seminars, Sports meets, and more.
- **Interactive Search & Filtering**: Instant, debounced full-text search with dynamic category pills and multi-criteria sorting (Upcoming Date, Latest Added, Registration Deadline) without reloading the page.
- **Detailed Event Passes**: Complete event schedules, venues, rules, organizer details, and remaining seat tracking.
- **One-Click Event Registration**: Automatic duplicate registration prevention (`UNIQUE(event_id, student_id)`) and deadline verification.
- **My Registered Events Dashboard**: View confirmed tickets, registration dates, and cancel registrations with an animated confirmation modal.
- **Personalized Profile Management**: Update student display name with real-time profile synchronization.

### For Campus Administrators
- **Executive Admin Portal**: High-security login with role verification from the Supabase `profiles` table.
- **Real-Time Analytics Dashboard**: Animated metric counters for Total Events, Active Upcoming Events, Total Registrations, and Total Students.
- **Full Event Lifecycle Management (CRUD)**:
  - Create new campus events with title, category, description, venue, organizer, deadline, seat quotas, and banner images.
  - Modify existing events with immediate live reflection for students.
  - Permanently delete events with cascading cancellation of associated registrations.
- **Attendee Roster & Export**: Searchable participant registry filterable by individual events, with 1-click **Export to CSV** for coordinators.

---

## 💻 Tech Stack

- **Frontend**: HTML5, Modern CSS3 (Vanilla design tokens, CSS variables, glassmorphism), Vanilla JavaScript (ES6+ Modules).
- **Backend & Database**: [Supabase](https://supabase.com) (PostgreSQL 15+).
- **Authentication**: Supabase Auth (Email & Password provider).
- **Client SDK**: Supabase JavaScript Client via official CDN (`@supabase/supabase-js`).
- **Typography**: Google Fonts (`Outfit` for bold modern headings, `Plus Jakarta Sans` for clean body typography).
- **Animations**: GPU-accelerated CSS keyframe animations, micro-interactions, skeleton shimmer loaders, toast alerts, and `IntersectionObserver` scroll reveals.

> **Zero Heavy Frameworks**: No React, Angular, Vue, Bootstrap, or Tailwind. Pure standards-compliant code that is straightforward to read, understand, and explain for CSE coursework.

---

## 📁 Clean Folder Structure

```
campus-connect/
│
├── index.html                  # Landing page with hero, statistics & featured events
├── login.html                  # Student sign-in page with 1-click demo filler
├── signup.html                 # Student registration page with input validation
├── events.html                 # Complete event discovery catalog with search & filters
├── event-details.html          # Dynamic event details page (?id=...) & registration action
├── my-events.html              # Student dashboard & registered passes manager
├── profile.html                # Student profile settings
│
├── admin-login.html            # Dedicated administrator portal login
├── admin-dashboard.html        # Executive metrics dashboard & recent events
├── admin-events.html           # Full event management roster (Edit, Delete, View)
├── admin-add-event.html        # Form to publish new campus events
├── admin-edit-event.html       # Form to modify existing events
├── admin-participants.html     # Registered attendee roster with CSV export
│
├── css/
│   ├── style.css               # Design system tokens, glassmorphism & component styles
│   ├── animations.css          # CSS keyframes, loading spinners, and scroll reveal
│   └── responsive.css          # Breakpoints for desktop, tablet, and mobile
│
├── js/
│   ├── supabase.js             # Supabase client setup & out-of-the-box fallback demo layer
│   ├── auth.js                 # Authentication logic, sessions, and route guards
│   ├── events.js               # Event fetching, formatting, search, and card rendering
│   ├── student.js              # Student registrations, pass management, and profile update
│   ├── admin.js                # Admin dashboard metrics, event CRUD, and CSV exporter
│   └── ui.js                   # Toast notifications, dialog modals, counters & navbars
│
├── assets/
│   └── images/                 # Local media assets and campus icons
│
├── supabase.sql                # Complete PostgreSQL DDL, triggers, RLS policies & seed data
└── README.md                   # Comprehensive project documentation
```

---

## ⚙️ Supabase Setup Guide

Follow these steps to connect your live Supabase database and authentication in under 5 minutes:

### Step 1: Create a Free Supabase Project
1. Visit [supabase.com](https://supabase.com) and click **Start your project**.
2. Name your project (e.g., `Campus Connect`) and choose a strong database password.

### Step 2: Run Database Setup SQL
1. In the Supabase Dashboard left menu, click **SQL Editor** (`</>`).
2. Open `supabase.sql` from this repository, copy all contents, paste them into the SQL Editor, and click **Run**.
3. This creates:
   - `profiles` table (with role check `'student'` or `'admin'`).
   - `events` table (with sample university events).
   - `registrations` table (with `UNIQUE(event_id, student_id)` constraint).
   - Foreign keys, automated `update_updated_at_column()` and `handle_new_user()` triggers.
   - Row Level Security (RLS) policies.

### Step 3: Enable Email / Password Authentication
1. Go to **Authentication** -> **Providers** in the Supabase Dashboard.
2. Ensure **Email** is set to **Enabled**.
3. (Recommended for local testing) In **Authentication** -> **URL Configuration**, turn off "Confirm email" if you want instant login without waiting for email verification links.

### Step 4: Create Demo Users in Supabase
Navigate to **Authentication** -> **Users** and click **Add User** -> **Create User**:

#### 1. Student Demo User:
- **Email**: `student@university.edu`
- **Password**: `student123`
- **Auto Confirm User**: `ON`
- **User Metadata**: `{"name": "Alex Johnson", "role": "student"}`

#### 2. Admin Demo User:
- **Email**: `admin@campusconnect.edu`
- **Password**: `Admin@123`
- **Auto Confirm User**: `ON`
- **User Metadata**: `{"name": "Campus Administrator", "role": "admin"}`

*(Optional)* Run this query in the SQL Editor to ensure the admin profile role is saved:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@campusconnect.edu';
```

### Step 5: Configure Frontend Credentials
Open [js/supabase.js](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/campus-connect/js/supabase.js) and update the `SUPABASE_CONFIG` object with your project details:

```javascript
const SUPABASE_CONFIG = {
  URL: 'https://xyzcompany.supabase.co',        // Found in Project Settings -> API -> Project URL
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'  // Found in Project Settings -> API -> Project API Keys (anon public)
};
```

> ⚠️ **Security Reminder**: **NEVER** expose your `service_role` key in frontend code. Only use the `anon` public key. Supabase Row Level Security (RLS) protects all data based on the authenticated user's session.

---

## 🚀 How to Run Locally

### Option 1: VS Code Live Server (Recommended)
1. Open the `campus-connect` folder in Visual Studio Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click [index.html](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/campus-connect/index.html) and select **Open with Live Server**.

### Option 2: Python Static HTTP Server
Run from the `campus-connect` directory in your terminal:
```bash
python -m http.server 8080
```
Then open `http://localhost:8080` in your web browser.

---

## 🔑 Demo Credentials

For quick grading and demonstrations, 1-click **Auto-Fill** buttons are provided on both login pages:

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **Student** | `student@university.edu` | `student123` | [login.html](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/campus-connect/login.html) |
| **Admin** | `admin@campusconnect.edu` | `Admin@123` | [admin-login.html](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/campus-connect/admin-login.html) |

---

## 🔒 Row Level Security (RLS) Architecture

Campus Connect implements strict PostgreSQL Row Level Security:

1. **Events Table**:
   - `SELECT`: Public access (anyone can view upcoming events).
   - `INSERT`, `UPDATE`, `DELETE`: Restricted to authenticated users with `role = 'admin'` in `profiles`.
2. **Registrations Table**:
   - `SELECT`: Students can only read their own registrations (`student_id = auth.uid()`); admins can read all registrations.
   - `INSERT`: Students can only register themselves (`student_id = auth.uid()`).
   - `UPDATE`: Students can modify their own booking status (e.g. `cancelled`).
3. **Profiles Table**:
   - Students can view and update their own name; admins can view all user profiles for roster generation.

---

## 🔮 Future Improvements
- QR Code ticket generator for contactless entry check-in on event day.
- Direct automated email calendar invites (.ics attachment) upon registration.
- Student club leader submission workflow with administrative review and approval.
