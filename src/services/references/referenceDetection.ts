import type { Reference } from '../../types';
import {
  CELEX_TO_DOC,
  EXCLUDED_CELEX,
  EXCLUDED_TERMS,
  EXTERNAL_CELEX,
  REGULATION_KEYWORDS,
} from './externalReferenceMap';

/** Build a CELEX number from "Regulation (EU) 2024/1351" or "(EU) 2024/1351" */
function celexFromRef(ref: string): string | null {
  const m = ref.match(/(\d{4})\/(\d{1,6})/);
  if (!m) return null;
  const type = ref.startsWith('Directive') ? 'L' : ref.includes('Decision') ? 'D' : 'R';
  return `3${m[1]}${type}${m[2].padStart(4, '0')}`;
}

/** Try to look up an (EU) YYYY/NNNN reference in our document set */
function lookupDocId(year: string, num: string): string | null {
  for (const type of ['R', 'L', 'D']) {
    const celex = `3${year}${type}${num.padStart(4, '0')}`;
    if (CELEX_TO_DOC[celex]) return CELEX_TO_DOC[celex];
    if (EXTERNAL_CELEX[celex]) return `ext:${celex}`;
  }
  return null;
}

function lookupDocIdForType(year: string, num: string, type: 'R' | 'L' | 'D'): string | null {
  const preferred = `3${year}${type}${num.padStart(4, '0')}`;
  if (CELEX_TO_DOC[preferred]) return CELEX_TO_DOC[preferred];
  if (EXTERNAL_CELEX[preferred]) return `ext:${preferred}`;
  return lookupDocId(year, num);
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
  //   position 5: type ('R', 'L', or 'D')
  //   positions 6+: zero-padded number
  const type = celex[5] === 'L' ? 'dir' : celex[5] === 'D' ? 'dec' : 'reg';
  const year = celex.substring(1, 5);
  const num = parseInt(celex.substring(6)).toString();
  return `https://eur-lex.europa.eu/eli/${type}/${year}/${num}/oj`;
}

function lookupInstrumentRef(text: string): string | null {
  // (EU) YYYY/NNNN or (EU, Euratom) YYYY/NNNN
  const m1 = text.match(
    /((?:Regulations?|Directive)\s+)?\((?:EU|EU, Euratom)\)\s*(\d{4})\/(\d{1,6})/i,
  );
  if (m1) {
    const type = /Directive/i.test(m1[1] ?? '') ? 'L' : 'R';
    const id = lookupDocIdForType(m1[2], m1[3], type);
    if (id) return id;
  }
  // (EC) No NNNN/YYYY (number/year, reversed)
  const m2 = text.match(/((?:Regulations?|Directive)\s+)?\(EC\)\s+No\s+(\d{1,6})\/(\d{4})/i);
  if (m2) {
    const type = /Directive/i.test(m2[1] ?? '') ? 'L' : 'R';
    const id = lookupDocIdForType(m2[3], m2[2], type);
    if (id) return id;
  }
  // Directive YYYY/NNN/EC or Directive YYYY/NNN/EU
  const m3 = text.match(/(?:Council\s+)?Directive\s+(\d{4})\/(\d{1,6})\/(?:EC|EU)/i);
  if (m3) {
    const id = lookupDocIdForType(m3[1], m3[2], 'L');
    if (id) return id;
  }
  // Regulation (EU) No NNNN/YYYY (number/year, reversed)
  const m4 = text.match(/Regulation\s+\(EU\)\s+No\s+(\d{1,6})\/(\d{4})/i);
  if (m4) {
    const id = lookupDocIdForType(m4[2], m4[1], 'R');
    if (id) return id;
  }
  // Framework and implementing decisions
  const m5 = text.match(/(?:Council\s+)?Framework\s+Decision\s+(\d{4})\/(\d{1,6})\/JHA/i);
  if (m5) {
    const id = lookupDocIdForType(m5[1], m5[2], 'D');
    if (id) return id;
  }
  const m6 = text.match(/Council\s+Implementing\s+Decision\s+\(EU\)\s+(\d{4})\/(\d{1,6})/i);
  if (m6) {
    const id = lookupDocIdForType(m6[1], m6[2], 'D');
    if (id) return id;
  }
  // Directive YYYY/NNN without suffix
  const m7 = text.match(/Directive\s+(\d{4})\/(\d{1,6})(?!\s*\/)/i);
  if (m7) {
    const id = lookupDocIdForType(m7[1], m7[2], 'L');
    if (id) return id;
  }
  return null;
}

