import { describe, it, expect } from 'vitest';
import {
  detectReferences,
  isExternalDoc,
  getExternalCelex,
  getEurlexUrl,
  createReference,
} from '../utils/referenceDetection';

describe('referenceDetection', () => {
  describe('isExternalDoc', () => {
    it('returns true for ext: prefixed ids', () => {
      expect(isExternalDoc('ext:32021R2303')).toBe(true);
    });

    it('returns false for internal doc ids', () => {
      expect(isExternalDoc('ammr')).toBe(false);
    });
  });

  describe('getExternalCelex', () => {
    it('strips ext: prefix', () => {
      expect(getExternalCelex('ext:32021R2303')).toBe('32021R2303');
    });
  });

  describe('getEurlexUrl', () => {
    it('builds correct URL for regulations', () => {
      const url = getEurlexUrl('32024R1351');
      expect(url).toBe('https://eur-lex.europa.eu/eli/reg/2024/1351/oj');
    });

    it('builds correct URL for directives', () => {
      const url = getEurlexUrl('32024L1346');
      expect(url).toBe('https://eur-lex.europa.eu/eli/dir/2024/1346/oj');
    });
  });

  describe('detectReferences', () => {
    it('detects Article references', () => {
      const refs = detectReferences('Article 3 of this Regulation');
      expect(refs.length).toBeGreaterThanOrEqual(1);
      expect(refs[0].articleNumber).toBe('3');
    });

    it('detects CELEX regulation references', () => {
      const refs = detectReferences('Regulation (EU) 2024/1351');
      expect(refs.length).toBeGreaterThanOrEqual(1);
      expect(refs[0].documentId).toBe('ammr');
    });

    it('detects keyword-based references', () => {
      const refs = detectReferences('Asylum Procedure Regulation');
      expect(refs.length).toBeGreaterThanOrEqual(1);
      expect(refs[0].documentId).toBe('apr');
    });

    it('detects external document references', () => {
      const refs = detectReferences('GDPR');
      expect(refs.length).toBeGreaterThanOrEqual(1);
      expect(refs.some(r => r.documentId === 'ext:32016R0679')).toBe(true);
    });

    it('returns empty for text with no references', () => {
      const refs = detectReferences('Simple sentence with no references.');
      expect(refs.length).toBe(0);
    });
  });

  describe('createReference', () => {
    it('creates reference with documentId from raw', () => {
      const raw = {
        articleNumber: '5',
        documentId: 'ammr',
        text: 'Article 5',
        startIndex: 0,
        endIndex: 9,
      };
      const ref = createReference(raw, 'apr');
      expect(ref.documentId).toBe('ammr');
      expect(ref.articleNumber).toBe('5');
    });

    it('falls back to default docId when raw has null', () => {
      const raw = {
        articleNumber: '5',
        documentId: null,
        text: 'Article 5',
        startIndex: 0,
        endIndex: 9,
      };
      const ref = createReference(raw, 'apr');
      expect(ref.documentId).toBe('apr');
    });
  });
});
