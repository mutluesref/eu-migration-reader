import { useCallback } from 'react';
import { useStore } from '../store';

export function useAnnotations() {
  const annotations = useStore(s => s.annotations);
  const setAnnotation = useStore(s => s.setAnnotation);
  const removeAnnotation = useStore(s => s.removeAnnotation);

  const getAnnotation = useCallback(
    (docId: string, articleNumber: string): string => {
      const key = `${docId}:${articleNumber}`;
      return annotations[key]?.text ?? '';
    },
    [annotations]
  );

  const hasAnnotation = useCallback(
    (docId: string, articleNumber: string): boolean => {
      const key = `${docId}:${articleNumber}`;
      return !!annotations[key]?.text;
    },
    [annotations]
  );

  return { annotations, getAnnotation, hasAnnotation, setAnnotation, removeAnnotation };
}