function findInstrumentsInText(text: string): { index: number; endIndex: number; docId: string }[] {
  const patterns = [
    /((?:Regulations?|Directive)\s+)?\((?:EU|EU, Euratom)\)\s*(\d{4})\/(\d{1,6})/gi,
    /((?:Regulations?|Directive)\s+)?\(EC\)\s+No\s+(\d{1,6})\/(\d{4})/gi,
    /(?:Council\s+)?Directive\s+(\d{4})\/(\d{1,6})\/(?:EC|EU)/gi,
    /Regulation\s+\(EU\)\s+No\s+(\d{1,6})\/(\d{4})/gi,
    /(?:Council\s+)?Framework\s+Decision\s+(\d{4})\/(\d{1,6})\/JHA/gi,
    /Council\s+Implementing\s+Decision\s+\(EU\)\s+(\d{4})\/(\d{1,6})/gi,
    /Directive\s+(\d{4})\/(\d{1,6})(?!\s*\/)/gi,
  ];

  const instruments: { index: number; endIndex: number; docId: string }[] = [];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const docId = lookupInstrumentRef(match[0]);
      if (docId) {
        instruments.push({ index: match.index, endIndex: match.index + match[0].length, docId });
      }
    }
  }

  return instruments.sort((a, b) => a.index - b.index);
}

function findInstrumentInText(text: string): { index: number; docId: string } | null {
  const [first] = findInstrumentsInText(text);
  return first ? { index: first.index, docId: first.docId } : null;
}

function findAmendedInstrument(text: string, center: number, range: number = 10000): string | null {
  const before = text.substring(Math.max(0, center - range), center);
  const instruments = findInstrumentsInText(before);
  let best: { index: number; docId: string } | null = null;

  for (const instrument of instruments) {
    const beforeInstrument = before.substring(Math.max(0, instrument.index - 80), instrument.index);
    const afterInstrument = before.substring(instrument.endIndex, instrument.endIndex + 120);
    const isAmendmentHeading = /Amendments?\s+to\s+(?:Regulation|Directive)?\s*$/i.test(
      beforeInstrument,
    );
    const isAmendedClause = /\bis amended(?:\s+as\s+follows)?\b/i.test(afterInstrument);

    if ((isAmendmentHeading || isAmendedClause) && (!best || instrument.index > best.index)) {
      best = { index: instrument.index, docId: instrument.docId };
    }
  }

  return best?.docId ?? null;
}

function findPriorInstrument(text: string, center: number, range: number = 300): string | null {
  const before = text.substring(Math.max(0, center - range), center);

  let best: { index: number; docId: string } | null = null;

  for (const pattern of [
    /((?:Regulations?|Directive)\s+)?\((?:EU|EU, Euratom)\)\s*(\d{4})\/(\d{1,6})/gi,
    /((?:Regulations?|Directive)\s+)?\(EC\)\s+No\s+(\d{1,6})\/(\d{4})/gi,
    /(?:Council\s+)?Directive\s+(\d{4})\/(\d{1,6})\/(?:EC|EU)/gi,
    /Regulation\s+\(EU\)\s+No\s+(\d{1,6})\/(\d{4})/gi,
    /(?:Council\s+)?Framework\s+Decision\s+(\d{4})\/(\d{1,6})\/JHA/gi,
    /Council\s+Implementing\s+Decision\s+\(EU\)\s+(\d{4})\/(\d{1,6})/gi,
    /Directive\s+(\d{4})\/(\d{1,6})(?!\s*\/)/gi,
  ]) {
    let match;
    while ((match = pattern.exec(before)) !== null) {
      const docId = lookupInstrumentRef(match[0]);
      if (docId && (!best || match.index > best.index)) {
        best = { index: match.index, docId };
      }
    }
  }

  if (best) return best.docId;

  const lower = before.toLowerCase();
  for (const [id, keywords] of REGULATION_KEYWORDS) {
    for (const kw of keywords) {
      const index = lower.lastIndexOf(kw.toLowerCase());
      if (index !== -1 && (!best || index > best.index)) {
        best = { index, docId: id };
      }
    }
  }

  return best?.docId ?? null;
}

