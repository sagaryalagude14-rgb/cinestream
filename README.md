# CineStream 🎬🍿

[![Live Demo](https://img.shields.io/badge/Live_Demo-cinestream--two--steel.vercel.app-00DC82?style=for-the-badge&logo=vercel&logoColor=white)](https://cinestream-two-steel.vercel.app/)

[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🚀 **Live Demo:** [https://cinestream-two-steel.vercel.app/](https://cinestream-two-steel.vercel.app/)

A cinematic, modern streaming platform clone built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite**. CineStream provides a video streaming experience inspired by modern entertainment hubs, complete with personalized watch history, smart resume, multi-profile management, and a custom HTML5 video player.

---

## ✨ Features

### 1. ⏱️ Continue Watching & Playback Sync
- **Automatic Progress Persistence:** Automatically captures and syncs viewing timestamps to `localStorage` (`cinestream_watch_history`).
- **Smart Resume Overlay:** Intelligently resumes playback when previous watch progress is between 5% and 95%, with a prompt to resume or start over.
- **Card Progress Indicators:** Displays real-time progress bars (`bg-red-600`) and remaining time badges (e.g., *"14m remaining"*) directly on media cards.
- **Dedicated Carousel:** Prominently highlights active titles directly below the hero banner with instant `(✕)` removal from history.

### 2. 🎥 Advanced Video Player (`WatchPage`)
- Custom playback controls (Play/Pause, Seek Bar with hover previews, Volume/Mute, Fullscreen, Theater Mode).
- **"Skip Intro" (+85s)** overlay button with smooth seek transitions.
- **"Start Over"** button for quick resets.
- Playback speed adjustment (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x).
- Audio and Subtitles track selector.
- Video quality selector (Auto, 1080p, 720p, 480p).
- Keyboard shortcuts: `Space`/`k` (play/pause), `f` (fullscreen), `m` (mute), `j`/`l` or Left/Right arrows (seek ±10s), Up/Down arrows (volume).

### 3. 🍿 Netflix-Inspired Discovery & Browsing
- **Dynamic Hero Banner:** Showcases trending releases with backdrop imagery, trailers, volume toggle, and fast navigation to media playback.
- **Horizontally Scrollable Rows:** Smooth horizontal carousels for *Trending This Week*, *Critically Acclaimed*, *Sci-Fi & Cosmic Horizons*, *Action & Thrillers*, and *TV Series*.
- **Interactive Category Filter Pills:** Quickly filter by *Trending*, *Top Rated*, *Sci-Fi*, *Action*, *TV Shows*, and custom genres.

### 4. ℹ️ Rich Media Preview Modal
- High-definition trailer preview via YouTube embed or video stream.
- Comprehensive metadata: release year, maturity ratings (PG-13, TV-MA, R), match percentage, duration, and genre tags.
- Detailed cast and crew bios with character portraits.
- Multi-season episode picker with thumbnail previews and episode summaries.
- "More Like This" recommendation cards with one-click previewing.

### 5. 👥 Multi-Profile System & Kids Mode
- Multiple user profiles (Default, Kids, Guest).
- **Kids Mode Filtering:** Automatic content gating that filters out mature ratings (`TV-MA`, `R`) and intense themes for family-safe viewing.
- Profile selector modal and quick-switching in the navigation bar.

### 6. 🔖 My List (Watchlist)
- One-click bookmarking of movies and series.
- Persistent watchlist stored locally with responsive grid layout, sorting, and removal controls.

### 7. 🔍 Real-Time Search & Advanced Filters
- Instant debounced search for titles, actors, and directors.
- Slide-over Filter Drawer: filter by release year range, minimum rating, and sort order (Popularity, Rating, Release Date).

### 8. 🌐 Dual-Mode Data Architecture (Online & Offline)
- **TMDB API Integration:** Connects seamlessly to The Movie Database (TMDB) for live trending media, posters, and cast info.
- **Zero-Config Offline Fallback:** Includes rich, curated mock data so the app runs smoothly with zero missing images or broken states even without an API key.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Context API (`WatchHistoryContext`, `SavedMediaContext`, `ProfileContext`)

---

## 📁 Project Structure

```text
cinestream/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx                  # App entry point
│   ├── App.tsx                   # Routes and global Context Providers
│   ├── index.css                 # Tailwind CSS v4 directives & custom scrollbars
│   ├── types/
│   │   └── media.ts              # MediaItem, WatchProgress, Season, Cast types
│   ├── context/
│   │   ├── WatchHistoryContext.tsx  # Continue Watching & time tracking
│   │   ├── SavedMediaContext.tsx    # Watchlist / My List state
│   │   └── ProfileContext.tsx       # User profiles & Kids Mode filter
│   ├── hooks/
│   │   ├── useFetchMedia.ts      # TMDB & mock data fetch hook
│   │   ├── useModal.ts           # Preview modal controller
│   │   └── useDebounce.ts         # Search input debouncer
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx        # Navigation, search, & profile avatar
│   │   │   ├── Footer.tsx        # Responsive footer with links
│   │   │   ├── Modal.tsx         # Accessible modal wrapper
│   │   │   └── SkeletonCard.tsx  # Loading skeleton states
│   │   ├── media/
│   │   │   ├── HeroBanner.tsx    # Featured media banner with preview
│   │   │   ├── MediaCard.tsx     # Card with hover actions & progress bar
│   │   │   ├── MediaRow.tsx      # Smooth carousel row
│   │   │   ├── MediaGrid.tsx     # Grid view for search & list pages
│   │   │   └── VideoPreviewModal.tsx # Full detail & episode modal
│   │   └── filter/
│   │       ├── CategoryPills.tsx # Horizontal genre & category filters
│   │       ├── SearchBar.tsx     # Animated search input
│   │       └── FilterDrawer.tsx  # Advanced filtering panel
│   ├── pages/
│   │   ├── HomePage.tsx          # Main curated landing page
│   │   ├── BrowsePage.tsx        # Category and genre exploration
│   │   ├── MyListPage.tsx        # Saved favorites watchlist
│   │   ├── SearchPage.tsx        # Search results with filter drawer
│   │   ├── ProfileSelectPage.tsx # Profile chooser & manager
│   │   ├── WatchPage.tsx         # Fullscreen HTML5 video player
│   │   └── NotFoundPage.tsx      # 404 error page
│   ├── services/
│   │   ├── tmdbApi.ts            # TMDB API request client
│   │   └── mockData.ts           # Rich offline media fallback dataset
│   └── utils/
│       └── constants.ts          # Image URLs, genre definitions, & helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/sagaryalagude14-rgb/cinestream.git
cd cinestream
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables (Optional)
The application works immediately out-of-the-box using built-in mock data. To fetch live data from The Movie Database (TMDB):

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your TMDB API Read Access Token or API Key:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```

### 4. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
```
Preview the production build:
```bash
npm run preview
```

---

## ⌨️ Video Player Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` / `K` | Toggle Play / Pause |
| `F` | Toggle Fullscreen |
| `M` | Toggle Mute |
| `←` / `J` | Seek Backward 10s |
| `→` / `L` | Seek Forward 10s |
| `↑` | Increase Volume (+10%) |
| `↓` | Decrease Volume (-10%) |
| `Escape` | Exit Fullscreen / Close Modal |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
