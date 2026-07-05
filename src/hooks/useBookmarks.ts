import { useCallback } from 'react';
import { useStore } from '../store';

export default function useBookmarks() {
  const bookmarks = useStore((s) => s.bookmarks);
  const addBookmark = useStore((s) => s.addBookmark);
  const removeBookmark = useStore((s) => s.removeBookmark);

  const isBookmarked = useCallback(
    (docId: string, articleNumber: string) =>
      bookmarks.some((b) => b.docId === docId && b.articleNumber === articleNumber),
    [bookmarks]
  );

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
