import { describe, it, expect } from 'vitest';
import { searchDocuments } from '../utils/search';
import { getAllDocuments } from '../data/documents';

describe('search', () => {
  const documents = getAllDocuments();

  it('returns empty for empty query', () => {
    const results = searchDocuments(documents, '');
    expect(results).toEqual([]);
  });

  it('finds articles by title', () => {
    const results = searchDocuments(documents, 'subject matter');
    expect(results.length).toBeGreaterThan(0);
  });

  it('finds articles by content', () => {
    const results = searchDocuments(documents, 'asylum');
    expect(results.length).toBeGreaterThan(0);
  });

  it('finds articles by exact number', () => {
    const results = searchDocuments(documents, '2');
    expect(results.length).toBeGreaterThan(0);
  });

  it('ranks title matches higher', () => {
    const results = searchDocuments(documents, 'subject matter');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });

  it('is case insensitive', () => {
    const results = searchDocuments(documents, 'DEFINITIONS');
    expect(results.length).toBeGreaterThan(0);
  });
});
