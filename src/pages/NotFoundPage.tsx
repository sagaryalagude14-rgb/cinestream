import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center px-4 py-20 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-red-500 mx-auto shadow-2xl">
          <Film className="h-10 w-10" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-500">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white mt-1 mb-3">
            Lost In The Stream
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            The title or channel you are searching for does not exist in our global catalogue or has moved to an alternate timeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-lg shadow-red-950/50"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
