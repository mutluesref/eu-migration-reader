import type { Reference } from '../types';

const EXCLUDED_TERMS = [
  'TFEU', 'TEU', 'Charter', 'Geneva Convention',
  'Protocol No', 'Protocol on', 'Agreement between',
];

const EXCLUDED_CELEX = [
  '32013R0604', '32013R0603',
  '32011R0182',
  '32022R0922',
  '32011L0095',
  '32013L0032', '32013L0033',
];

const CELEX_TO_DOC: Record<string, string> = {
  '32024R1351': 'ammr',
  '32024R1348': 'apr',
  '32024R1349': 'rbpr',
  '32024R1359': 'cfmr',
  '32024R1358': 'eurodac',
  '32024R1356': 'sr',
  '32024R1347': 'qr',
  '32024L1346': 'rcd',
  '32024R1350': 'urfa',
};

const EXTERNAL_CELEX: Record<string, string> = {
  '32021R2303': 'EU Asylum Agency Regulation',
  '32021R1147': 'AMIF Regulation',
  '32021R1060': 'Common Provisions Regulation',
  '32021R1148': 'Border Management Instrument',
  '32016R0679': 'GDPR',
  '32016R0399': 'Schengen Borders Code',
  '32018R1725': 'EU Institutions Data Protection',
  '32018R1240': 'ETIAS Regulation',
  '32019R0817': 'Interoperability Regulation',
  '32019R1896': 'Frontex Regulation',
  '32017R2226': 'Entry/Exit System Regulation',
  '32018R1806': 'Visa Requirements Regulation',
  '32008L0115': 'Return Directive',
  '32001L0055': 'Temporary Protection Directive',
  '32018R1046': 'Financial Regulation',
  '32008R0767': 'VIS Regulation',
  '32003R1560': 'Dublin Implementing Regulation',
  '32009R0810': 'Visa Code Regulation',
  '32007R0862': 'Migration Statistics Regulation',
  '32001R1049': 'Public Access to Documents Regulation',
  '32004R0883': 'Social Security Coordination Regulation',
  '32003L0109': 'Long-Term Residents Directive',
  '32003L0086': 'Family Reunification Directive',
  '32005L0085': 'Asylum Procedures Directive (old)',
  '32004L0038': 'Free Movement Directive',
  '32005L0036': 'Professional Qualifications Directive',
  '32011L0036': 'Anti-Trafficking Directive',
  '32016L0680': 'Law Enforcement Data Protection Directive',
  '32017L0541': 'Terrorism Directive',
  '32002L0584': 'European Arrest Warrant Framework Decision',
  '32022L0382': 'Temporary Protection Council Decision',
  '32018L1046': 'Financial Regulation',
  '32003R0343': 'Dublin III Regulation',
  '32013R0604': 'Dublin III Regulation',
  '32013R0603': 'Eurodac Regulation (old)',
  '32011R0182': 'EU Patent Regulation',
  '32022R0922': 'Entry/Exit System',
  '32011L0095': 'European Works Council Directive',
  '32013L0032': 'Asylum Procedures Directive',
  '32013L0033': 'Reception Conditions Directive (old)',
  '32018L1806': 'Visa Regulation',
};

const REGULATION_KEYWORDS: [string, string[]][] = [
  ['ammr', ['Asylum and Migration Management Regulation', 'Asylum and Migration Management']],
  ['apr', ['Asylum Procedure Regulation']],
  ['rbpr', ['Return Border Procedure Regulation']],
  ['cfmr', ['Crisis and Force Majeure Regulation']],
  ['eurodac', ['Eurodac Regulation']],
  ['sr', ['Screening Regulation']],
  ['qr', ['Qualification Regulation']],
  ['rcd', ['Reception Conditions Directive']],
  ['urfa', ['Union Resettlement and Humanitarian Admission Framework', 'Union Framework', 'Union Resettlement Framework']],
  ['ext:32021R2303', ['EU Asylum Agency Regulation', 'EUAA Regulation']],
  ['ext:32021R1147', ['AMIF Regulation', 'Asylum Migration Integration Fund Regulation']],
  ['ext:32021R1060', ['Common Provisions Regulation', 'CPR Regulation']],
  ['ext:32021R1148', ['Border Management Instrument Regulation', 'BMVI Regulation']],
  ['ext:32016R0679', ['GDPR', 'General Data Protection Regulation']],
  ['ext:32016R0399', ['Schengen Borders Code', 'SBC']],
  ['ext:32018R1725', ['EU Institutions Data Protection Regulation']],
  ['ext:32018R1240', ['ETIAS Regulation']],
  ['ext:32019R0817', ['Interoperability Regulation']],
  ['ext:32019R1896', ['Frontex Regulation', 'European Border and Coast Guard Regulation']],
  ['ext:32017R2226', ['Entry/Exit System Regulation', 'EES Regulation']],
  ['ext:32018R1806', ['Visa Requirements Regulation']],
  ['ext:32008L0115', ['Return Directive']],
  ['ext:32001L0055', ['Temporary Protection Directive']],
];

