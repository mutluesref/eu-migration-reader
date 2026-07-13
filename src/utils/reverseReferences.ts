import type { DocumentData, Reference } from '../types';
import { detectReferences, createReference } from '../services/references';

/**
 * A reverse reference: which article references a given target article.
 */
export interface ReverseReference {
  sourceDocId: string;
  sourceDocName: string;
  sourceArticleNumber: string;
  sourceArticleTitle: string;
  sourceArticleSubject: string;
  displayText: string;
  snippet: string;
}

const SNIPPET_PADDING = 80;

function extractSnippet(content: string, startIndex: number, endIndex: number): string {
  const ctxStart = Math.max(0, startIndex - SNIPPET_PADDING);
  const ctxEnd = Math.min(content.length, endIndex + SNIPPET_PADDING);
  let before = '';
  let after = '';
  if (ctxStart > 0) before = '…';
  before += content.slice(ctxStart, startIndex);
  const matched = content.slice(startIndex, endIndex);
  after += content.slice(endIndex, ctxEnd);
  if (ctxEnd < content.length) after += '…';
  return before + matched + after;
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
          sourceArticleSubject: article.subject,
          displayText: ref.displayText,
          snippet: extractSnippet(article.content, raw.startIndex, raw.endIndex),
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
