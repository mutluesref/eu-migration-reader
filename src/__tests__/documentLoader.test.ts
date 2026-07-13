import { beforeEach, describe, it, expect } from 'vitest';
import {
  clearLoadedDocumentsForTests,
  getDocumentIndex,
  getDocumentShortName,
  getRegulationNumber,
  getDocument,
  getAllDocuments,
  getDocumentIds,
  isDocumentLoaded,
  loadAllDocuments,
  loadDocument,
  registerDocument,
} from '../services/documentLoader';

describe('documentLoader', () => {
  beforeEach(() => {
    clearLoadedDocumentsForTests();
  });

  it('returns document index', () => {
    const index = getDocumentIndex();
    expect(index.length).toBe(9);
    expect(index[0].id).toBe('ammr');
  });

  it('loads document by id on demand', async () => {
    expect(isDocumentLoaded('ammr')).toBe(false);
    expect(getDocument('ammr')).toBeUndefined();

    const doc = await loadDocument('ammr');

    expect(doc).toBeDefined();
    expect(doc!.id).toBe('ammr');
    expect(isDocumentLoaded('ammr')).toBe(true);
    expect(getDocument('ammr')!.id).toBe('ammr');
  });

  it('returns undefined for invalid id', async () => {
    const doc = await loadDocument('invalid');
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

  it('returns only loaded documents synchronously', async () => {
    const docs = getAllDocuments();
    expect(docs.length).toBe(0);

    await loadDocument('ammr');

    expect(getAllDocuments().map((doc) => doc.id)).toEqual(['ammr']);
  });

  it('loads all documents asynchronously', async () => {
    const docs = await loadAllDocuments();
    expect(docs.length).toBe(9);
  });

  it('rejects registering document data under the wrong id', async () => {
    const doc = await loadDocument('ammr');

    expect(() => registerDocument('apr', doc!)).toThrow(
      'Cannot register document "ammr" as "apr"',
    );
  });
});
