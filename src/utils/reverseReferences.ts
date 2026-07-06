import type { DocumentData, Reference } from '../types';
import { detectReferences, createReference } from './referenceDetection';

/**
 * A reverse reference: which article references a given target article.
 */
export interface ReverseReference {
  sourceDocId: string;
  sourceDocName: string;
  sourceArticleNumber: string;
  sourceArticleTitle: string;
  displayText: string;
}

/**
 * Builds a reverse index: for each document+article, which other articles reference it.
 * Run once at load time over the full corpus.
 */
export function buildReverseIndex(documents: DocumentData[]): Map<string, ReverseReference[]> {
  const index = new Map<string, ReverseReference[]>();

  for (const doc of documents) {
    for (const article of doc.articles) {
      const refs = detectReferences(article.content);
      for (const raw of refs) {
        const ref: Reference = createReference(raw, doc.id);
        const targetKey = `${ref.documentId}:${ref.articleNumber}`;
        const entry: ReverseReference = {
          sourceDocId: doc.id,
          sourceDocName: doc.shortName,
          sourceArticleNumber: String(article.number),
          sourceArticleTitle: article.title,
          displayText: ref.displayText,
        };
        const existing = index.get(targetKey);
        if (existing) {
          existing.push(entry);
        } else {
          index.set(targetKey, [entry]);
        }
      }
    }
  }

  return index;
}

/**
 * Look up which articles reference a given document+article.
 */
export function getReverseReferences(
  reverseIndex: Map<string, ReverseReference[]>,
  docId: string,
  articleNumber: string,
): ReverseReference[] {
  return reverseIndex.get(`${docId}:${articleNumber}`) ?? [];
}
