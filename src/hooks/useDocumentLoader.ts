import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DocumentData } from '../types';
import { useStore } from '../store';
import { buildReverseIndex } from '../utils/reverseReferences';
import {
  getDocument,
  getDocumentIndex,
  getLoadedDocuments,
  loadAllDocuments,
  loadDocument,
} from '../services/documentLoader';

export function useDocumentLoader() {
  const currentDocId = useStore((s) => s.currentDocId);
  const [documents, setDocuments] = useState<DocumentData[]>(() => getLoadedDocuments());
  const [loading, setLoading] = useState(() => !getDocument(currentDocId));

  const refreshDocuments = useCallback(() => {
    setDocuments(getLoadedDocuments());
  }, []);

  const ensureDocument = useCallback(
    async (docId: string): Promise<DocumentData | undefined> => {
      const loaded = getDocument(docId);
      if (loaded) return loaded;

      const document = await loadDocument(docId);
      refreshDocuments();
      return document;
    },
    [refreshDocuments],
  );

  const ensureAllDocuments = useCallback(async (): Promise<DocumentData[]> => {
    const loaded = await loadAllDocuments();
    refreshDocuments();
    return loaded;
  }, [refreshDocuments]);

  useEffect(() => {
    let cancelled = false;
    const cached = getDocument(currentDocId);
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(!cached);
      }
    });

    loadDocument(currentDocId)
      .then(() => {
        if (cancelled) return;
        refreshDocuments();
      })
      .catch((error: unknown) => {
        console.error(`Failed to load document "${currentDocId}"`, error);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentDocId, refreshDocuments]);

  const currentDoc = useMemo(
    () => documents.find((d) => d.id === currentDocId),
    [documents, currentDocId],
  );

  const reverseIndex = useMemo(() => buildReverseIndex(documents), [documents]);

  return {
    documents,
    documentIndex: getDocumentIndex(),
    loading,
    currentDoc,
    reverseIndex,
    ensureDocument,
    ensureAllDocuments,
  };
}
