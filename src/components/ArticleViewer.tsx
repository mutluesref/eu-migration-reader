import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { DocumentData, Reference } from '../types';
import { detectReferences, createReference, isExternalDoc, getExternalCelex, getExternalName, getEurlexUrl } from '../utils/referenceDetection';
import { getDocumentShortName, getRegulationNumber } from '../data/documents';
import { useStore } from '../store';
import useBookmarks from '../hooks/useBookmarks';
import ArticleHeader from './ArticleHeader';
import RecitalView from './RecitalView';
import ReferencePopup from './ReferencePopup';
import type { PopupInfo } from './ReferencePopup';

interface Props {
  document: DocumentData;
  articleNumber: string;
  documents: DocumentData[];
  onReferenceClick: (docId: string, articleNumber: string) => void;
  onReferenceNavigate: (docId: string, articleNumber: string) => void;
}

type Segment = { type: 'text'; text: string } | { type: 'ref'; text: string; ref: Reference };

function splitIntoParagraphs(text: string): string[] {
  const paragraphs: string[] = [];
  const parts = text.split('\n\n');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed) {
      paragraphs.push(trimmed);
    }
  }
  if (paragraphs.length === 0 && text.trim()) {
    paragraphs.push(text.trim());
  }
  return paragraphs;
}

function getIndentLevel(text: string, index?: number, paragraphs?: string[]): number {
  const trimmed = text.trimStart();
  if (/^[—–-]\s/.test(trimmed)) return 3;

  if (/^\([ivx]{2,}\)\s/.test(trimmed)) return 2;

  if (/^\([ivx]\)\s/.test(trimmed)) {
    if (paragraphs && index !== undefined && index + 1 < paragraphs.length) {
      const next = paragraphs[index + 1].trimStart();
      if (/^\([ivx]{2,}\)\s/.test(next)) return 2;
      if (/^\([a-hj-z]\)\s/.test(next)) return 1;
    }
    if (paragraphs && index !== undefined && index > 0) {
      const prev = paragraphs[index - 1].trimStart();
      if (/^\([a-hj-z]\)\s/.test(prev)) return 1;
      if (/^\([ivx]{2,}\)\s/.test(prev) || /^\([ivx]\)\s/.test(prev)) return 2;
    }
    if (/\([ivx]{2,}\)/.test(text)) return 2;
    if (/\([jk]\)/.test(text)) return 1;
    return /^\(i\)\s/.test(trimmed) ? 1 : 2;
  }

  if (/^\([a-z]\)\s/.test(trimmed)) return 1;
  if (/^[a-z]\.\s/.test(trimmed)) return 1;
  return 0;
}

function parseParagraphForSegments(paragraphText: string, docId: string): Segment[] {
  const rawRefs = detectReferences(paragraphText);
  if (rawRefs.length === 0) {
    return [{ type: 'text', text: paragraphText }];
  }

  const segments: Segment[] = [];
  let lastIdx = 0;

  for (const raw of rawRefs) {
    if (raw.startIndex > lastIdx) {
      segments.push({ type: 'text', text: paragraphText.substring(lastIdx, raw.startIndex) });
    }
    const ref = createReference(raw, docId);
    segments.push({ type: 'ref', text: raw.text, ref });
    lastIdx = raw.endIndex;
  }

  if (lastIdx < paragraphText.length) {
    segments.push({ type: 'text', text: paragraphText.substring(lastIdx) });
  }

  return segments;
}

function getRefShortName(docId: string): string {
  if (docId.startsWith('ext:')) {
    const celex = docId.replace('ext:', '');
    const name = getExternalName(celex);
    return name ?? docId;
  }
  return getDocumentShortName(docId);
}

