export {
  getDocumentIndex,
  getDocumentShortName,
  getRegulationNumber,
  getDocument,
  getAllDocuments,
  getDocumentIds as getAllDocumentIds,
  getLoadedDocuments,
  isDocumentLoaded,
} from '../services/documentLoader';

export { getArticle } from './articleUtils';
export type { DocumentData, DocumentIndex } from '../types';
