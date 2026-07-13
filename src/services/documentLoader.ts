import type { DocumentData, DocumentIndex } from '../types';
import indexData from '../data/index.json';

const documentIndex = indexData as DocumentIndex[];

const documentLoaders: Record<string, () => Promise<{ default: DocumentData }>> = {
  ammr: () => import('../data/ammr.json'),
  apr: () => import('../data/apr.json'),
  rbpr: () => import('../data/rbpr.json'),
  cfmr: () => import('../data/cfmr.json'),
  eurodac: () => import('../data/eurodac.json'),
  sr: () => import('../data/sr.json'),
  qr: () => import('../data/qr.json'),
  rcd: () => import('../data/rcd.json'),
  urfa: () => import('../data/urfa.json'),
};

const loadedDocuments = new Map<string, DocumentData>();
const pendingDocuments = new Map<string, Promise<DocumentData>>();

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
  return loadedDocuments.get(id);
}

export async function loadDocument(id: string): Promise<DocumentData | undefined> {
  const loaded = loadedDocuments.get(id);
  if (loaded) return loaded;

  const loader = documentLoaders[id];
  if (!loader) return undefined;

  const pending = pendingDocuments.get(id);
  if (pending) return pending;

  const promise = loader()
    .then((module) => {
      const document = module.default as DocumentData;
      loadedDocuments.set(id, document);
      return document;
    })
    .finally(() => {
      pendingDocuments.delete(id);
    });

  pendingDocuments.set(id, promise);
  return promise;
}

export async function loadDocuments(ids: string[]): Promise<DocumentData[]> {
  const docs = await Promise.all(ids.map((id) => loadDocument(id)));
  return docs.filter((doc): doc is DocumentData => Boolean(doc));
}

export async function loadAllDocuments(): Promise<DocumentData[]> {
  return loadDocuments(getDocumentIds());
}

/** @deprecated Returns only loaded documents. Use getLoadedDocuments() in new code. */
export function getAllDocuments(): DocumentData[] {
  return getLoadedDocuments();
}

export function areAllDocumentsLoaded(): boolean {
  return getDocumentIds().every((id) => loadedDocuments.has(id));
}

export function clearLoadedDocumentsForTests(): void {
  if (import.meta.env.MODE === 'test') {
    loadedDocuments.clear();
    pendingDocuments.clear();
  }
}

export function getLoadedDocuments(): DocumentData[] {
  return Array.from(loadedDocuments.values());
}

export function registerDocument(id: string, data: DocumentData): void {
  if (data.id !== id) {
    throw new Error(`Cannot register document "${data.id}" as "${id}"`);
  }
  loadedDocuments.set(id, data);
}

export function isDocumentLoaded(id: string): boolean {
  return loadedDocuments.has(id);
}

export async function preloadAllDocuments(): Promise<DocumentData[]> {
  return loadAllDocuments();
}

export function getDocumentIds(): string[] {
  return documentIndex.map((d) => d.id);
}
