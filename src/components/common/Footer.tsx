import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Github, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 mt-20 pt-14 pb-12 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-850">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Film className="h-5 w-5 text-red-600" />
              <span className="font-display font-bold text-base text-zinc-100 tracking-tight">CineStream</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed pr-2">
              Next-generation streaming platform architecture powered by modern web technologies, smooth client-side routing, and real-time catalogue exploration.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-zinc-200 transition-colors">Home Discovery</Link>
              </li>
              <li>
                <Link to="/browse/movies" className="hover:text-zinc-200 transition-colors">Featured Movies</Link>
              </li>
              <li>
                <Link to="/browse/tv" className="hover:text-zinc-200 transition-colors">TV Series & Shows</Link>
              </li>
              <li>
                <Link to="/my-list" className="hover:text-zinc-200 transition-colors">Saved Watchlist</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/browse/movies" className="hover:text-zinc-200 transition-colors">Sci-Fi & Cosmic</Link>
              </li>
              <li>
                <Link to="/browse/movies" className="hover:text-zinc-200 transition-colors">Action & Thrillers</Link>
              </li>
              <li>
                <Link to="/browse/tv" className="hover:text-zinc-200 transition-colors">Critically Acclaimed</Link>
              </li>
              <li>
                <Link to="/browse/tv" className="hover:text-zinc-200 transition-colors">Award Nominees</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">Platform Specs</h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Local Watchlist Persistent Cache</span>
              </div>
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>TMDB API / Fallback Hybrid</span>
              </div>
              <p className="pt-2 text-[11px] text-zinc-400">
                Film data and images provided by TMDB. All copyrights belong to their respective creators.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} CineStream Inc. All streaming rights reserved.</p>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Engineered with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>for cinema lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
