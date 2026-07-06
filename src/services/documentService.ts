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

class DocumentService {
  private documentIndex: DocumentIndex[] | null = null;

  private getIndex(): DocumentIndex[] {
    if (!this.documentIndex) {
      this.documentIndex = indexData as DocumentIndex[];
    }
    return this.documentIndex;
  }

  getDocuments(): DocumentData[] {
    return this.getIndex().map(d => documentMap[d.id]);
  }

  getDocument(id: string): DocumentData | undefined {
    return documentMap[id];
  }

  getDocumentIndex(): DocumentIndex[] {
    return this.getIndex();
  }

  getDocumentShortName(id: string): string {
    const idx = this.getIndex().find(d => d.id === id);
    return idx?.shortName ?? id;
  }

  getRegulationNumber(id: string): string {
    const idx = this.getIndex().find(d => d.id === id);
    if (!idx) return '';
    const title = idx.title;
    const match = title.match(/^(REGULATION|DIRECTIVE)\s+\(EU\)\s+\d{4}\/\d+/);
    if (!match) return '';
    const s = match[0];
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  getAllDocumentIds(): string[] {
    return this.getIndex().map(d => d.id);
  }

  getArticle(
    docId: string,
    articleNumber: string
  ): { document: DocumentData; article: DocumentData['articles'][0] } | null {
    const doc = this.getDocument(docId);
    if (!doc) return null;
    const article = doc.articles.find(
      a => String(a.number) === String(articleNumber)
    );
    if (!article) return null;
    return { document: doc, article };
  }
}

export const documentService = new DocumentService();
