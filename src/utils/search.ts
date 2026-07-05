import type { DocumentData } from '../types';

export interface SearchResult {
  documentId: string;
  documentName: string;
  articleNumber: string;
  articleTitle: string;
  snippet: string;
  score: number;
}

export function searchDocuments(
  documents: DocumentData[],
  query: string
): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const doc of documents) {
    for (const article of doc.articles) {
      const titleLower = article.title.toLowerCase();
      const subjectLower = article.subject.toLowerCase();
      const contentLower = article.content.toLowerCase();
      const numberStr = String(article.number);

      let score = 0;
      
      // Exact article number match
      if (numberStr === q || `article ${numberStr}` === q) {
        score += 100;
      }
      
      // Title match
      if (titleLower.includes(q)) {
        score += 50;
      }
      
      // Subject match
      if (subjectLower.includes(q)) {
        score += 30;
      }
      
      // Content match
      const contentIdx = contentLower.indexOf(q);
      if (contentIdx !== -1) {
        score += 10;
      }

      if (score > 0) {
        // Extract snippet — include title/subject for context when query not in content
        const searchSpace = `${article.title}\n${article.subject}\n${article.content}`;
        const searchSpaceLower = searchSpace.toLowerCase();
        const ssIdx = searchSpaceLower.indexOf(q);

        let snippet: string;
        if (ssIdx !== -1) {
          const start = Math.max(0, ssIdx - 80);
          const end = Math.min(searchSpace.length, ssIdx + q.length + 80);
          let s = '';
          if (start > 0) s += '...';
          s += searchSpace.substring(start, end);
          if (end < searchSpace.length) s += '...';
          snippet = s;
        } else {
          snippet = article.content.substring(0, 150) + '...';
        }

        results.push({
          documentId: doc.id,
          documentName: doc.shortName,
          articleNumber: String(article.number),
          articleTitle: article.title,
          snippet,
          score,
        });
      }
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results;
}
