import { describe, it, expect } from 'vitest';
import {
  detectReferences,
  isExternalDoc,
  getExternalCelex,
  getExternalName,
  getEurlexUrl,
  createReference,
} from '../services/references';

describe('referenceDetection', () => {
  describe('isExternalDoc', () => {
    it('returns true for ext: prefixed ids', () => {
      expect(isExternalDoc('ext:32021R2303')).toBe(true);
    });

    it('returns false for internal doc ids', () => {
      expect(isExternalDoc('ammr')).toBe(false);
      expect(isExternalDoc('apr')).toBe(false);
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

    it('builds correct URL for decisions', () => {
      const url = getEurlexUrl('32022D0382');
      expect(url).toBe('https://eur-lex.europa.eu/eli/dec/2022/382/oj');
    });
  });

  describe('external legal metadata', () => {
    it('uses corrected instrument names for known CELEX ids', () => {
      expect(getExternalName('32003R0343')).toBe('Dublin II Regulation');
      expect(getExternalName('32011L0095')).toBe('Qualification Directive');
      expect(getExternalName('32011R0182')).toBe('Comitology Regulation');
      expect(getExternalName('32022R0922')).toBe(
        'Schengen Evaluation and Monitoring Mechanism Regulation',
      );
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
      expect(refs.some((r) => r.documentId === 'ext:32016R0679')).toBe(true);
    });

    it('returns empty for text with no references', () => {
      const refs = detectReferences('This is a simple sentence with no legal references.');
      expect(refs.length).toBe(0);
    });

    it('does not overlap references', () => {
      const refs = detectReferences('Article 3(1) of Regulation (EU) 2024/1351');
      for (let i = 1; i < refs.length; i++) {
        expect(refs[i].startIndex).toBeGreaterThanOrEqual(refs[i - 1].endIndex);
      }
    });

    it('resolves Article references to the prior instrument when text says that Regulation', () => {
      const refs = detectReferences(
        'in accordance with Regulation (EU) 2024/1347, and he or she shall provide the elements referred to in Article 4(2) of that Regulation as completely as possible',
      );

      const articleRef = refs.find((ref) => ref.articleNumber === '4' && ref.paragraph === '2');
      expect(articleRef?.documentId).toBe('qr');
    });

    it('resolves that Directive to a prior Directive YYYY/NNN/EC reference', () => {
      const refs = detectReferences(
        'decided not to apply Directive 2008/115/EC in such cases pursuant to Article 2(2), point (a), of that Directive',
      );

      const articleRef = refs.find((ref) => ref.articleNumber === '2' && ref.paragraph === '2');
      expect(articleRef?.documentId).toBe('ext:32008L0115');
    });

    it('resolves that Directive to a prior Directive (EU) reference', () => {
      const refs = detectReferences(
        'the common standards for the reception of applicants for international protection of Directive (EU) 2024/1346 shall be determined by Article 3 of that Directive',
      );

      const articleRef = refs.find((ref) => ref.articleNumber === '3');
      expect(articleRef?.documentId).toBe('rcd');
    });

    it('resolves that Directive when another article appears earlier in the sentence', () => {
      const refs = detectReferences(
        'Where Directive 2001/55/EC is activated in relation to the same situation as referred to in Article 1(4), point (a), and Member States agree at the moment of activation not to apply Article 11 of that Directive',
      );

      const articleRef = refs.find((ref) => ref.articleNumber === '11');
      expect(articleRef?.documentId).toBe('ext:32001L0055');
    });

    it('resolves that Regulation to URFA for Article 7 references', () => {
      const refs = detectReferences(
        'who have been refused admission on one of the grounds referred to in Article 6(1), point (f), of Regulation (EU) 2024/1350, or for whom the admission procedure has been discontinued due to the fact that that person did not give or withdrew his or her consent in accordance with Article 7 of that Regulation',
      );

      const articleRef = refs.find((ref) => ref.articleNumber === '7');
      expect(articleRef?.documentId).toBe('urfa');
    });

    it('resolves article ranges followed by Directive references to the external directive', () => {
      const refs = detectReferences('shall comply with Articles 16 to 18 of Directive 2008/115/EC');

      expect(refs.find((ref) => ref.articleNumber === '16')?.documentId).toBe('ext:32008L0115');
      expect(refs.find((ref) => ref.articleNumber === '18')?.documentId).toBe('ext:32008L0115');
    });

    it('resolves article references followed by external Regulation references', () => {
      const refs = detectReferences(
        'Searches in SIS shall be carried out in accordance with Article 33 of Regulation (EU) 2018/1861 and Article 43 of Regulation (EU) 2018/1862.',
      );

      expect(refs.find((ref) => ref.articleNumber === '33')?.documentId).toBe('ext:32018R1861');
      expect(refs.find((ref) => ref.articleNumber === '43')?.documentId).toBe('ext:32018R1862');
    });

    it('resolves alpha-suffixed external article references in interoperability regulations', () => {
      const refs = detectReferences(
        'the CIR pursuant to Article 20a of Regulation (EU) 2019/817 and pursuant to Article 20a of Regulation (EU) 2019/818',
      );
      const articleRefs = refs.filter((ref) => ref.articleNumber === '20a');

      expect(articleRefs[0]?.documentId).toBe('ext:32019R0817');
      expect(articleRefs[1]?.documentId).toBe('ext:32019R0818');
    });

    it('resolves that Regulation when it appears before the Article reference', () => {
      const refs = detectReferences(
        'Regulation (EU) 2024/1351 shall apply. The Member State shall apply the procedures set out in Part III of that Regulation, with the exception of Article 25(5), Article 33(1) and Article 38(4).',
      );

      expect(refs.find((ref) => ref.articleNumber === '25')?.documentId).toBe('ammr');
      expect(refs.find((ref) => ref.articleNumber === '33')?.documentId).toBe('ammr');
      expect(refs.find((ref) => ref.articleNumber === '38')?.documentId).toBe('ammr');
    });

    it('resolves amendment block articles to the regulation being amended', () => {
      const refs = detectReferences(
        'Regulation (EU) 2021/1147 is amended as follows: (2) in Article 19, paragraphs (1), (2) and (3) are replaced by the following text.',
      );

      expect(refs.find((ref) => ref.articleNumber === '19')?.documentId).toBe('ext:32021R1147');
    });

    it('resolves named external instruments such as the Financial Regulation', () => {
      const refs = detectReferences(
        'The amounts referred to in this Article shall take the form of financing not linked to costs in accordance with Article 125 of the Financial Regulation.',
      );

      expect(refs.find((ref) => ref.articleNumber === '125')?.documentId).toBe('ext:32018R1046');
    });

    it('resolves later article references to a locally mentioned regulation in the same sentence', () => {
      const refs = detectReferences(
        'By way of derogation from Article 45(1) of Regulation (EU) 2024/1348, Member States may reduce the threshold provided for in Article 42(1), point (j), to 5 %.',
      );

      expect(refs.find((ref) => ref.articleNumber === '42')?.documentId).toBe('apr');
    });

    it('resolves this Regulation inside amendment clauses to the amended regulation', () => {
      const refs = detectReferences(
        'Amendments to Regulation (EC) No 767/2008 Article 6 of Regulation (EC) No 767/2008 is amended as follows: access shall be reserved for the purposes laid down in Articles 22g to 22m, and Article 45e of this Regulation.',
      );

      expect(refs.find((ref) => ref.articleNumber === '22g')?.documentId).toBe('ext:32008R0767');
      expect(refs.find((ref) => ref.articleNumber === '22m')?.documentId).toBe('ext:32008R0767');
      expect(refs.find((ref) => ref.articleNumber === '45e')?.documentId).toBe('ext:32008R0767');
    });

    it('resolves inserted amendment article headings to the amended regulation', () => {
      const refs = detectReferences(
        'Amendments to Regulation (EU) 2018/1240 Regulation (EU) 2018/1240 is amended as follows: providing opinions in accordance with Article 35a. The following Article is inserted: Article 35a Tasks of the ETIAS National Unit. In Article 69(1), the following point is inserted.',
      );

      expect(refs.find((ref) => ref.articleNumber === '35a')?.documentId).toBe('ext:32018R1240');
      expect(refs.find((ref) => ref.articleNumber === '69')?.documentId).toBe('ext:32018R1240');
    });

    it('resolves amendment headings without an is amended clause', () => {
      const refs = detectReferences(
        'Amendments to Regulation (EU) 2018/1240. In Article 25a(1), the following point is inserted. In Article 88, paragraph 6 is replaced by the following.',
      );

      expect(refs.find((ref) => ref.articleNumber === '25a')?.documentId).toBe('ext:32018R1240');
      expect(refs.find((ref) => ref.articleNumber === '88')?.documentId).toBe('ext:32018R1240');
    });

    it('resolves ECRIS-TCN that Regulation references', () => {
      const refs = detectReferences(
        'Where the personal data correspond to a person whose data is recorded in ECRIS-TCN and flagged in accordance with Article 5(1), point (c), of Regulation (EU) 2019/816, the data may only be used for consultation of the national criminal records which shall be in accordance with Article 7c of that Regulation.',
      );

      expect(refs.find((ref) => ref.articleNumber === '7c')?.documentId).toBe('ext:32019R0816');
    });

    it('resolves APR Article 59 safe third country serious harm reference to QR Article 15', () => {
      const refs = detectReferences(
        'non-nationals face no real risk of serious harm as defined in Article 15 of Regulation (EU) 2024/1347;\n\n(c) non-nationals are protected against refoulement in accordance with the Geneva Convention.',
      );

      expect(refs.find((ref) => ref.articleNumber === '15')?.documentId).toBe('qr');
    });

    it('resolves Schengen evaluation article references in AMMR Article 10', () => {
      const refs = detectReferences(
        'the relevant recommendations provided for in Article 20 of Regulation (EU) 2022/922, Article 15 of Regulation (EU) 2021/2303 and Article 32(7) of Regulation (EU) 2019/1896;',
      );

      expect(refs.find((ref) => ref.articleNumber === '20')?.documentId).toBe('ext:32022R0922');
      expect(refs.find((ref) => ref.articleNumber === '15')?.documentId).toBe('ext:32021R2303');
      expect(refs.find((ref) => ref.articleNumber === '32')?.documentId).toBe('ext:32019R1896');
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
