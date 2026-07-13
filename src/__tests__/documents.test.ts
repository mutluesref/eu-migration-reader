import { beforeEach, describe, it, expect } from 'vitest';
import {
  clearLoadedDocumentsForTests,
  getAllDocuments,
  getDocument,
  getDocumentIndex,
  getDocumentShortName,
  getRegulationNumber,
  getAllDocumentIds,
  getArticle,
  loadAllDocuments,
  loadDocument,
} from '../data/documents';

describe('documents', () => {
  beforeEach(() => {
    clearLoadedDocumentsForTests();
  });

  it('returns loaded documents synchronously', async () => {
    const docs = getAllDocuments();
    expect(docs.length).toBe(0);

    await loadAllDocuments();
    expect(getAllDocuments().length).toBe(9);
  });

  it('returns document by id after loading', async () => {
    await loadDocument('ammr');
    const doc = getDocument('ammr');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('ammr');
    expect(doc!.articles.length).toBe(85);
  });

  it('returns undefined for invalid id', () => {
    const doc = getDocument('invalid');
    expect(doc).toBeUndefined();
  });

  it('returns document index', () => {
    const index = getDocumentIndex();
    expect(index.length).toBe(9);
    expect(index[0].id).toBe('ammr');
  });

  it('returns short name', () => {
    const name = getDocumentShortName('ammr');
    expect(name).toBe('Asylum and Migration Management Regulation');
  });

  it('returns regulation number', () => {
    const regNum = getRegulationNumber('ammr');
    expect(regNum).toContain('Regulation');
    expect(regNum).toContain('2024');
  });

  it('returns all document ids', () => {
    const ids = getAllDocumentIds();
    expect(ids.length).toBe(9);
    expect(ids).toContain('ammr');
    expect(ids).toContain('apr');
  });

  it('returns article by doc id and article number after loading', async () => {
    await loadDocument('ammr');
    const result = getArticle('ammr', '1');
    expect(result).not.toBeNull();
    expect(result!.article.number).toBe(1);
  });

  it('returns null for invalid article', async () => {
    await loadDocument('ammr');
    const result = getArticle('ammr', '999');
    expect(result).toBeNull();
  });

  it('does not contain standalone dash paragraphs from scraping artifacts', async () => {
    const docs = await loadAllDocuments();
    const offenders = docs.flatMap((doc) =>
      doc.articles
        .filter((article) => /(?:^|\n)\s*[—–-]\s*(?:\n|$)/.test(article.content))
        .map((article) => `${doc.id}:${article.number}`),
    );

    expect(offenders).toEqual([]);
  });
});
