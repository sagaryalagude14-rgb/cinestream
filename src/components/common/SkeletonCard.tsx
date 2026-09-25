import React from 'react';

interface SkeletonCardProps {
  aspectRatio?: 'landscape' | 'portrait';
  count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  aspectRatio = 'landscape',
  count = 1,
}) => {
  const aspectClass = aspectRatio === 'landscape' ? 'aspect-video' : 'aspect-[2/3]';

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="group relative flex flex-col flex-shrink-0 animate-pulse overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800/80"
          style={{ minWidth: aspectRatio === 'landscape' ? '280px' : '180px' }}
        >
          <div className={`w-full ${aspectClass} bg-gradient-to-br from-zinc-800/60 to-zinc-900 relative`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
          <div className="p-3 space-y-2">
            <div className="h-4 bg-zinc-800 rounded w-3/4" />
            <div className="flex items-center space-x-2 pt-1">
              <div className="h-3 bg-zinc-800 rounded w-12" />
              <div className="h-3 bg-zinc-800 rounded w-8" />
              <div className="h-3 bg-zinc-800 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
