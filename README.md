# Wedding SaaS - Digital Invitation Platform 💍✨

A premium, next-generation digital wedding invitation system built for scalability and deep personalization. This platform allows couples to manage their entire digital engagement—from RSVPs and seating maps to their shared narrative—all through a sleek, real-time dashboard.

## 🚀 Key Features

*   **Dynamic Identity**: Full control over wedding titles, logos, and hero photography.
*   **Narrative Timeline**: Interactive "Our Story" section with custom milestones and background photography.
*   **Smart RSVP Flow**: Secure guest confirmation with token-based access, guest counting, and instant ticket generation.
*   **Admin Dashboard**:
    *   **Real-time Analytics**: Tracks confirmations and guest totals live.
    *   **Seating Chart**: Visual drag-and-drop-ready table management and guest mapping.
    *   **Content Editor**: On-the-fly editing of contacts, music, and timelines without redeplication.
*   **Media Experience**: Support for custom background music (MP3) and an optimized, high-performance image gallery.
*   **PWA Ready**: Installable on mobile devices with offline support via Service Workers.

## 🛠 Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS
*   **Animations**: Framer Motion
*   **Backend / Database**: Supabase (Postgres + Realtime)
*   **Storage**: Supabase Storage (for assets, media, and tickets)
*   **Edge Logic**: Supabase Edge Functions (RSVP validation and table logic)
*   **Offline / Perf**: PWA Service Workers + Vite Compression (Gzip/Brotli)

## 🏎 Getting Started

### Prerequisites

*   Node.js (v18+)
*   NPM or Yarn
*   A Supabase Project

### Installation

1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    cd wedding-saas
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env.local` file in the root:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup**:
    Execute the SQL scripts found in `supabase/migrations/` in order. Start with `20260204_tables_setup.sql` and end with `20260204_complete_customization.sql`.

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

*   `/src/pages`: Feature-based route components (Home, Historia, AdminDashboard, etc.)
*   `/src/components`: UI components organized by domain (management, layout, visuals)
*   `/src/contexts`: Global state management via React Context (EventContext)
*   `/src/lib`: Supabase and utility configurations
*   `/public`: Static assets including the custom `sw.js` and soundtrack

## 📜 Migrations Guide

To update a live instance:
1.  Run `20260204_tables_setup.sql` to create the core schema.
2.  Run `20260204_realtime_setup.sql` to enable live dashboard synchronization.
3.  Run `20260204_complete_customization.sql` to enable dynamic music, contacts, and intro texts.

---
Developed with ♥ for unique wedding experiences.
