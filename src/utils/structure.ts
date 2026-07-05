import type { DocumentData, StructureEntry } from '../types';

export function getDocumentStructure(doc: DocumentData): StructureEntry[] {
  const entries: StructureEntry[] = [];
  let seenPart = '';
  let seenChapter = '';
  let seenSection = '';

  for (const article of doc.articles) {
    if (article.part && article.part !== seenPart) {
      seenPart = article.part;
      seenChapter = '';
      seenSection = '';
      const [num, ...titleParts] = article.part.split(': ');
      entries.push({
        type: 'part',
        label: titleParts.join(': ') || num,
        num,
        firstArticle: String(article.number),
      });
    }
    if (article.chapter && article.chapter !== seenChapter) {
      seenChapter = article.chapter;
      seenSection = '';
      const [num, ...titleParts] = article.chapter.split(': ');
      entries.push({
        type: 'chapter',
        label: titleParts.join(': ') || num,
        num,
        firstArticle: String(article.number),
      });
    }
    if (article.section && article.section !== seenSection) {
      seenSection = article.section;
      const [num, ...titleParts] = article.section.split(': ');
      entries.push({
        type: 'section',
        label: titleParts.join(': ') || num,
        num,
        firstArticle: String(article.number),
      });
    }
  }

  return entries;
}
