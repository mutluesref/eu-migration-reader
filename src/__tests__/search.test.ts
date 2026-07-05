import { describe, it, expect } from 'vitest';
import { searchDocuments } from '../utils/search';
import type { DocumentData } from '../types';

const mockDocs: DocumentData[] = [
  {
    id: 'ammr',
    shortName: 'Asylum and Migration Management Regulation',
    celex: '32024R1351',
    title: 'REGULATION (EU) 2024/1351',
    recitals: [],
    articles: [
      {
        number: 1,
        title: 'Subject matter',
        subject: '',
        content: 'This Regulation lays down a common framework for asylum.',
      },
      {
        number: 2,
        title: 'Definitions',
        subject: 'For the purposes of this Regulation:',
        content: 'Definitions of various terms used in this Regulation.',
      },
    ],
  },
  {
    id: 'apr',
    shortName: 'Asylum Procedure Regulation',
    celex: '32024R1348',
    title: 'REGULATION (EU) 2024/1348',
    recitals: [],
    articles: [
      {
        number: 1,
        title: 'Subject matter',
        subject: '',
        content: 'This Regulation establishes common procedures.',
      },
    ],
  },
];

describe('searchDocuments', () => {
  it('returns empty for empty query', () => {
    expect(searchDocuments(mockDocs, '')).toEqual([]);
    expect(searchDocuments(mockDocs, '   ')).toEqual([]);
  });

  it('finds articles by title', () => {
    const results = searchDocuments(mockDocs, 'definitions');
    expect(results.length).toBe(1);
    expect(results[0].articleNumber).toBe('2');
    expect(results[0].documentId).toBe('ammr');
  });

  it('finds articles by content', () => {
    const results = searchDocuments(mockDocs, 'asylum');
    expect(results.length).toBeGreaterThan(0);
  });

  it('finds articles by exact number', () => {
    const results = searchDocuments(mockDocs, '2');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].articleNumber).toBe('2');
  });

  it('ranks title matches higher than content matches', () => {
    const results = searchDocuments(mockDocs, 'subject matter');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].articleTitle).toBe('Subject matter');
  });

  it('is case insensitive', () => {
    const results = searchDocuments(mockDocs, 'DEFINITIONS');
    expect(results.length).toBe(1);
  });
});
