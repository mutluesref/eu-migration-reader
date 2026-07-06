import type { DocumentData } from '../types';

export type ContentType = 'articles' | 'recitals' | 'both';

export interface SearchFilters {
  documentId?: string;       // Filter to specific document
  contentType: ContentType;  // Articles, recitals, or both
}

export interface SearchResult {
  documentId: string;
  documentName: string;
  articleNumber: string;
  articleTitle: string;
  snippet: string;
  score: number;
  source: 'article' | 'recital';
}

const DEFAULT_FILTERS: SearchFilters = {
  contentType: 'articles',
};

export function searchDocuments(
  documents: DocumentData[],
  query: string,
  filters: SearchFilters = DEFAULT_FILTERS,
): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];
  const docs = filters.documentId
    ? documents.filter(d => d.id === filters.documentId)
    : documents;

  for (const doc of docs) {
    // Search articles
    if (filters.contentType === 'articles' || filters.contentType === 'both') {
      for (const article of doc.articles) {
        const score = scoreArticle(article, q);
        if (score > 0) {
          results.push({
            documentId: doc.id,
            documentName: doc.shortName,
            articleNumber: String(article.number),
            articleTitle: article.title,
            snippet: extractSnippet(article.title, article.subject, article.content, q),
            score,
            source: 'article',
          });
        }
      }
    }

    // Search recitals
    if (filters.contentType === 'recitals' || filters.contentType === 'both') {
      for (const recital of doc.recitals) {
        const text = recital.text;
        const textLower = text.toLowerCase();
        let score = 0;

        if (textLower.includes(q)) {
          score += 10;
        }

        if (score > 0) {
          const ssIdx = textLower.indexOf(q);
          let snippet: string;
          if (ssIdx !== -1) {
            const start = Math.max(0, ssIdx - 80);
            const end = Math.min(text.length, ssIdx + q.length + 80);
            let s = '';
            if (start > 0) s += '...';
            s += text.substring(start, end);
            if (end < text.length) s += '...';
            snippet = s;
          } else {
            snippet = text.substring(0, 150) + '...';
          }

          results.push({
            documentId: doc.id,
            documentName: doc.shortName,
            articleNumber: `Recital ${recital.number}`,
            articleTitle: `Recital ${recital.number}`,
            snippet,
            score,
            source: 'recital',
          });
        }
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

function scoreArticle(article: { title: string; subject: string; content: string; number: number | string }, queryLower: string): number {
  const titleLower = article.title.toLowerCase();
  const subjectLower = article.subject.toLowerCase();
  const contentLower = article.content.toLowerCase();
  const numberStr = String(article.number);

  let score = 0;

  if (numberStr === queryLower || `article ${numberStr}` === queryLower) {
    score += 100;
  }
  if (titleLower.includes(queryLower)) {
    score += 50;
  }
  if (subjectLower.includes(queryLower)) {
    score += 30;
  }
  if (contentLower.includes(queryLower)) {
    score += 10;
  }

  return score;
}

function extractSnippet(title: string, subject: string, content: string, queryLower: string): string {
  const searchSpace = `${title}\n${subject}\n${content}`;
  const searchSpaceLower = searchSpace.toLowerCase();
  const ssIdx = searchSpaceLower.indexOf(queryLower);

  if (ssIdx !== -1) {
    const start = Math.max(0, ssIdx - 80);
    const end = Math.min(searchSpace.length, ssIdx + queryLower.length + 80);
    let s = '';
    if (start > 0) s += '...';
    s += searchSpace.substring(start, end);
    if (end < searchSpace.length) s += '...';
    return s;
  }
  return content.substring(0, 150) + '...';
}
