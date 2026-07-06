import type { DocumentData } from '../types';

export interface SearchResult {
  documentId: string;
  documentName: string;
  articleNumber: string;
  articleTitle: string;
  snippet: string;
  score: number;
}

class SearchService {
  searchDocuments(
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

        if (numberStr === q || `article ${numberStr}` === q) {
          score += 100;
        }

        if (titleLower.includes(q)) {
          score += 50;
        }

        if (subjectLower.includes(q)) {
          score += 30;
        }

        const contentIdx = contentLower.indexOf(q);
        if (contentIdx !== -1) {
          score += 10;
        }

        if (score > 0) {
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

    results.sort((a, b) => b.score - a.score);
    return results;
  }
}

export const searchService = new SearchService();