function findDocBySurroundingText(
  text: string,
  center: number,
  range: number = 200,
): string | null {
  const afterText = text.substring(center, Math.min(text.length, center + 120));
  const beforeParagraphBreak = afterText.split(/\n\n|;\n\n|\.\n\n/, 1)[0];
  const nearbyBeforeText = text.substring(Math.max(0, center - 140), center);
  const sentenceBeforeText = text.substring(Math.max(0, center - 500), center);
  const afterInstrument = findInstrumentInText(beforeParagraphBreak);
  const amendedDocId = findAmendedInstrument(text, center);

  // Check proximity: if "this Regulation"/"this Directive" appears closer than any instrument ref,
  // the reference is to the current document
  const thisRegIdx = afterText.search(/\bthis\s+(Regulation|Directive)\b/i);
  const instrumentIdx = afterInstrument?.index ?? -1;

  if (thisRegIdx !== -1 && (instrumentIdx === -1 || thisRegIdx < instrumentIdx)) {
    if (amendedDocId) return amendedDocId;
    return null;
  }

  const thatInstrumentIdx = beforeParagraphBreak.search(/\bthat\s+(Regulation|Directive)\b/i);
  if (thatInstrumentIdx !== -1 && (instrumentIdx === -1 || thatInstrumentIdx < instrumentIdx)) {
    const priorDocId = findPriorInstrument(text, center, 1200);
    if (priorDocId) return priorDocId;
  }

  if (afterInstrument) {
    // Check if a paragraph break appears before the instrument ref,
    // indicating it belongs to a different clause/bullet point
    const textBeforeInstrument = afterText.substring(0, afterInstrument.index);
    const hasParagraphBreak = /;\n\n|\.\n\n|\n\n\(/.test(textBeforeInstrument);
    if (!hasParagraphBreak) {
      return afterInstrument.docId;
    }
  }

  if (/\bthat\s+(Regulation|Directive)\b/i.test(nearbyBeforeText)) {
    const priorDocId = findPriorInstrument(text, center, 1200);
    if (priorDocId) return priorDocId;
  }

  if (amendedDocId) {
    return amendedDocId;
  }

  const localSentenceParts = sentenceBeforeText.split(/;\n\n|\.\n\n|\n\n\(/);
  const localSentenceBeforeText = localSentenceParts[localSentenceParts.length - 1] ?? '';
  if (/\b(derogation from|procedures set out in|Part\s+[IVX]+ of)\b/i.test(localSentenceBeforeText)) {
    const instruments = findInstrumentsInText(localSentenceBeforeText);
    const localPriorDocId = instruments[instruments.length - 1]?.docId;
    if (localPriorDocId) return localPriorDocId;
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
  const m1 = after.match(
    /((?:Regulations?|Directive)\s+)?\((?:EU|EU, Euratom)\)\s*(\d{4})\/(\d{1,6})/i,
  );
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

export interface RawReference {
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
      Math.min(text.length, startIdx + fullMatch.length + contWindow),
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
  const prepPattern =
    /(?:in accordance with|pursuant to|referred to in|as referred to in|as set out in|within the meaning of|for the purposes of)\s+Article\s+(\d+[a-z]?)\s*(?:\((\d+[a-zA-Z]?)\))?/gi;
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
  const celexRefPattern =
    /((?:Regulations?|Directive)\s+)?\((?:EU|EU, Euratom)\)\s*(\d{4})\/(\d{1,6})/gi;
  while ((match = celexRefPattern.exec(text)) !== null) {
    const [fullMatch, , year, num] = match;
    const docId = lookupDocId(year, num);
    if (!docId) continue;

    const alreadyCovered = results.some(
      (r) => r.startIndex <= match!.index && r.endIndex > match!.index,
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
    const [fullMatch, , num, year] = match;
    const docId = lookupDocId(year, num);
    if (!docId) continue;

    const alreadyCovered = results.some(
      (r) => r.startIndex <= match!.index && r.endIndex > match!.index,
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

    const alreadyCovered = results.some(
      (r) => r.startIndex <= match!.index && r.endIndex > match!.index,
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

    const alreadyCovered = results.some(
      (r) => r.startIndex <= match!.index && r.endIndex > match!.index,
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

    const alreadyCovered = results.some(
      (r) => r.startIndex <= match!.index && r.endIndex > match!.index,
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

    const alreadyCovered = results.some(
      (r) => r.startIndex <= match!.index && r.endIndex > match!.index,
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

    const alreadyCovered = results.some(
      (r) => r.startIndex <= match!.index && r.endIndex > match!.index,
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
    keywords.map((kw) => ({ id, kw, escaped: kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') })),
  ).sort((a, b) => b.kw.length - a.kw.length);
  const namePattern = new RegExp(kwEntries.map((e) => e.escaped).join('|'), 'gi');
  while ((match = namePattern.exec(text)) !== null) {
    const matchedLower = match[0].toLowerCase();
    const entry = kwEntries.find((e) => e.kw.toLowerCase() === matchedLower);
    if (!entry) continue;
    const alreadyCovered = results.some(
      (r) => r.startIndex <= match!.index && r.endIndex >= match!.index + match![0].length,
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
  refs.sort(
    (a, b) =>
      a.startIndex - b.startIndex || b.endIndex - b.startIndex - (a.endIndex - a.startIndex),
  );
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

export function createReference(raw: RawReference, defaultDocId: string): Reference {
  return {
    documentId: raw.documentId ?? defaultDocId,
    articleNumber: raw.articleNumber,
    paragraph: raw.paragraph,
    displayText: raw.text,
  };
}