/** Build a CELEX number from "Regulation (EU) 2024/1351" or "(EU) 2024/1351" */
function celexFromRef(ref: string): string | null {
  const m = ref.match(/(\d{4})\/(\d{1,6})/);
  if (!m) return null;
  const type = ref.startsWith('Directive') ? 'L' : 'R';
  return `3${m[1]}${type}${m[2].padStart(4, '0')}`;
}

/** Try to look up an (EU) YYYY/NNNN reference in our document set */
function lookupDocId(year: string, num: string): string | null {
  for (const type of ['R', 'L']) {
    const celex = `3${year}${type}${num.padStart(4, '0')}`;
    if (CELEX_TO_DOC[celex]) return CELEX_TO_DOC[celex];
    if (EXTERNAL_CELEX[celex]) return `ext:${celex}`;
  }
  return null;
}

export function isExternalDoc(docId: string): boolean {
  return docId.startsWith('ext:');
}

export function getExternalCelex(docId: string): string {
  return docId.replace('ext:', '');
}

export function getExternalName(celex: string): string | undefined {
  return EXTERNAL_CELEX[celex];
}

export function getEurlexUrl(celex: string): string {
  // CELEX format: 3YYYYTNNNN (10 chars)
  //   position 0: '3'
  //   positions 1-4: year
  //   position 5: type ('R' or 'L')
  //   positions 6+: zero-padded number
  const type = celex[5] === 'L' ? 'dir' : 'reg';
  const year = celex.substring(1, 5);
  const num = parseInt(celex.substring(6)).toString();
  return `https://eur-lex.europa.eu/eli/${type}/${year}/${num}/oj`;
}

function lookupCelexRef(text: string): string | null {
  // (EU) YYYY/NNNN or (EU, Euratom) YYYY/NNNN
  const m1 = text.match(/((?:Regulations?|Directive)\s+)?\((?:EU|EU, Euratom)\)\s*(\d{4})\/(\d{1,6})/i);
  if (m1) {
    const id = lookupDocId(m1[2], m1[3]);
    if (id) return id;
  }
  // (EC) No NNNN/YYYY (number/year, reversed)
  const m2 = text.match(/((?:Regulations?|Directive)\s+)?\(EC\)\s+No\s+(\d{1,6})\/(\d{4})/i);
  if (m2) {
    const id = lookupDocId(m2[3], m2[2]);
    if (id) return id;
  }
  return null;
}

function findDocBySurroundingText(text: string, center: number, range: number = 200): string | null {
  const afterText = text.substring(center, Math.min(text.length, center + 120));

  // Check proximity: if "this Regulation"/"this Directive" appears closer than any CELEX ref,
  // the reference is to the current document
  const thisRegIdx = afterText.search(/\bthis\s+(Regulation|Directive)\b/i);
  const celexIdx = afterText.search(/\((?:EU|EU, Euratom|EC)\)/);

  if (thisRegIdx !== -1 && (celexIdx === -1 || thisRegIdx < celexIdx)) {
    return null;
  }

  if (celexIdx !== -1) {
    // Check if a paragraph break appears before the CELEX ref,
    // indicating it belongs to a different clause/bullet point
    const textBeforeCelex = afterText.substring(0, celexIdx);
    const hasParagraphBreak = /;\n\n|\.\n\n|\n\n\(/.test(textBeforeCelex);
    if (!hasParagraphBreak) {
      const docId = lookupCelexRef(afterText);
      if (docId) return docId;
    }
  }

  // Broader context fallback — keyword-based only, to avoid picking up
  // CELEX refs from unrelated sentences
  const ctx = text.substring(Math.max(0, center - 60), Math.min(text.length, center + range));
  const lower = ctx.toLowerCase();
  for (const [id, keywords] of REGULATION_KEYWORDS) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) return id;
    }
  }
  return null;
}

