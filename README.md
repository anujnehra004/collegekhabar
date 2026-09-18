# Campus Connect 🎓

> A modern university event discovery, registration, and management platform.

Campus Connect is a web-based platform designed to bring university events into one centralized place. Students can discover upcoming events, explore complete event details, register for events, and manage their registrations.

The platform also provides an **Admin Portal** for authorized administrators to create, update, delete, and manage university events and participants.

## 🔗 Project Links

* 🌐 **Live Demo:** https://collegekhabar.netlify.app
* 💻 **GitHub Repository:** https://github.com/anujnehra004/collegekhabar

---

## ✨ Features

### 👨‍🎓 Student Portal

* 🔐 Secure authentication using Supabase
* 📅 Browse upcoming university events
* 🔎 Search and filter events by category
* 📋 View complete event information
* 🎟️ Register for events
* 📊 View available seats
* 🎫 Manage registered events
* ❌ Cancel event registrations
* 👤 Manage personal profile

### 🛠️ Admin Portal

* 🔑 Secure administrator authentication
* 📊 Dashboard with event and registration statistics
* ➕ Create new events
* ✏️ Edit existing events
* 🗑️ Delete events
* 👥 View registered participants
* 📥 Export participant data to CSV
* 🔄 Manage event information

---

## 🖥️ Tech Stack

| Technology            | Purpose                            |
| --------------------- | ---------------------------------- |
| **HTML5**             | Website structure                  |
| **CSS3**              | Responsive design, animations & UI |
| **JavaScript (ES6+)** | Application logic & interactions   |
| **Supabase**          | Authentication & backend services  |
| **PostgreSQL**        | Database                           |
| **Google Fonts**      | Typography                         |
| **Netlify**           | Deployment                         |

> Built with **Vanilla HTML, CSS, and JavaScript** without React, Angular, Vue, Bootstrap, or Tailwind.

---

## 🗄️ Supabase Integration

Campus Connect uses **Supabase** for authentication, database management, and security.

### Supabase provides:

* 🔐 Email/password authentication
* 👤 Student and administrator profiles
* 📅 Event management
* 🎟️ Event registrations
* 🗃️ PostgreSQL database
* 🔒 Row Level Security (RLS)

### Main Database Tables

```text
profiles
events
registrations
```

Row Level Security policies help ensure that users can only access and modify data according to their assigned role and permissions.

---

## 📁 Project Structure

```text
collegekhabar/
│
├── index.html
├── login.html
├── signup.html
├── events.html
├── event-details.html
├── my-events.html
├── profile.html
│
├── admin-login.html
├── admin-dashboard.html
├── admin-events.html
├── admin-add-event.html
├── admin-edit-event.html
├── admin-participants.html
│
├── css/
│   ├── style.css
│   ├── animations.css
│   └── responsive.css
│
├── js/
│   ├── supabase.js
│   ├── auth.js
│   ├── events.js
│   ├── student.js
│   ├── admin.js
│   └── ui.js
│
├── assets/
│   └── images/
│
├── supabase.sql
└── README.md
```

---

## ⚙️ Supabase Setup

### 1. Create a Supabase Project

Create a new project from the Supabase dashboard.

### 2. Set Up the Database

Open the **SQL Editor** in your Supabase dashboard and run the contents of:

```text
supabase.sql
```

This creates the required tables, relationships, triggers, and Row Level Security policies.

### 3. Enable Authentication

Navigate to:

```text
Authentication → Providers → Email
```

Enable **Email/Password authentication**.

### 4. Configure Supabase Credentials

Open:

```text
js/supabase.js
```

Add your Supabase project URL and public anonymous key:

```javascript
const SUPABASE_CONFIG = {
    URL: 'YOUR_SUPABASE_PROJECT_URL',
    ANON_KEY: 'YOUR_SUPABASE_ANON_KEY'
};
```

> ⚠️ **Security:** Never expose your Supabase `service_role` key in frontend code. Use the public `anon` key together with appropriate Row Level Security policies.

---

## 🚀 Run Locally

### Clone the Repository

```bash
git clone https://github.com/anujnehra004/collegekhabar.git
```

### Open the Project

Open the project folder in **Visual Studio Code**.

### Using Live Server

Install the **Live Server** extension and open `index.html` using:

```text
Open with Live Server
```

### Using Python

Alternatively, run:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

---

## 🔐 Demo Access

For security reasons, login credentials are not publicly listed in this repository.

The application contains separate **Student** and **Admin** portals for demonstrating role-based functionality.

---

## 🔒 Security

Campus Connect uses **Supabase Authentication and Row Level Security (RLS)** to control access to application data.

* Students can access their own registrations.
* Students can register for available events.
* Administrators can manage event information.
* Administrators can view participant data.
* Database operations are protected through authentication and RLS policies.

---

## 📱 Responsive & Interactive UI

The platform is designed to provide a consistent experience across:

* 💻 Desktop
* 📱 Mobile
* 📟 Tablet

The interface includes:

* Smooth CSS animations
* Responsive layouts
* Interactive event cards
* Loading states
* Toast notifications
* Modal dialogs
* Modern UI components
* Scroll-based animations

---

## 🔮 Future Improvements

* 🎫 QR-code based event tickets
* 📧 Automated registration confirmation emails
* 📅 Calendar integration
* 🔔 Event reminders and notifications
* 🏫 Student club event submission system
* 📊 Advanced event analytics

---

## 🎯 Project Objective

Campus Connect was developed to provide a centralized digital solution for discovering and managing university events while demonstrating practical implementation of:

**Frontend Development • JavaScript • Authentication • Database Integration • CRUD Operations • Role-Based Access • Responsive UI • Deployment**

---

## 🌐 Live Demo

**https://collegekhabar.netlify.app**

## 💻 Source Code

**https://github.com/anujnehra004/collegekhabar**

---

⭐ If you found this project useful, consider giving the repository a star.
