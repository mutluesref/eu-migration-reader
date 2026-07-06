import { describe, it, expect } from 'vitest';
import { searchService } from '../services/searchService';
import { documentService } from '../services/documentService';

describe('searchService', () => {
  const documents = documentService.getDocuments();

  it('returns empty for empty query', () => {
    const results = searchService.searchDocuments(documents, '');
    expect(results).toEqual([]);
  });

  it('finds articles by title', () => {
    const results = searchService.searchDocuments(documents, 'subject matter');
    expect(results.length).toBeGreaterThan(0);
  });

  it('finds articles by content', () => {
    const results = searchService.searchDocuments(documents, 'asylum');
    expect(results.length).toBeGreaterThan(0);
  });

  it('finds articles by exact number', () => {
    const results = searchService.searchDocuments(documents, '2');
    expect(results.length).toBeGreaterThan(0);
  });

  it('ranks title matches higher', () => {
    const results = searchService.searchDocuments(documents, 'subject matter');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });

  it('is case insensitive', () => {
    const results = searchService.searchDocuments(documents, 'DEFINITIONS');
    expect(results.length).toBeGreaterThan(0);
  });
});
