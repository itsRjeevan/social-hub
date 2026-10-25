# 🚀 Social Hub — All-in-One Social Media Management Dashboard

A modern, colorful SaaS web application designed to organize and manage Facebook pages, Instagram accounts, and YouTube channels in one unified command center.

---

## 🎯 Key Features

- **🌈 Modern SaaS Visual Design**: Custom color palette with recognizable platform accents (Facebook Blue `#1877F2`, Instagram gradient, YouTube Red `#FF0033`, Vivid Indigo Primary `#5856E9`).
- **📊 Overview Dashboard**:
  - Live metric cards (Total Accounts, Facebook, Instagram, YouTube, Tasks Due Today, Completed Today, In Queue, Action Needed).
  - Animated SVG circular progress indicator updating immediately upon task actions with confetti celebration.
  - Interactive "Today's Tasks" list with filter pills (`All`, `Pending`, `Completed`).
  - Account carousel and quick-action launcher.
- **👥 My Accounts**:
  - Multi-platform support: Facebook Page, Instagram Account, YouTube Channel.
  - Add, edit, view, archive, and delete accounts with image uploads.
  - Dedicated tabbed detail view (Overview, Tasks, Content, Statistics).
  - Search by name/handle and filter by platform or status (Grid and List views).
- **✅ Daily Task Manager**:
  - Filter views: All, Today, Tomorrow, Upcoming, Completed, Overdue.
  - Recurring task support (Daily, Weekly) with independent instance tracking.
  - Bulk complete and bulk delete actions.
  - Priority badges (`Low`, `Medium`, `High`, `Urgent`) and due times.
- **📅 Content Calendar**:
  - Month, Week, and Day calendar views.
  - Color-coded platform chips with content status indicators.
  - Click any calendar date cell to schedule a post/reel/video for that exact date.
- **📚 Content Library**:
  - Centralized store for video ideas, scripts, teleprompter notes, captions, hashtags, and CTA.
  - One-click "Copy Caption" and "Copy Script" buttons with toast confirmation.
  - Workflow status transitions: `Idea` ➔ `Research` ➔ `Script Ready` ➔ `Editing` ➔ `Ready to Publish` ➔ `Published`.
  - Links to external video assets (Google Drive, YouTube, Loom, Vimeo).
- **📈 Analytics & Performance Tracking**:
  - Recharts multi-line chart comparing Facebook, Instagram, and YouTube view growth over time.
  - Top Performing Content leaderboard.
  - Manual metrics logging (Followers/Subscribers, Views, Reach, Likes, Comments, Shares, Posts Published).
  - No fake syncing or simulated platform credentials required.
- **📁 Projects & Campaigns**:
  - Group accounts, tasks, and content into unified production pipelines (e.g. "Psychology Shorts", "Anime Recaps").
  - Calculated completion progress based on actual completed tasks.
- **⚙️ Settings, Backup & Restore**:
  - User profile customization and time zone settings.
  - Full workspace export to JSON and task export to CSV.
  - Safe workspace JSON import with validation and confirmation.
  - Local persistent storage with zero external dependencies and easy migration to Supabase PostgreSQL.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Animations & Effects**: CSS keyframe transitions & Canvas Confetti

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

> **Windows Google Drive Tip**: If your project folder resides on a Google Drive virtual drive (`G:\`), Google Drive may intercept rapid file writes. Run dependencies from standard NTFS disk or use directory junction.

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Start

```bash
npm run build
npm start
```

---

## 🔒 Security & Data Privacy

- Passwords, private API tokens, or OAuth secrets are never requested or stored.
- All workspace data is isolated and safely persisted in your browser's persistent storage.
- An `.env.example` file is included for optional Supabase PostgreSQL configuration.
