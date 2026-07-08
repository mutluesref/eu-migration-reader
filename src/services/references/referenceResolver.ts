import { CELEX_TO_DOC } from './externalReferenceMap';

export function lookupDocId(year: string, num: string): string | null {
  for (const type of ['R', 'L']) {
    const celex = `3${year}${type}${num.padStart(4, '0')}`;
    if (CELEX_TO_DOC[celex]) return CELEX_TO_DOC[celex];
  }
  return null;
}

export function celexFromRef(ref: string): string | null {
  const m = ref.match(/(\d{4})\/(\d{1,6})/);
  if (!m) return null;
  const type = ref.startsWith('Directive') ? 'L' : 'R';
  return `3${m[1]}${type}${m[2].padStart(4, '0')}`;
}

export function getEurlexUrl(celex: string): string {
  const type = celex[5] === 'L' ? 'dir' : 'reg';
  const year = celex.substring(1, 5);
  const num = parseInt(celex.substring(6)).toString();
  return `https://eur-lex.europa.eu/eli/${type}/${year}/${num}/oj`;
}
