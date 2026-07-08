import { memo } from 'react';

interface Props {
  type: 'article' | 'sidebar' | 'recitals';
}

function SkeletonPulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className ?? ''}`} style={style} />;
}

function ArticleSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="card">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 rounded-t-xl">
          <div className="px-4 sm:px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <SkeletonPulse className="h-3 w-16" />
              <SkeletonPulse className="h-3 w-24" />
            </div>
            <SkeletonPulse className="h-3 w-32 mb-2" />
            <SkeletonPulse className="h-7 w-3/4 mb-2" />
            <SkeletonPulse className="h-4 w-1/2" />
          </div>
        </div>
        <div className="px-4 sm:px-6 pb-6 pt-4 space-y-3">
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-5/6" />
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-2/3" />
          <div className="pt-4">
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-full mt-2" />
            <SkeletonPulse className="h-4 w-4/5 mt-2" />
          </div>
          <div className="pt-4">
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-3/4 mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="p-3 space-y-1">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-2">
          <SkeletonPulse className="h-3 w-3 rounded-full flex-shrink-0" />
          <SkeletonPulse className="h-3 rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
        </div>
      ))}
    </div>
  );
}

function RecitalsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="card p-4 sm:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <SkeletonPulse className="h-3 w-16" />
            <SkeletonPulse className="h-3 w-24" />
          </div>
          <SkeletonPulse className="h-6 w-24 mb-2" />
          <SkeletonPulse className="h-3 w-20" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="pl-6 border-l-2 border-slate-100 relative">
              <SkeletonPulse className="absolute -ml-6 top-0 h-3 w-6" />
              <SkeletonPulse className="h-4 w-full" />
              <SkeletonPulse className="h-4 w-4/5 mt-1.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonLoader({ type }: Props) {
  switch (type) {
    case 'article':
      return <ArticleSkeleton />;
    case 'sidebar':
      return <SidebarSkeleton />;
    case 'recitals':
      return <RecitalsSkeleton />;
    default:
      return null;
  }
}

export default memo(SkeletonLoader);
