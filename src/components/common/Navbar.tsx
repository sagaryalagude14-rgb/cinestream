import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Film, Menu, X, Check, Bookmark, Play, ChevronDown, User, Settings, LogOut, Shield, Users } from 'lucide-react';
import { useSavedMedia } from '../../context/SavedMediaContext';
import { useProfile } from '../../context/ProfileContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { savedList } = useSavedMedia();
  const { profiles, activeProfile, selectProfile, updateProfile } = useProfile();

  // Scroll detection for solid background transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync search input with URL if on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const q = new URLSearchParams(location.search).get('q') || '';
      setSearchQuery(q);
      setIsSearchOpen(true);
    }
  }, [location]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/browse/movies' },
    { name: 'TV Shows', path: '/browse/tv' },
    {
      name: 'My List',
      path: '/my-list',
      badgeCount: savedList.length,
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-zinc-950/95 backdrop-blur-md shadow-lg border-b border-zinc-900/80 py-3'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="group flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-100 hover:text-white transition-colors"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${activeProfile.isKidsMode ? 'bg-amber-500 shadow-amber-900/40 text-zinc-950 font-black' : 'bg-red-600 shadow-red-900/40 text-white'} shadow-md group-hover:scale-105 transition-all`}>
                <Film className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Cine<span className={activeProfile.isKidsMode ? 'text-amber-400' : 'text-red-500'}>Stream</span></span>
                {activeProfile.isKidsMode && (
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 tracking-wider">
                    Kids
                  </span>
                )}
              </span>
            </Link>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative py-1 text-sm tracking-wide transition-colors hover:text-white ${
                      isActive ? 'text-white font-semibold' : 'text-zinc-400'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <span className="flex items-center gap-1.5">
                      {link.name}
                      {typeof link.badgeCount === 'number' && link.badgeCount > 0 && (
                        <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white leading-none">
                          {link.badgeCount}
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                      )}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Zone 3: Search, Notifications, Profile Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input Container */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div
                className={`flex items-center transition-all duration-300 rounded-full border ${
                  isSearchOpen
                    ? 'w-48 sm:w-64 md:w-72 bg-zinc-900/90 border-zinc-700 shadow-inner px-3 py-1.5'
                    : 'w-9 h-9 border-transparent hover:bg-zinc-800/80 justify-center cursor-pointer'
                }`}
              >
                <button
                  type="button"
                  aria-label="Toggle search"
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    if (!isSearchOpen) {
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }
                  }}
                  className="text-zinc-400 hover:text-white focus:outline-none shrink-0"
                >
                  <Search className="h-4 w-4" />
                </button>

                {isSearchOpen && (
                  <>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Titles, people, genres..."
                      className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none px-2 py-0.5"
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          searchInputRef.current?.focus();
                        }}
                        className="text-zinc-500 hover:text-zinc-300 text-xs px-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 rounded border border-zinc-700/60 leading-none">
                        ⌘K
                      </kbd>
                    )}
                  </>
                )}
              </div>
            </form>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-850/80 transition-colors focus:outline-none"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-zinc-950" />
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-3 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs">
                    <span className="font-semibold text-zinc-200">Recent Updates</span>
                    <span className="text-[11px] text-zinc-500">3 new releases</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex gap-2.5 items-start">
                      <div className="p-1 rounded bg-red-950/60 text-red-400 mt-0.5">
                        <Play className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-200">Arcane Season 2 Premiere</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Now streaming in 4K HDR Atmos</p>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex gap-2.5 items-start">
                      <div className="p-1 rounded bg-amber-950/60 text-amber-400 mt-0.5">
                        <Bookmark className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-200">Watchlist Alert: Dune Part Two</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">High definition stream is now unlocked</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full text-zinc-300 hover:text-white focus:outline-none cursor-pointer"
              >
                <div className={`h-8 w-8 rounded-full bg-gradient-to-tr ${activeProfile.avatarColor} p-[1.5px] shadow-sm relative ${activeProfile.isKidsMode ? 'ring-2 ring-amber-400' : ''}`}>
                  <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-bold text-xs text-white">
                    {activeProfile.name.charAt(0).toUpperCase()}
                  </div>
                  {activeProfile.isKidsMode && (
                    <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 border border-zinc-950 flex items-center justify-center text-[8px] font-black text-zinc-950">
                      K
                    </span>
                  )}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400 hidden sm:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 animate-fadeIn text-xs">
                  {/* Active Profile Info */}
                  <div className="px-3 py-2.5 border-b border-zinc-800 mb-2 flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-tr ${activeProfile.avatarColor} p-[1px] shrink-0`}>
                      <div className="h-full w-full rounded-lg bg-zinc-900 flex items-center justify-center font-bold text-xs text-white">
                        {activeProfile.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="font-semibold text-zinc-100 truncate">{activeProfile.name}</p>
                      <span className={`text-[10px] font-medium ${activeProfile.isKidsMode ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}>
                        {activeProfile.isKidsMode ? 'Kids Mode (Filtered)' : 'Standard Profile'}
                      </span>
                    </div>
                  </div>

                  {/* Switch Profile Sub-list */}
                  <div className="px-2 py-1 mb-1">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-1 mb-1.5">
                      Switch Profile
                    </p>
                    <div className="space-y-1">
                      {profiles.map((p) => {
                        const isCurrent = p.id === activeProfile.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              selectProfile(p.id);
                              setIsProfileOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                              isCurrent ? 'bg-zinc-800/80 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`h-5 w-5 rounded-md bg-gradient-to-tr ${p.avatarColor} p-[1px]`}>
                                <div className="h-full w-full rounded-md bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-white">
                                  {p.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <span className="truncate max-w-[120px]">{p.name}</span>
                            </div>
                            {isCurrent && <Check className="h-3 w-3 text-red-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Kids Mode Instant Quick Toggle */}
                  <div className="border-t border-zinc-800 my-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        updateProfile(activeProfile.id, { isKidsMode: !activeProfile.isKidsMode });
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-850 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className={`h-3.5 w-3.5 ${activeProfile.isKidsMode ? 'text-amber-400' : 'text-zinc-400'}`} />
                        <span>Kids Filter</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${activeProfile.isKidsMode ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        {activeProfile.isKidsMode ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>

                  <Link
                    to="/profiles"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-850 text-zinc-300 hover:text-white transition-colors"
                  >
                    <Users className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Manage Profiles</span>
                  </Link>

                  <Link
                    to="/my-list"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-850 text-zinc-300 hover:text-white transition-colors"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-red-500" />
                    <span>My Watchlist ({savedList.length})</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 pb-4 border-t border-zinc-800/80 bg-zinc-950/95 rounded-b-2xl px-2 space-y-2 animate-fadeIn">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-zinc-850 text-white font-semibold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`
                }
              >
                <span>{link.name}</span>
                {typeof link.badgeCount === 'number' && link.badgeCount > 0 && (
                  <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {link.badgeCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
