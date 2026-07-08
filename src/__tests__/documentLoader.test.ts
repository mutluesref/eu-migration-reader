import { describe, it, expect } from 'vitest';
import {
  getDocumentIndex,
  getDocumentShortName,
  getRegulationNumber,
  getDocument,
  getAllDocuments,
  getDocumentIds,
} from '../services/documentLoader';

describe('documentLoader', () => {
  it('returns document index', () => {
    const index = getDocumentIndex();
    expect(index.length).toBe(9);
    expect(index[0].id).toBe('ammr');
  });

  it('returns document by id', () => {
    const doc = getDocument('ammr');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('ammr');
  });

  it('returns undefined for invalid id', () => {
    const doc = getDocument('invalid');
    expect(doc).toBeUndefined();
  });

  it('returns short name', () => {
    const name = getDocumentShortName('ammr');
    expect(name).toBe('Asylum and Migration Management Regulation');
  });

  it('returns unknown for invalid id', () => {
    const name = getDocumentShortName('invalid');
    expect(name).toBe('invalid');
  });

  it('returns regulation number', () => {
    const regNum = getRegulationNumber('ammr');
    expect(regNum).toContain('Regulation');
    expect(regNum).toContain('2024');
  });

  it('returns document ids', () => {
    const ids = getDocumentIds();
    expect(ids.length).toBe(9);
    expect(ids).toContain('ammr');
  });

  it('returns all documents', () => {
    const docs = getAllDocuments();
    expect(docs.length).toBe(9);
  });
});