function isExcluded(text: string, _matchStart: number, matchEnd: number): boolean {
  const after = text.substring(matchEnd, matchEnd + 200);
  for (const term of EXCLUDED_TERMS) {
    if (after.includes(term)) return true;
  }
  // Check CELEX-based exclusions — try (EU) and (EC) formats
  const m1 = after.match(/((?:Regulations?|Directive)\s+)?\((?:EU|EU, Euratom)\)\s*(\d{4})\/(\d{1,6})/i);
  if (m1) {
    const celex = celexFromRef(m1[0]);
    if (celex && EXCLUDED_CELEX.includes(celex)) return true;
  }
  const m2 = after.match(/((?:Regulations?|Directive)\s+)?\(EC\)\s+No\s+(\d{1,6})\/(\d{4})/i);
  if (m2) {
    const celex = `3${m2[3]}R${m2[2].padStart(4, '0')}`;
    if (EXCLUDED_CELEX.includes(celex)) return true;
    const celexL = `3${m2[3]}L${m2[2].padStart(4, '0')}`;
    if (EXCLUDED_CELEX.includes(celexL)) return true;
  }
  return false;
}

interface RawReference {
  articleNumber: string;
  paragraph?: string;
  documentId: string | null;
  text: string;
  startIndex: number;
  endIndex: number;
}

