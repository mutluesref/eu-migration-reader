export {
  getDocumentIndex,
  getDocumentShortName,
  getRegulationNumber,
  getDocument,
  getAllDocuments,
  loadDocument,
  loadDocuments,
  loadAllDocuments,
  getDocumentIds as getAllDocumentIds,
  getLoadedDocuments,
  isDocumentLoaded,
  areAllDocumentsLoaded,
  clearLoadedDocumentsForTests,
} from '../services/documentLoader';

export { getArticle } from './articleUtils';
export type { DocumentData, DocumentIndex } from '../types';
