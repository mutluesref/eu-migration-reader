import { useState, useCallback, useEffect, useRef, type RefObject } from 'react';
import { useStore } from '../store';

export function useScrollProgress(scrollRef: RefObject<HTMLDivElement | null>) {
  const currentDocId = useStore(s => s.currentDocId);
  const currentArticleNumber = useStore(s => s.currentArticleNumber);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const ignoreScrollRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (ignoreScrollRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const progress = maxScroll > 0 ? (el.scrollTop / maxScroll) * 100 : 0;
    setScrollProgress(progress);
    setShowScrollTop(el.scrollTop > 300);
  }, [scrollRef]);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [scrollRef]);

  useEffect(() => {
    if (scrollRef.current) {
      ignoreScrollRef.current = true;
      if (scrollRef.current.scrollTop !== 0) {
        scrollRef.current.scrollTop = 0;
      }
      setScrollProgress(0);
      setShowScrollTop(false);
      ignoreScrollRef.current = false;
    }
  }, [currentDocId, currentArticleNumber, scrollRef]);

  return { scrollProgress, showScrollTop, scrollToTop, handleScroll };
}
