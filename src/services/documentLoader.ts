import type { DocumentData, DocumentIndex } from '../types';
import indexData from '../data/index.json';
import ammrData from '../data/ammr.json';
import aprData from '../data/apr.json';
import rbprData from '../data/rbpr.json';
import cfmrData from '../data/cfmr.json';
import eurodacData from '../data/eurodac.json';
import srData from '../data/sr.json';
import qrData from '../data/qr.json';
import rcdData from '../data/rcd.json';
import urfaData from '../data/urfa.json';

const documentIndex = indexData as DocumentIndex[];

const eagerDocuments: Record<string, DocumentData> = {
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

const loadedDocuments = new Map<string, DocumentData>();
let allLoaded = false;

export function getDocumentIndex(): DocumentIndex[] {
  return documentIndex;
}

export function getDocumentShortName(id: string): string {
  const entry = documentIndex.find((d) => d.id === id);
  return entry?.shortName ?? id;
}

export function getRegulationNumber(id: string): string {
  const entry = documentIndex.find((d) => d.id === id);
  if (!entry) return '';
  const title = entry.title;
  const match = title.match(/^(REGULATION|DIRECTIVE)\s+\(EU\)\s+\d{4}\/\d+/);
  if (!match) return '';
  const s = match[0];
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function getDocument(id: string): DocumentData | undefined {
  if (eagerDocuments[id]) {
    loadedDocuments.set(id, eagerDocuments[id]);
    return eagerDocuments[id];
  }
  return loadedDocuments.get(id);
}

export function getAllDocuments(): DocumentData[] {
  if (!allLoaded) {
    for (const [id, data] of Object.entries(eagerDocuments)) {
      if (!loadedDocuments.has(id)) {
        loadedDocuments.set(id, data);
      }
    }
    allLoaded = true;
  }
  return Array.from(loadedDocuments.values());
}

export function getLoadedDocuments(): DocumentData[] {
  return Array.from(loadedDocuments.values());
}

export function registerDocument(id: string, data: DocumentData): void {
  loadedDocuments.set(id, data);
}

export function isDocumentLoaded(id: string): boolean {
  return loadedDocuments.has(id);
}

export function preloadAllDocuments(): void {
  getAllDocuments();
}

export function getDocumentIds(): string[] {
  return documentIndex.map((d) => d.id);
}
