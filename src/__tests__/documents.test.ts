import { describe, it, expect } from 'vitest';
import {
  getAllDocuments,
  getDocument,
  getDocumentIndex,
  getDocumentShortName,
  getRegulationNumber,
  getAllDocumentIds,
  getArticle,
} from '../data/documents';

describe('documents', () => {
  it('returns all documents', () => {
    const docs = getAllDocuments();
    expect(docs.length).toBe(9);
  });

  it('returns document by id', () => {
    const doc = getDocument('ammr');
    expect(doc).toBeDefined();
    expect(doc.id).toBe('ammr');
    expect(doc.articles.length).toBe(85);
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

  it('returns article by doc id and article number', () => {
    const result = getArticle('ammr', '1');
    expect(result).not.toBeNull();
    expect(result!.article.number).toBe(1);
  });

  it('returns null for invalid article', () => {
    const result = getArticle('ammr', '999');
    expect(result).toBeNull();
  });
});
