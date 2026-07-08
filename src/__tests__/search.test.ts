import { describe, it, expect } from 'vitest';
import { searchDocuments } from '../services/searchService';
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

  it('filters by document id', () => {
    const results = searchDocuments(mockDocs, 'procedures', {
      documentId: 'apr',
      contentType: 'articles',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.documentId === 'apr')).toBe(true);
  });

  it('filters by content type', () => {
    const docWithRecitals: DocumentData[] = [
      {
        id: 'test',
        shortName: 'Test',
        celex: '1',
        title: 'Test',
        recitals: [{ number: 1, text: 'This is a test recital about asylum.' }],
        articles: [],
      },
    ];
    const results = searchDocuments(docWithRecitals, 'asylum', { contentType: 'recitals' });
    expect(results.length).toBe(1);
    expect(results[0].source).toBe('recital');
  });

  it('searches both articles and recitals when contentType is both', () => {
    const docBoth: DocumentData[] = [
      {
        id: 'test',
        shortName: 'Test',
        celex: '1',
        title: 'Test',
        recitals: [{ number: 1, text: 'Recital about asylum.' }],
        articles: [
          { number: 1, title: 'Asylum article', subject: '', content: 'Content about asylum.' },
        ],
      },
    ];
    const results = searchDocuments(docBoth, 'asylum', { contentType: 'both' });
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.some((r) => r.source === 'article')).toBe(true);
    expect(results.some((r) => r.source === 'recital')).toBe(true);
  });
});