export default function ArticleViewer({ document: doc, articleNumber, documents: allDocs, onReferenceClick, onReferenceNavigate }: Props) {
  const fontSize = useStore((s) => s.fontSize);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const [activeRefs, setActiveRefs] = useState<Set<string>>(new Set());
  const popupRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [copiedReg, setCopiedReg] = useState(false);

  const copyRegNum = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReg(true);
    setTimeout(() => setCopiedReg(false), 1500);
  }, []);

  const article = articleNumber === 'recitals'
    ? null
    : doc.articles.find(a => String(a.number) === articleNumber);

  const bodyContent = useMemo(() => {
    if (!article) return '';
    const c = article.content;
    const s = article.subject;
    if (s && c.startsWith(s + '\n')) {
      return c.substring(s.length + 1);
    }
    return c;
  }, [article]);

  const paragraphs = useMemo(() => {
    if (!bodyContent) return [];
    return splitIntoParagraphs(bodyContent);
  }, [bodyContent]);

  const paragraphSegments = useMemo(() => {
    if (!article) return [];
    return paragraphs.map(p => ({
      text: p,
      segments: parseParagraphForSegments(p, doc.id),
    }));
  }, [article, paragraphs, doc.id]);

  const indentLevels = useMemo(() => {
    if (!article) return [];
    return paragraphs.map((p, i) => getIndentLevel(p, i, paragraphs));
  }, [article, paragraphs]);

  const findArticleContent = useCallback((docId: string, articleNum: string): { content: string; title: string; subject: string; docName: string } | null => {
    const d = allDocs.find(x => x.id === docId);
    if (!d) return null;
    const a = d.articles.find(x => String(x.number) === articleNum);
    if (!a) return null;
    const clean = a.subject && a.content.startsWith(a.subject + '\n')
      ? a.content.substring(a.subject.length + 1)
      : a.content;
    return { content: clean, title: a.title, subject: a.subject, docName: d.shortName };
  }, [allDocs]);

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const handleMouseEnterRef = useCallback((ref: Reference, e: React.MouseEvent) => {
    if (isTouchDevice) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    let found = !isExternalDoc(ref.documentId) ? findArticleContent(ref.documentId, ref.articleNumber) : null;
    if (found) {
      setPopup({
        x: rect.left,
        y: rect.bottom + 12,
        content: found.content.substring(0, 600) + (found.content.length > 600 ? '...' : ''),
        docName: found.docName,
        articleTitle: found.title,
        subject: found.subject,
        refDocId: ref.documentId,
        refArticleNumber: ref.articleNumber,
      });
    } else {
      const celex = isExternalDoc(ref.documentId) ? getExternalCelex(ref.documentId) : '';
      const extName = celex ? getExternalName(celex) : undefined;
      const docName = extName
        ? `${extName} (${celex.substring(1, 5)}/${parseInt(celex.substring(6))})`
        : getDocumentShortName(ref.documentId);
      setPopup({
        x: rect.left,
        y: rect.bottom + 12,
        content: celex ? `External reference — ${docName}` : `Article ${ref.articleNumber}`,
        docName,
        articleTitle: celex ? docName : `Article ${ref.articleNumber}`,
        subject: '',
        refDocId: ref.documentId,
        refArticleNumber: ref.articleNumber,
      });
    }
  }, [findArticleContent, isTouchDevice]);

  const handleMouseLeaveRef = useCallback(() => {
    if (isTouchDevice) return;
    timeoutRef.current = setTimeout(() => {
      setPopup(null);
    }, 250);
  }, [isTouchDevice]);

  const handleClickRef = useCallback((ref: Reference) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!isTouchDevice) {
      setPopup(null);
      setActiveRefs(prev => new Set(prev).add(`${ref.documentId}:${ref.articleNumber}`));
      onReferenceClick(ref.documentId, ref.articleNumber);
      return;
    }

    const rect = document.querySelector(`[data-ref="${ref.documentId}:${ref.articleNumber}"]`)?.getBoundingClientRect();
    let found = !isExternalDoc(ref.documentId) ? findArticleContent(ref.documentId, ref.articleNumber) : null;
    if (found) {
      setPopup({
        x: rect?.left ?? 0,
        y: (rect?.bottom ?? 0) + 12,
        content: found.content.substring(0, 600) + (found.content.length > 600 ? '...' : ''),
        docName: found.docName,
        articleTitle: found.title,
        subject: found.subject,
        refDocId: ref.documentId,
        refArticleNumber: ref.articleNumber,
      });
    } else {
      const celex = isExternalDoc(ref.documentId) ? getExternalCelex(ref.documentId) : '';
      const extName = celex ? getExternalName(celex) : undefined;
      const docName = extName
        ? `${extName} (${celex.substring(1, 5)}/${parseInt(celex.substring(6))})`
        : getDocumentShortName(ref.documentId);
      setPopup({
        x: rect?.left ?? 0,
        y: (rect?.bottom ?? 0) + 12,
        content: celex ? `External reference — ${docName}` : `Article ${ref.articleNumber}`,
        docName,
        articleTitle: celex ? docName : `Article ${ref.articleNumber}`,
        subject: '',
        refDocId: ref.documentId,
        refArticleNumber: ref.articleNumber,
      });
    }
  }, [findArticleContent, isTouchDevice, onReferenceClick]);

  const handlePopupInspect = useCallback(() => {
    if (!popup) return;
    setPopup(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveRefs(prev => new Set(prev).add(`${popup.refDocId}:${popup.refArticleNumber}`));
    onReferenceClick(popup.refDocId, popup.refArticleNumber);
  }, [popup, onReferenceClick]);

  const handleDoubleClickRef = useCallback((ref: Reference) => {
    setPopup(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isExternalDoc(ref.documentId)) {
      const url = getEurlexUrl(getExternalCelex(ref.documentId));
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.href = url;
      }
      return;
    }
    onReferenceNavigate(ref.documentId, ref.articleNumber);
  }, [onReferenceNavigate]);

  const handleToggleBookmark = useCallback(() => {
    if (!article) return;
    if (isBookmarked(doc.id, String(article.number))) {
      removeBookmark(doc.id, String(article.number));
    } else {
      addBookmark(doc.id, String(article.number), article.title);
    }
  }, [article, doc.id, isBookmarked, addBookmark, removeBookmark]);

  useEffect(() => {
    if (popup && popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const gap = 12;
      let left = popup.x;
      let top = popup.y;
      if (rect.right > viewportW - 10) {
        left = viewportW - rect.width - 10;
      }
      if (left < 10) left = 10;
      if (rect.bottom > viewportH - 10) {
        top = popup.y - rect.height - gap * 2;
      }
      if (top < 10) top = 10;
      popupRef.current.style.left = `${left}px`;
      popupRef.current.style.top = `${top}px`;
    }
  }, [popup]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!article && articleNumber !== 'recitals') {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">
        Article not found
      </div>
    );
  }

  if (articleNumber === 'recitals') {
    return <RecitalView doc={doc} />;
  }

  const bookmarked = isBookmarked(doc.id, String(article!.number));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="card dark:bg-slate-800">
        <ArticleHeader
          doc={doc}
          article={article!}
          copiedReg={copiedReg}
          onCopyReg={copyRegNum}
        />

        <div key={articleNumber} className="article-enter px-4 sm:px-6 pb-6 pt-4">
          <div className="article-text dark:text-slate-300" style={{ fontSize: `${fontSize}px` }}>
            {paragraphSegments.map((para, pi) => (
              <p key={pi} className="mb-3" style={{ paddingLeft: `${indentLevels[pi] * 24}px` }}>
                {para.segments.map((seg, si) => {
                  if (seg.type === 'text') {
                    return <span key={si}>{seg.text}</span>;
                  }
                  const ref = seg.ref;
                  const key = `${ref.documentId}:${ref.articleNumber}`;
                  const isActive = activeRefs.has(key);
                  return (
                    <span
                      key={si}
                      data-ref={`${ref.documentId}:${ref.articleNumber}`}
                      className={`reference-link ${isActive ? 'reference-link-active' : ''}`}
                      onMouseEnter={e => handleMouseEnterRef(ref, e)}
                      onMouseLeave={handleMouseLeaveRef}
                      onClick={() => handleClickRef(ref)}
                      onDoubleClick={() => handleDoubleClickRef(ref)}
                      title={`${getRefShortName(ref.documentId)}, Article ${ref.articleNumber}. Tap to inspect. Double-tap to navigate.`}
                    >
                      {seg.text}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              <span className="font-medium">Tip:</span> Click a reference to inspect it in the side panel. Double-click to navigate directly.
            </p>
            <button
              onClick={handleToggleBookmark}
              className="text-sm px-3 py-1.5 rounded-lg transition-colors dark:text-slate-400 dark:hover:bg-slate-700"
              title={bookmarked ? 'Remove bookmark' : 'Bookmark this article'}
            >
              {bookmarked ? '★' : '☆'}
            </button>
          </div>
        </div>
      </div>

      {popup && (
        <ReferencePopup
          popup={popup}
          popupRef={popupRef}
          onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
          onMouseLeave={handleMouseLeaveRef}
          onClickInspect={handlePopupInspect}
          onClose={() => { setPopup(null); if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
          copyRegNum={copyRegNum}
          regulationNumber={getRegulationNumber(doc.id)}
        />
      )}
    </div>
  );
}
