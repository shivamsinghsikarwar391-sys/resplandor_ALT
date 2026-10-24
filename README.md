# Resplandor ATL — Luxury Nail Artistry & Functional Booking System

A full-stack, responsive web application and appointment scheduling system built for **Resplandor ATL**, an appointment-focused nail studio based in **Snellville, Georgia (Metro Atlanta)**.

Official Instagram: [https://www.instagram.com/resplandor.atl/](https://www.instagram.com/resplandor.atl/)

---

## 💅 Features Overview

### 1. Customer Booking Experience
* **Dynamic Time Slots**: When a customer picks a date, available slots are calculated live based on salon operating hours, blackout dates, and existing confirmed bookings.
* **Double-Booking & Conflict Prevention**: Confirmed slots are automatically locked and disabled with a "Booked" badge.
* **Unique Booking Reference**: Every request is saved in the database with a human-readable reference (e.g. `RATL-9A4B2C`).
* **Honest "Pending Confirmation" Status**: Transparently explains that the salon reviews availability before booking is finalized.
* **Live Status Tracking**: Customers can look up their live booking status anytime by reference code or phone number.
* **Customer Data Privacy**: Contact details are encrypted and stored in the backend database solely for scheduling coordination, with an expandable customer privacy commitment.

### 2. Salon Owner Admin Portal (`#admin`)
* **Secure Authentication**: Protected by one-way salted bcrypt password hashing and JWT sessions.
* **Appointment Management**: Filter by status (*Pending*, *Confirmed*, *Rescheduled*, *Completed*, *Cancelled*, *Rejected*), date, or text search (name, phone, reference).
* **1-Click Approval**: Approves request and checks for scheduling conflicts before confirming.
* **Interactive Rescheduling**: Pick a new date and live time slot, with conflict validation.
* **Polite Rejection**: Enter custom client explanation notes.
* **Working Hours & Blackout Rules**: Manage daily open/close hours and add vacation/holiday blocked dates directly in the dashboard.
* **Honest Notification Reporting**: Explicitly displays whether real notifications were delivered via configured providers or logged in unconfigured simulation mode.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: React 19, Tailwind CSS 3.4, Lucide React, Vite 8
* **Backend API**: Node.js, Express 5, CORS, Dotenv, JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`)
* **Database**: Persistent Disk-Backed SQLite (`better-sqlite3` with WAL mode and atomic transactions)
* **Testing**: Puppeteer Chromium/Edge automated verification suite

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
* **Node.js**: v18.0.0 or later (Tested on v24.14.0)
* **npm**: v9.0.0 or later

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server (Frontend + Backend Concurrently)
```bash
npm run dev
```
* **Frontend**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
* **Backend API**: [http://localhost:3001](http://localhost:3001)

### 4. Admin Portal Login
* Navigate to [http://127.0.0.1:5173/#admin](http://127.0.0.1:5173/#admin) or click **Salon Owner Portal** in the website footer.
* Sign in with the administrator credentials configured for your deployment.

---

## 📁 Project Structure

```
Resplandor_ATL/
├── firestore.rules             # Production Firebase Security Rules (if deploying to Firestore)
├── server/
│   ├── data/
│   │   └── resplandor.db       # Persistent SQLite database file
│   ├── middleware/
│   │   ├── auth.js             # JWT verification middleware
│   │   └── validation.js       # Server-side booking validation
│   ├── routes/
│   │   ├── admin.js            # Admin authentication, approval, reschedule endpoints
│   │   ├── appointments.js     # Public booking submission & tracking endpoints
│   │   └── settings.js         # Salon working hours & blackout dates endpoints
│   ├── services/
│   │   ├── availabilityService.js # Live slot calculation & conflict locking
│   │   ├── db.js               # Database schema initialization & admin seeding
│   │   └── notificationService.js # Pluggable notification dispatcher
│   └── index.js                # Express API server entry point
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx # Full salon owner administration portal
│   │   ├── common/
│   │   │   └── LuxuryImage.jsx # Image wrapper with loading skeleton & graceful fallback
│   │   ├── icons/
│   │   │   └── InstagramIcon.jsx # Tailored SVG icon matching Lucide geometry
│   │   ├── About.jsx           # Editorial About section
│   │   ├── BookingForm.jsx     # Upgraded dynamic booking form with live slots
│   │   ├── FAQ.jsx             # 6-item accordion
│   │   ├── Footer.jsx          # Semantic footer with admin & tracking links
│   │   ├── Gallery.jsx         # Masonry Pinterest-style portfolio with Lightbox
│   │   ├── Hero.jsx            # Editorial Hero screen with Snellville, GA badge
│   │   ├── InstagramCTA.jsx    # Visual Instagram follow callout
│   │   ├── Navbar.jsx          # Sticky header with tracking & booking CTAs
│   │   ├── Services.jsx        # 6 signature service cards with preselection CTAs
│   │   ├── TrackModal.jsx      # Live appointment tracking modal
│   │   └── WhyChooseUs.jsx     # 4 value pillars with minimal luxury icons
│   ├── data/
│   │   ├── faqs.js             # Centralized FAQ Q&A content
│   │   ├── gallery.js          # Centralized portfolio items & categories
│   │   └── services.js         # Centralized service offerings & details
│   ├── services/
│   │   └── api.js              # Client-side API abstraction for all endpoints
│   ├── App.jsx                 # Main layout & cross-component state synchronization
│   ├── index.css               # Tailwind directives & luxury design utilities
│   └── main.jsx                # React root mount
├── scripts/
│   └── test-booking-system.js  # Automated E2E test suite (API + Puppeteer)
├── .env.example                # Example environment variables
├── .env                        # Local environment configuration
└── vite.config.js              # Vite proxy configuration
```

---

## ⚙️ Notification Provider Configuration

By default, the application runs in **honest unconfigured mode**: approval actions are logged on the server and recorded in the database as `notification_status: "unconfigured"`, without falsely claiming an email or SMS was sent.

To enable real notifications, add your provider keys to `.env`:

### Resend Email Integration
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=Resplandor ATL <appointments@resplandor-atl.com>
```

### Twilio SMS Integration
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC_your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+14705550192
```

---

## 🔥 Firebase Compatibility

If choosing Firebase for cloud hosting:
1. **Firestore Rules**: Use the bundled `firestore.rules` file which enforces that public visitors can only create `Pending` appointments and cannot approve or modify bookings.
2. **Admin Auth**: Enable Firebase Authentication with email/password for `owner@resplandor-atl.com`.
3. **Cloud Functions**: Deploy sensitive booking approval and notification dispatching through Firebase Functions using the same logic provided in `server/routes/admin.js`.

---

## 🧪 Automated Testing

To run the complete verification suite (Backend API validation + Double-booking conflict testing + Headless browser E2E test):

```bash
node scripts/test-booking-system.js
```

---

## 🚢 Deployment Guide

### Deploying to Render / Railway / Fly.io (Full Stack)
1. Set Build Command: `npm install && npm run build`
2. Set Start Command: `npm run start` (starts the Express server, which serves both the `/api` routes and the static production frontend from `dist/`).
3. Set Environment Variables: `NODE_ENV=production`, `PORT=3001`, `JWT_SECRET=your_production_secret`.

---

## 📄 License & Attribution

Designed and engineered for **Resplandor ATL**, Snellville, Georgia.
All brand names and references belong to their respective owners.


Username resplandor_owner
Admin password nails@2026