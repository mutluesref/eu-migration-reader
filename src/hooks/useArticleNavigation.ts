import { useMemo, useCallback } from 'react';
import type { DocumentData } from '../types';
import { useStore } from '../store';

export function useArticleNavigation(documents: DocumentData[]) {
  const currentDocId = useStore(s => s.currentDocId);
  const currentArticleNumber = useStore(s => s.currentArticleNumber);
  const goToPrevArticle = useStore(s => s.goToPrevArticle);
  const goToNextArticle = useStore(s => s.goToNextArticle);

  const currentDoc = useMemo(
    () => documents.find(d => d.id === currentDocId),
    [documents, currentDocId]
  );

  const orderedArticles = useMemo(() => {
    if (!currentDoc) return [];
    const articles = currentDoc.articles;
    const hasRecitals = currentDoc.recitals && currentDoc.recitals.length > 0;
    const articleNums = articles
      .map(a => String(a.number))
      .sort((a, b) => {
        const na = parseInt(a, 10);
        const nb = parseInt(b, 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.localeCompare(b);
      });
    return hasRecitals ? ['recitals', ...articleNums] : articleNums;
  }, [currentDoc]);

  const handlePrevArticle = useCallback(() => {
    goToPrevArticle(orderedArticles);
  }, [goToPrevArticle, orderedArticles]);

  const handleNextArticle = useCallback(() => {
    goToNextArticle(orderedArticles);
  }, [goToNextArticle, orderedArticles]);

  return { currentDoc, orderedArticles, handlePrevArticle, handleNextArticle };
}
