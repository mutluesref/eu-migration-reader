import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { DocumentData, Reference } from '../types';
import { detectReferences, createReference, isExternalDoc, getExternalCelex, getExternalName, getEurlexUrl } from '../utils/referenceDetection';
import { getDocumentShortName, getRegulationNumber } from '../data/documents';

interface Props {
  document: DocumentData;
  articleNumber: string;
  documents: DocumentData[];
  onReferenceClick: (docId: string, articleNumber: string) => void;
  onReferenceNavigate: (docId: string, articleNumber: string) => void;
}

interface PopupInfo {
  x: number;
  y: number;
  content: string;
  docName: string;
  articleTitle: string;
  subject: string;
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
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const [activeRefs, setActiveRefs] = useState<Set<string>>(new Set());
  const popupRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [copiedReg, setCopiedReg] = useState(false);

  const copyRegNum = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReg(true);
    setTimeout(() => setCopiedReg(false), 1500);
  };

  const article = articleNumber === 'recitals'
    ? null
    : doc.articles.find(a => String(a.number) === articleNumber);

  const subject = article?.subject ?? '';

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

  const handleMouseEnterRef = useCallback((ref: Reference, e: React.MouseEvent) => {
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
      });
    }
  }, [findArticleContent]);

  const handleMouseLeaveRef = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setPopup(null);
    }, 250);
  }, []);

  const handleClickRef = useCallback((ref: Reference) => {
    setActiveRefs(prev => new Set(prev).add(`${ref.documentId}:${ref.articleNumber}`));
    onReferenceClick(ref.documentId, ref.articleNumber);
  }, [onReferenceClick]);

  const handleDoubleClickRef = useCallback((ref: Reference) => {
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

  // Adjust popup position to stay in viewport, keeping a safe gap from the link
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
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Article not found
      </div>
    );
  }

  // Render recitals view
  if (articleNumber === 'recitals') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="card p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-blue-600 font-semibold">{doc.shortName}</span>
              <span className="text-[10px] text-slate-400">{getRegulationNumber(doc.id)}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Recitals</h2>
            <p className="text-xs text-slate-400 mt-1">
              {doc.recitals.length} recitals
            </p>
          </div>
          <div className="space-y-4">
            {doc.recitals.map(recital => (
              <div key={recital.number} className="text-sm leading-relaxed text-slate-600 pl-6 border-l-2 border-slate-100">
                <span className="font-semibold text-slate-400 absolute -ml-6">({recital.number})</span>
                {recital.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Article card */}
      <div className="card overflow-hidden">
        {/* Sticky article header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-blue-600 font-semibold">{doc.shortName}</span>
              <span
                className="text-[10px] text-slate-400 cursor-context-menu"
                title="Right-click to copy"
                onContextMenu={e => {
                  e.preventDefault();
                  copyRegNum(getRegulationNumber(doc.id));
                }}
              >
                {getRegulationNumber(doc.id)}
              </span>
              {copiedReg && <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{article!.title}</h2>
            {subject && (
              <p className="text-sm font-medium text-slate-500 mt-1 italic">{subject}</p>
            )}
          </div>
        </div>

        {/* Article body */}
        <div key={articleNumber} className="article-enter px-6 pb-6 pt-4">
          <div className="article-text">
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
                      className={`reference-link ${isActive ? 'reference-link-active' : ''}`}
                      onMouseEnter={e => handleMouseEnterRef(ref, e)}
                      onMouseLeave={handleMouseLeaveRef}
                      onClick={() => handleClickRef(ref)}
                      onDoubleClick={() => handleDoubleClickRef(ref)}
                      title={`${getRefShortName(ref.documentId)}, Article ${ref.articleNumber}. Click to inspect. Double-click to navigate.`}
                    >
                      {seg.text}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              <span className="font-medium">Tip:</span> Click a reference to inspect it in the side panel. Double-click to navigate directly.
            </p>
          </div>
        </div>
      </div>

      {/* Reference popup */}
      {popup && (
        <div
          ref={popupRef}
          className="reference-popup"
          style={{ position: 'fixed', left: popup.x, top: popup.y }}
          onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
          onMouseLeave={handleMouseLeaveRef}
        >
          <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-slate-100">
            <span
              className="text-xs text-blue-600 font-semibold uppercase tracking-wider truncate cursor-context-menu"
              title="Right-click to copy"
              onContextMenu={e => {
                e.preventDefault();
                copyRegNum(getRegulationNumber(doc.id));
              }}
            >{popup.docName}</span>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs font-medium text-slate-700 truncate">{popup.articleTitle}</span>
          </div>
          {popup.subject && (
            <p className="text-xs font-medium text-slate-500 italic mb-1.5 truncate">{popup.subject}</p>
          )}
          <div className="text-sm text-slate-600 leading-relaxed">
            {popup.content}
          </div>
        </div>
      )}
    </div>
  );
}
