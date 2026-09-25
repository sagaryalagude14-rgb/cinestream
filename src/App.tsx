import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { SavedMediaProvider } from './context/SavedMediaContext';
import { WatchHistoryProvider } from './context/WatchHistoryContext';
import { ProfileProvider } from './context/ProfileContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { SearchPage } from './pages/SearchPage';
import { MyListPage } from './pages/MyListPage';
import { WatchPage } from './pages/WatchPage';
import { ProfileSelectPage } from './pages/ProfileSelectPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Main layout with sticky navbar and footer
const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-red-600 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ProfileProvider>
      <SavedMediaProvider>
        <WatchHistoryProvider>
          <BrowserRouter>
            <Routes>
              {/* Fullscreen Video Player (No Shell) */}
              <Route path="/watch/:id" element={<WatchPage />} />

              {/* Dedicated Profile Selector (No standard header/footer shell) */}
              <Route path="/profiles" element={<ProfileSelectPage />} />

              {/* Platform Standard Routes with Global Shell */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/browse/:type" element={<BrowsePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/my-list" element={<MyListPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WatchHistoryProvider>
      </SavedMediaProvider>
    </ProfileProvider>
  );
}


