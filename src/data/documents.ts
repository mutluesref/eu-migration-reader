import type { DocumentData, DocumentIndex } from '../types';
import indexData from './index.json';
import ammrData from './ammr.json';
import aprData from './apr.json';
import rbprData from './rbpr.json';
import cfmrData from './cfmr.json';
import eurodacData from './eurodac.json';
import srData from './sr.json';
import qrData from './qr.json';
import rcdData from './rcd.json';
import urfaData from './urfa.json';

const documentMap: Record<string, DocumentData> = {
  ammr: ammrData as DocumentData,
  apr: aprData as DocumentData,
  rbpr: rbprData as DocumentData,
  cfmr: cfmrData as DocumentData,
  eurodac: eurodacData as DocumentData,
  sr: srData as DocumentData,
  qr: qrData as DocumentData,
  rcd: rcdData as DocumentData,
  urfa: urfaData as DocumentData,
};

export function getDocumentIndex(): DocumentIndex[] {
  return indexData as DocumentIndex[];
}

export function getDocument(id: string): DocumentData {
  return documentMap[id];
}

export function getDocumentShortName(id: string): string {
  const idx = getDocumentIndex().find(d => d.id === id);
  return idx?.shortName ?? id;
}

export function getRegulationNumber(id: string): string {
  const idx = getDocumentIndex().find(d => d.id === id);
  if (!idx) return '';
  const title = idx.title;
  const match = title.match(/^(REGULATION|DIRECTIVE)\s+\(EU\)\s+\d{4}\/\d+/);
  if (!match) return '';
  const s = match[0];
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function getAllDocumentIds(): string[] {
  return getDocumentIndex().map(d => d.id);
}

export function getAllDocuments(): DocumentData[] {
  return getDocumentIndex().map(d => getDocument(d.id));
}

export function getArticle(
  docId: string,
  articleNumber: string
): { document: DocumentData; article: DocumentData['articles'][0] } | null {
  const doc = getDocument(docId);
  if (!doc) return null;
  const article = doc.articles.find(
    a => String(a.number) === String(articleNumber)
  );
  if (!article) return null;
  return { document: doc, article };
}
