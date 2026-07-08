import { memo } from 'react';

interface Props {
  scrollProgress: number;
}

function ProgressBar({ scrollProgress }: Props) {
  if (scrollProgress <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-surface-200/50 dark:bg-surface-700/50">
      <div
        className="h-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}

export default memo(ProgressBar);
