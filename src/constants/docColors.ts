/**
 * Centralized document color mappings.
 * Single source of truth for color-coding instruments across the app.
 * Reuse these instead of duplicating color maps in individual components.
 */

/** Border-left accent colors for article content areas */
export const DOC_BORDER_COLORS: Record<string, string> = {
  ammr: 'border-l-violet-500',
  apr: 'border-l-blue-500',
  rbpr: 'border-l-amber-500',
  cfmr: 'border-l-red-500',
  eurodac: 'border-l-emerald-500',
  sr: 'border-l-cyan-500',
  qr: 'border-l-indigo-500',
  rcd: 'border-l-pink-500',
  urfa: 'border-l-teal-500',
};

/** Background/text badge colors for document labels */
export const DOC_BADGE_COLORS: Record<string, string> = {
  ammr: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  apr: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  rbpr: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  cfmr: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  eurodac: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  sr: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  qr: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  rcd: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  urfa: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

/** Text-only accent colors for subtle references */
export const DOC_TEXT_COLORS: Record<string, string> = {
  ammr: 'text-violet-600 dark:text-violet-400',
  apr: 'text-blue-600 dark:text-blue-400',
  rbpr: 'text-amber-600 dark:text-amber-400',
  cfmr: 'text-red-600 dark:text-red-400',
  eurodac: 'text-emerald-600 dark:text-emerald-400',
  sr: 'text-cyan-600 dark:text-cyan-400',
  qr: 'text-indigo-600 dark:text-indigo-400',
  rcd: 'text-pink-600 dark:text-pink-400',
  urfa: 'text-teal-600 dark:text-teal-400',
};