export function detectReferences(text: string): RawReference[] {
  const results: RawReference[] = [];
  let match;

  // Pattern 1: "Article(s) X(Y)" optionally followed by regulation reference
  const articlePattern = /Articles?\s+(\d+[a-z]?)\s*(?:\((\d+[a-zA-Z]?)\))?/gi;
  while ((match = articlePattern.exec(text)) !== null) {
    const fullMatch = match[0];
    const articleNum = match[1];
    const para = match[2];
    const startIdx = match.index;

    if (articleNum.length >= 4) continue;
    if (isExcluded(text, startIdx, startIdx + fullMatch.length)) continue;

    const docId = findDocBySurroundingText(text, startIdx + fullMatch.length);

    results.push({
      articleNumber: articleNum,
      paragraph: para || undefined,
      documentId: docId,
      text: fullMatch,
      startIndex: startIdx,
      endIndex: startIdx + fullMatch.length,
    });

    // Scan for continuation numbers in lists and ranges
    // e.g., "Articles 25–28", "Articles 3, 5, 11", "Article 20 to 26"
    // Scan only within a local window (80 chars) to avoid picking up
    // numbers from unrelated sentences that belong to different documents.
    const contWindow = 80;
    const remainingForCont = text.substring(
      startIdx + fullMatch.length,
      Math.min(text.length, startIdx + fullMatch.length + contWindow)
    );
    const contRegex = /(?:,|\b(?:and|or|to)\b|[–—])\s*(\d+[a-z]?)/gi;
    let contMatch;
    while ((contMatch = contRegex.exec(remainingForCont)) !== null) {
      const contNum = contMatch[1];
      if (contNum.length >= 4) continue;

      const numOffsetInMatch = contMatch[0].length - contMatch[1].length;
      const contStart = startIdx + fullMatch.length + contMatch.index + numOffsetInMatch;
      const contEnd = contStart + contMatch[1].length;

      // Resolve each continuation number independently — don't inherit
      // the parent's docId, since the continuation may be in a different
      // sentence with a different regulation reference.
      const contDocId = findDocBySurroundingText(text, contEnd);

      results.push({
        articleNumber: contNum,
        paragraph: undefined,
        documentId: contDocId,
        text: contMatch[1],
        startIndex: contStart,
        endIndex: contEnd,
      });
    }
  }

  // Pattern 2: "point (x) of Article Y" / "points (a), (b) and (c) of Article Y"
  const pointPattern = /points?\s+\(([a-z])\)\s+of\s+Article\s+(\d+)/gi;
  while ((match = pointPattern.exec(text)) !== null) {
    if (isExcluded(text, match.index, match.index + match[0].length)) continue;
    const docId = findDocBySurroundingText(text, match.index + match[0].length);
    results.push({
      articleNumber: match[2],
      paragraph: match[1],
      documentId: docId,
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Pattern 3: "in accordance with Article X" / "pursuant to Article X"
  const prepPattern = /(?:in accordance with|pursuant to|referred to in|as referred to in|as set out in|within the meaning of|for the purposes of)\s+Article\s+(\d+[a-z]?)\s*(?:\((\d+[a-zA-Z]?)\))?/gi;
  while ((match = prepPattern.exec(text)) !== null) {
    if (isExcluded(text, match.index, match.index + match[0].length)) continue;
    const articleNum = match[1];
    if (articleNum.length >= 4) continue;
    const docId = findDocBySurroundingText(text, match.index + match[0].length);
    results.push({
      articleNumber: articleNum,
      paragraph: match[2] || undefined,
      documentId: docId,
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Pattern 4: All (EU) YYYY/NNNN and (EC) No NNNN/YYYY references
  // Covers "Regulation (EU) 2024/1351", "Directive (EU) 2024/1346",
  // "(EU) 2024/1349", "Regulation (EC) No 1560/2003", etc.
  const celexRefPattern = /((?:Regulations?|Directive)\s+)?\((?:EU|EU, Euratom)\)\s*(\d{4})\/(\d{1,6})/gi;
  while ((match = celexRefPattern.exec(text)) !== null) {
    const [fullMatch, _typePrefix, year, num] = match;
    const docId = lookupDocId(year, num);
    if (!docId) continue;

    const alreadyCovered = results.some(r =>
      r.startIndex <= match!.index && r.endIndex > match!.index
    );
    if (alreadyCovered) continue;

    results.push({
      articleNumber: '1',
      paragraph: undefined,
      documentId: docId,
      text: fullMatch,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length,
    });
  }
  // (EC) No NNNN/YYYY format (number/year, reversed)
  const ecRefPattern = /((?:Regulations?|Directive)\s+)?\(EC\)\s+No\s+(\d{1,6})\/(\d{4})/gi;
  while ((match = ecRefPattern.exec(text)) !== null) {
    const [fullMatch, _typePrefix, num, year] = match;
    const docId = lookupDocId(year, num);
    if (!docId) continue;

    const alreadyCovered = results.some(r =>
      r.startIndex <= match!.index && r.endIndex > match!.index
    );
    if (alreadyCovered) continue;

    results.push({
      articleNumber: '1',
      paragraph: undefined,
      documentId: docId,
      text: fullMatch,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length,
    });
  }

  // Pattern 4b: "Council Directive YYYY/NNN/EC" or "Directive YYYY/NNN/EC" or "Directive YYYY/NNN/EU"
  const directiveRefPattern = /(?:Council\s+)?Directive\s+(\d{4})\/(\d{1,6})\/(?:EC|EU)/gi;
  while ((match = directiveRefPattern.exec(text)) !== null) {
    const [fullMatch, year, num] = match;
    const docId = lookupDocId(year, num);
    if (!docId) continue;

    const alreadyCovered = results.some(r =>
      r.startIndex <= match!.index && r.endIndex > match!.index
    );
    if (alreadyCovered) continue;

    results.push({
      articleNumber: '1',
      paragraph: undefined,
      documentId: docId,
      text: fullMatch,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length,
    });
  }

  // Pattern 4c: "Regulation (EU) No YYYY/NNNN" format (e.g., "Regulation (EU) No 604/2013")
  const regNoPattern = /Regulation\s+\(EU\)\s+No\s+(\d{1,6})\/(\d{4})/gi;
  while ((match = regNoPattern.exec(text)) !== null) {
    const [fullMatch, num, year] = match;
    const docId = lookupDocId(year, num);
    if (!docId) continue;

    const alreadyCovered = results.some(r =>
      r.startIndex <= match!.index && r.endIndex > match!.index
    );
    if (alreadyCovered) continue;

    results.push({
      articleNumber: '1',
      paragraph: undefined,
      documentId: docId,
      text: fullMatch,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length,
    });
  }

  // Pattern 4d: "Council Framework Decision YYYY/NNN/JHA" format
  const frameworkPattern = /(?:Council\s+)?Framework\s+Decision\s+(\d{4})\/(\d{1,6})\/JHA/gi;
  while ((match = frameworkPattern.exec(text)) !== null) {
    const [fullMatch, year, num] = match;
    const docId = lookupDocId(year, num);
    if (!docId) continue;

    const alreadyCovered = results.some(r =>
      r.startIndex <= match!.index && r.endIndex > match!.index
    );
    if (alreadyCovered) continue;

    results.push({
      articleNumber: '1',
      paragraph: undefined,
      documentId: docId,
      text: fullMatch,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length,
    });
  }

  // Pattern 4e: "Council Implementing Decision (EU) YYYY/NNNN" format
  const implDecisionPattern = /Council\s+Implementing\s+Decision\s+\(EU\)\s+(\d{4})\/(\d{1,6})/gi;
  while ((match = implDecisionPattern.exec(text)) !== null) {
    const [fullMatch, year, num] = match;
    const docId = lookupDocId(year, num);
    if (!docId) continue;

    const alreadyCovered = results.some(r =>
      r.startIndex <= match!.index && r.endIndex > match!.index
    );
    if (alreadyCovered) continue;

    results.push({
      articleNumber: '1',
      paragraph: undefined,
      documentId: docId,
      text: fullMatch,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length,
    });
  }

  // Pattern 4f: "Directive YYYY/NNN/EU" without year suffix (e.g., "Directive 2017/541")
  const directiveNoSuffixPattern = /Directive\s+(\d{4})\/(\d{1,6})(?!\s*\/)/gi;
  while ((match = directiveNoSuffixPattern.exec(text)) !== null) {
    const [fullMatch, year, num] = match;
    const docId = lookupDocId(year, num);
    if (!docId) continue;

    const alreadyCovered = results.some(r =>
      r.startIndex <= match!.index && r.endIndex > match!.index
    );
    if (alreadyCovered) continue;

    results.push({
      articleNumber: '1',
      paragraph: undefined,
      documentId: docId,
      text: fullMatch,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length,
    });
  }

  // Pattern 5: regulation/directive name keywords (e.g., "Asylum Procedure Regulation")
  const kwEntries = REGULATION_KEYWORDS.flatMap(([id, keywords]) =>
    keywords.map(kw => ({ id, kw, escaped: kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }))
  ).sort((a, b) => b.kw.length - a.kw.length);
  const namePattern = new RegExp(kwEntries.map(e => e.escaped).join('|'), 'gi');
  while ((match = namePattern.exec(text)) !== null) {
    const matchedLower = match[0].toLowerCase();
    const entry = kwEntries.find(e => e.kw.toLowerCase() === matchedLower);
    if (!entry) continue;
    const alreadyCovered = results.some(r =>
      r.startIndex <= match!.index && r.endIndex >= match!.index + match![0].length
    );
    if (alreadyCovered) continue;
    results.push({
      articleNumber: '1',
      paragraph: undefined,
      documentId: entry.id,
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  results.sort((a, b) => a.startIndex - b.startIndex);
  return deduplicate(results);
}

/** Sort by start then longest span first, then filter to non-overlapping intervals */
function deduplicate(refs: RawReference[]): RawReference[] {
  refs.sort((a, b) => a.startIndex - b.startIndex || (b.endIndex - b.startIndex) - (a.endIndex - a.startIndex));
  const result: RawReference[] = [];
  let lastEnd = -1;
  for (const r of refs) {
    if (r.startIndex >= lastEnd) {
      result.push(r);
      lastEnd = r.endIndex;
    }
  }
  return result;
}

export function createReference(
  raw: RawReference,
  defaultDocId: string
): Reference {
  return {
    documentId: raw.documentId ?? defaultDocId,
    articleNumber: raw.articleNumber,
    paragraph: raw.paragraph,
    displayText: raw.text,
  };
}
