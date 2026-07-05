import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

const DOCUMENTS = [
  { id: 'ammr', shortName: 'Asylum and Migration Management Regulation', celex: '32024R1351', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1351' },
  { id: 'apr', shortName: 'Asylum Procedure Regulation', celex: '32024R1348', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AL_202401348' },
  { id: 'rbpr', shortName: 'Return Border Procedure Regulation', celex: '32024R1349', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AL_202401349' },
  { id: 'cfmr', shortName: 'Crisis and Force Majeure Regulation', celex: '32024R1359', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AL_202401359' },
  { id: 'eurodac', shortName: 'Eurodac Regulation', celex: '32024R1358', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AL_202401358' },
  { id: 'sr', shortName: 'Screening Regulation', celex: '32024R1356', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AL_202401356' },
  { id: 'qr', shortName: 'Qualification Regulation', celex: '32024R1347', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AL_202401347' },
  { id: 'rcd', shortName: 'Reception Conditions Directive', celex: '32024L1346', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AL_202401346' },
  { id: 'urfa', shortName: 'Union Resettlement Framework', celex: '32024R1350', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1350' },
];

function mergeListTables(html) {
  return html.replace(/<table[^>]*>[\s\S]*?<\/table>/gi, (table) => {
    const firstRow = table.match(/<tr[\s\S]*?<\/tr>/i)?.[0] || '';
    const colCount = (firstRow.match(/<td/gi) || []).length;
    if (colCount !== 2) return table;
    return table.replace(/<tr[\s\S]*?<\/tr>/gi, (row) => {
      const m = row.match(
        /<td[^>]*>\s*<p[^>]*>\s*(\([^)]+\)|\d+\.)\s*<\/p>\s*<\/td>\s*<td[^>]*>\s*<p[^>]*>\s*([\s\S]*?)\s*<\/p>/i
      );
      if (m) return m[1] + '\t' + m[2].replace(/\s+/g, ' ').trim();
      return row;
    });
  });
}

function mergeOrphanedLabels(text) {
  // After table processing, some labels may still be on their own line
  // (especially from nested tables). Merge them with the following text.
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (/^\([^)]+\)$/.test(trimmed)) {
      let nextIdx = -1;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim().length > 0) { nextIdx = j; break; }
      }
      if (nextIdx !== -1 && /^[a-z'‘"„]/.test(lines[nextIdx].trim())) {
        out.push(trimmed + ' ' + lines[nextIdx].trim());
        i = nextIdx;
        continue;
      }
    }
    out.push(lines[i]);
  }
  return out.join('\n');
}

function extractTextContent(html) {
  // Step 1: inline 2-column list tables into "label\ttext" lines
  let text = mergeListTables(html)
    // Step 2: Remove remaining table markup
    .replace(/<table[^>]*>/gi, '')
    .replace(/<\/table>/gi, '\n')
    .replace(/<tr[^>]*>/gi, '')
    .replace(/<\/tr>/gi, '')
    .replace(/<tbody[^>]*>/gi, '')
    .replace(/<\/tbody>/gi, '')
    .replace(/<col[^>]*>/gi, '');

  // Step 3: Replace block-level end tags with newlines
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    // Step 4: Strip remaining tags
    .replace(/<[^>]+>/g, '')
    // Step 5: Decode entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // Step 6: Replace non-breaking space characters
    .replace(/\u00a0/g, ' ')
    // Step 7: Tab markers → space
    .replace(/\t/g, ' ')
    // Step 8: Collapse horizontal whitespace
    .replace(/[ \t]+/g, ' ')
    // Step 9: Remove space before punctuation
    .replace(/\s+([;,\)])/g, '$1')
    // Step 10: Normalize vertical whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n[ \t]+/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Post-processing: merge orphaned labels with their text
  text = mergeOrphanedLabels(text);

  return text;
}

function extractRegulationText(html) {
  // Locate the English main content
  const mainMatch = html.match(/<div[^>]*id="MainContent"[^>]*>([\s\S]*?)<\/div>\s*<\/main>/i);
  const main = mainMatch ? mainMatch[1] : html;

  // Document title (oj-doc-ti elements)
  const titleMatch = main.match(/(<p class="oj-doc-ti"[^>]*>[\s\S]*?<\/p>\s*<p class="oj-doc-ti"[^>]*>[\s\S]*?<\/p>\s*<p class="oj-doc-ti"[^>]*>[\s\S]*?<\/p>)/);
  const docTitle = titleMatch ? extractTextContent(titleMatch[1]).replace(/\s+/g, ' ').trim() : '';

  // Recitals
  const recitals = [];
  const recitalBlocks = main.matchAll(/<div class="eli-subdivision"[^>]*id="rct_(\d+)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="eli-subdivision"|$)/gi);
  for (const m of recitalBlocks) {
    const text = extractTextContent(m[2]);
    // Extract the recital number and text properly
    const num = parseInt(m[1]);
    const clean = text.replace(/^\(\d+\)\s*/, '').trim();
    if (clean) recitals.push({ number: num, text: clean });
  }

  // Articles: each is in a div.eli-subdivision[id="art_N"]
  const articles = [];
  const articleBlocks = main.matchAll(/<div class="eli-subdivision"[^>]*id="art_(\d+)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="eli-subdivision"|$)/gi);

  for (const m of articleBlocks) {
    const artNum = parseInt(m[1]);
    const artHtml = m[2];

    // Extract article title (oj-ti-art)
    const artTitleMatch = artHtml.match(/<p[^>]*class="oj-ti-art"[^>]*>\s*(Article\s+\d+[A-Z]?)\s*<\/p>/i);
    const artTitle = artTitleMatch ? extractTextContent(artTitleMatch[0]).replace(/\s+/g, ' ').trim() : `Article ${artNum}`;

    // Extract article subject (oj-sti-art)
    const subjectMatch = artHtml.match(/<p[^>]*class="oj-sti-art"[^>]*>([\s\S]*?)<\/p>/i);
    const artSubject = subjectMatch ? extractTextContent(subjectMatch[0]).replace(/\s+/g, ' ').trim() : '';

    // Extract article body text (the rest after stripping title and subject)
    let bodyHtml = artHtml;
    // Remove the title element
    bodyHtml = bodyHtml.replace(/<p[^>]*class="oj-ti-art"[^>]*>[\s\S]*?<\/p>/i, '');
    // Remove the subject element
    bodyHtml = bodyHtml.replace(/<div class="eli-title"[^>]*>[\s\S]*?<\/div>/i, '');

    // Extract paragraphs (p.oj-normal, lists from tables, etc.)
    const bodyText = extractTextContent(bodyHtml);

    // Build content: subject as first line, then rest
    let content = '';
    if (artSubject) {
      content = artSubject + '\n' + bodyText;
    } else {
      content = bodyText;
    }

    articles.push({
      number: artNum,
      title: artTitle,
      subject: artSubject,
      content: content.trim(),
    });
  }

  // Fallback: if articleBlocks found nothing, scan for oj-ti-art tags directly
  if (articles.length === 0) {
    const parts = main.split(/(?=<p[^>]*class="oj-ti-art"[^>]*>)/g);
    for (const part of parts) {
      const titleMatch = part.match(/<p[^>]*class="oj-ti-art"[^>]*>\s*(Article\s+(\d+[A-Z]?))\s*<\/p>/i);
      if (!titleMatch) continue;
      const artNum = titleMatch[2];
      const artTitle = titleMatch[1];

      const subjectMatch = part.match(/<p[^>]*class="oj-sti-art"[^>]*>([\s\S]*?)<\/p>/i);
      const artSubject = subjectMatch ? extractTextContent(subjectMatch[1]).replace(/\s+/g, ' ').trim() : '';

      // Remove the title and subject HTML to get body
      let bodyHtml = part
        .replace(/<p[^>]*class="oj-ti-art"[^>]*>[\s\S]*?<\/p>/, '')
        .replace(/<div class="eli-title"[^>]*>[\s\S]*?<\/div>/i, '');
      const bodyText = extractTextContent(bodyHtml);

      const content = artSubject ? artSubject + '\n' + bodyText : bodyText;

      articles.push({
        number: artNum,
        title: artTitle,
        subject: artSubject,
        content: content.trim(),
      });
    }
  }

  // Sort articles by number
  articles.sort((a, b) => {
    const na = typeof a.number === 'string' ? parseInt(a.number) || 0 : a.number;
    const nb = typeof b.number === 'string' ? parseInt(b.number) || 0 : b.number;
    return na - nb;
  });

  return { title: docTitle, recitals, articles };
}

async function fetchDocument(doc) {
  console.log(`Fetching ${doc.shortName} (${doc.celex})...`);
  const response = await fetch(doc.url);
  const html = await response.text();
  console.log(`  Received ${(html.length / 1024).toFixed(0)}KB`);

  const parsed = extractRegulationText(html);
  console.log(`  Found ${parsed.articles.length} articles, ${parsed.recitals.length} recitals`);

  return parsed;
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  const allDocuments = [];

  for (const doc of DOCUMENTS) {
    try {
      const parsed = await fetchDocument(doc);
      const docData = {
        id: doc.id,
        shortName: doc.shortName,
        celex: doc.celex,
        title: parsed.title,
        recitals: parsed.recitals,
        articles: parsed.articles,
      };
      allDocuments.push(docData);
      const filePath = join(DATA_DIR, `${doc.id}.json`);
      writeFileSync(filePath, JSON.stringify(docData, null, 2));
      console.log(`  Saved to ${filePath}`);
    } catch (err) {
      console.error(`  Error fetching ${doc.id}: ${err.message}`);
      const docData = {
        id: doc.id,
        shortName: doc.shortName,
        celex: doc.celex,
        title: '',
        recitals: [],
        articles: [{ number: 1, title: 'Article 1', subject: '', content: `Content could not be fetched. Error: ${err.message}` }],
        error: err.message,
      };
      allDocuments.push(docData);
      writeFileSync(join(DATA_DIR, `${doc.id}.json`), JSON.stringify(docData, null, 2));
    }
  }

  const indexData = allDocuments.map(d => ({
    id: d.id,
    shortName: d.shortName,
    celex: d.celex,
    title: d.title,
    articleCount: d.articles.length,
    hasError: !!d.error,
  }));
  writeFileSync(join(DATA_DIR, 'index.json'), JSON.stringify(indexData, null, 2));
  console.log(`\nIndex saved with ${indexData.length} documents.`);
}

main().catch(console.error);
