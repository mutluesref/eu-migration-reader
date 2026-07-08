import type { DocumentData } from '../types';
import { getDocument } from '../services/documentLoader';

export function getArticle(
  docId: string,
  articleNumber: string,
): { document: DocumentData; article: DocumentData['articles'][0] } | null {
  const doc = getDocument(docId);
  if (!doc) return null;
  const article = doc.articles.find((a) => String(a.number) === String(articleNumber));
  if (!article) return null;
  return { document: doc, article };
}
