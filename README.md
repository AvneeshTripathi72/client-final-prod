# 🌌 Magnevents — Premium Live Artist Booking Platform

Welcome to **Magnevents**, a state-of-the-art, high-end booking platform designed for securing India's top-tier live musical talent, acoustic singers, Sufi rock bands, anchors, and performers for luxury house parties, corporate mixers, weddings, and elite private gatherings.

This repository features a unified dual-dashboard system containing both the client-facing presentation portal and the robust administrator content management system (CMS).

---

## 🏗️ Repository Architecture

The project is structured into two independent Next.js applications:

```text
client-final-prod/
├── admin_dahsboard/       # Next.js CMS Admin Portal (Port 9002)
│   ├── src/app/           # Next.js App Router (TypeScript)
│   ├── src/components/    # Reusable shadcn/ui admin components
│   └── tailwind.config.ts # Admin UI layout tokens
│
└── user_dashboard1/       # Premium Client Booking Portal (Port 3000)
    ├── app/               # Next.js App Router (JavaScript)
    ├── app/components/    # Custom luxury UI widgets
    ├── app/styles/        # Curated vanilla CSS design tokens & layouts
    └── public/assets/     # High-resolution media assets
```

---

## 🎨 Tech Stack & Framework Design

### User Experience Portal (`user_dashboard1`)

* **Core:** Next.js, React, ES6 Javascript.
* **Styling System:** Vanilla CSS designed with **glassmorphism**, floating glow parameters, HSL tailored color schemes, custom animations, and responsive breakpoints.
* **Database & Integrations:** Supabase Realtime Client, PostgreSQL database schemas, dynamic email/contact routing hooks.

### Content Management System (`admin_dahsboard`)

* **Core:** Next.js, React, TypeScript.
* **Styling System:** TailwindCSS unified with **shadcn/ui** components.
* **Management Features:** Real-time database sync for category sorting, direct video gallery management, price plan modifiers, and blog CMS templates.

---

## 🚀 Key Features

### 💻 Elite Responsive Design

* **Header CTA Pill System:** The desktop navigation CTA buttons scale down on mobile viewports into compact, space-optimized pill buttons positioned perfectly alongside the brand logo and hamburger toggler.
* **Interactive Accordion Footer:** Modern visual headers on mobile collapse cleanly with gold-trimmed expand chevrons to minimize vertical scrolling and maximize visual appeal.
* **Responsive Title Typography:** Automatic title viewport clamping dynamically resizes massive header texts (from `84px` down to `26px`) to ensure absolute readability on smaller viewports.

### 📝 CMS & Media Management

* **Advanced Blog System:** Dynamic database-backed editorial pages that pull content in real-time, falling back cleanly to premium predefined presets if empty.
* **Drag-and-Drop Form Interactivity:** Fluid drag-and-drop file inputs on the artist registry portals for instant uploads.
* **Services Interactive Gallery:** Multi-category video playlists featuring lazy-loading YouTube/Vimeo links with glassmorphic book overlays.

---

## 🛠️ Local Development & Quick Start

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) and [npm](https://www.npmjs.com/) installed on your machine.

---

### Setup 1: Client Portal (`user_dashboard1`)

1. Open a terminal and navigate to the directory:
   ```bash
   cd user_dashboard1
   ```
2. Install the local package dependencies:
   ```bash
   npm install
   ```
3. Create your local environment file:
   ```bash
   cp .env.example .env
   ```
4. Run the Next.js development server:
   ```bash
   npm run dev
   ```

   *The client portal will be available at: **`http://localhost:3000`***

---

### Setup 2: Admin Dashboard (`admin_dahsboard`)

1. Open a second terminal window and navigate to the directory:
   ```bash
   cd admin_dahsboard
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Set up your local environment file:
   ```bash
   cp .env.example .env
   ```
4. Start the Turbopack development server on port 9002:
   ```bash
   npm run dev -- -p 9002
   ```

   *The admin portal will be available at: **`http://localhost:9002`***

---

## 📦 Git Workflow & Committing Changes

This project maintains a clean, single-repository status without submodule complications. To commit changes across both dashboards, simply track the files normally at the parent level:

```bash
# 1. Stage all changes across user_dashboard1 and admin_dahsboard
git add .

# 2. Commit with a clear, professional message
git commit -m "feat: implement responsive mobile layouts and collapsible accordion structures"

# 3. Push to your main GitHub repository
git push origin master:main
```

---

*Developed with ❤️ for Magnevents — Crafting Unforgettable Intimate Musical Experiences.*
