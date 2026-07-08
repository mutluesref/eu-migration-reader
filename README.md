# EU Migration & Asylum Reader

An interactive reader for the 9 regulations of the EU Pact on Migration and Asylum, with cross-referencing, search, bookmarks, annotations, and side-by-side comparison.

## Quick Start

```bash
npm install
npm run dev       # Start development server
npm run build     # Production build
npm test          # Run tests
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```

## Deployment

Deployment is **manual only**. The project uses GitHub Actions (`.github/workflows/deploy.yml`) which deploys on push to `main`. To deploy:

```bash
git push origin main
```

The action builds and deploys to GitHub Pages.

## Project Structure

```
src/
  App.tsx                    — Main application shell (thin, composes views)
  main.tsx                   — Entry point
  store.ts                   — Zustand state (persisted to localStorage)

  components/
    Header.tsx               — Navigation bar
    Footer.tsx               — Status bar with keyboard shortcuts info
    Sidebar.tsx              — Document/article list sidebar
    SidebarPanel.tsx         — Sidebar wrapper with resize handle + mobile backdrop
    ArticleViewer.tsx        — Article content with reference links
    RecitalView.tsx          — Recitals display
    ReaderPane.tsx           — Article viewer scroll container + scroll-to-top
    ComparePane.tsx          — Side-by-side comparison view
    InspectorPanel.tsx       — Reference inspector wrapper (mobile backdrop + panel)
    ReferenceInspector.tsx   — Reference inspector content (article + reverse refs)
    ExternalReferencePanel.tsx — External document reference display
    ReferencePopup.tsx       — Hover/click popup for reference preview
    SearchPanel.tsx          — Full-text search with filters
    ProgressBar.tsx          — Reading progress indicator
    Onboarding.tsx           — First-time tutorial overlay
    ShortcutsHelp.tsx        — Keyboard shortcuts help modal
    Toast.tsx                — Notification toast
    SkeletonLoader.tsx       — Loading skeleton placeholder
    ErrorBoundary.tsx        — React error boundary with retry
    ArticleHeader.tsx        — Article header with copy/metadata

  services/
    documentLoader.ts        — Document loading service (supports lazy loading)
    searchService.ts         — Search service (articles + recitals)
    references/
      index.ts               — Reference detection re-exports
      types.ts               — Reference type definitions
      externalReferenceMap.ts— CELEX-to-doc mapping + keyword registry
      referenceResolver.ts   — CELEX URL builder + doc ID lookup

  hooks/
    useDocumentLoader.ts     — Document loading orchestration
    useArticleNavigation.ts  — Prev/next article navigation
    useScrollProgress.ts     — Scroll tracking + progress bar
    useKeyboardShortcuts.ts  — Global keyboard shortcuts
    useTheme.ts              — Dark/light/system theme
    useBookmarks.ts          — Bookmark state
    useAnnotations.ts        — Personal notes state
    useOnboarding.ts         — Tutorial state

  utils/
    referenceDetection.ts    — Core reference parsing engine
    reverseReferences.ts     — Reverse index builder for "referenced by"
    text.ts                  — Shared text utilities
    clipboard.ts             — Clipboard API wrapper with fallback
    search.ts                — (moved to services/searchService.ts)

  data/
    index.json               — Document metadata index
    *.json                   — Per-document regulation data

  constants/
    docColors.ts             — Document color mappings

  types.ts                   — Shared TypeScript interfaces

  __tests__/
    search.test.ts           — Search service tests
    referenceDetection.test.ts — Reference parsing tests
    documents.test.ts        — Document data tests
    documentLoader.test.ts   — Document loader service tests
    clipboard.test.ts        — Clipboard utility tests
```

## Document Loading

Documents are loaded through `services/documentLoader.ts`. Currently all 9 regulation JSON files are eagerly imported at build time (they are static data). The service provides an interface that supports future lazy loading:

- `getDocument(id)` — Get a single document
- `getAllDocuments()` — Get all documents
- `getDocumentIndex()` — Get metadata index only
- `isDocumentLoaded(id)` — Check if loaded
- `registerDocument(id, data)` — Register a dynamically loaded document

## Reference Engine

The reference detection system is in `utils/referenceDetection.ts` and is the main parsing engine. It detects:

- Article references: `Article 5`, `Articles 3, 5, 11`, `Article 18(2)`, `Article 18(3)(b)`
- CELEX references: `Regulation (EU) 2024/1351`, `(EU) 2024/1349`
- Regulation keywords: `Asylum Procedure Regulation`, `GDPR`
- Directive references: `Directive 2013/32/EU`
- Point references: `point (a) of Article 5`

The reverse reference system (`utils/reverseReferences.ts`) builds a map of "what references what" at load time, enabling the "Referenced by" section in the inspector.

The `services/references/` module provides the modular structure for future reference types:
- `services/references/types.ts` — Shared types
- `services/references/externalReferenceMap.ts` — CELEX/doc/keyword mappings
- `services/references/referenceResolver.ts` — URL building and ID resolution

Future reference types (CJEU cases, EUAA refs, UNHCR refs, Annex/Chapter refs) can be added by extending the parser with new patterns.

## Search Service

The search service (`services/searchService.ts`) supports:
- Full-text search across articles and recitals
- Article-number search (higher ranking)
- Title/subject/body ranking
- Filter by document
- Filter by content type (articles, recitals, both)

## State Management

Zustand with `persist` middleware stores:
- Current document/article
- Bookmarks
- Annotations (personal notes)
- Theme preference
- Font size
- Sidebar width
- Recent articles history

The store is in `store.ts`. Annotations are stored with `{ docId, articleNumber, text, timestamp }` and can be removed with `removeAnnotation(docId, articleNumber)` which properly deletes the key rather than storing an empty value.

## Testing

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
```

Tests are in `src/__tests__/` and cover:
- Search service ranking and filtering
- Reference detection patterns
- Document data integrity
- Document loader service
- Clipboard utility

## Extending for Future Tools

The architecture is designed to support:

- **EU Pact Legal Change Comparator**: The compare pane (`ComparePane.tsx`) provides a foundation; the reference engine can detect version changes.
- **Pact Commentary Analyzer**: The annotation system and reference inspector can be extended to load commentary data.
- **Legal reference popups**: The popup system (`ReferencePopup.tsx`) can be extended with server-fetched reference data.
- **Offline article comparison**: Document data is bundled; service worker support can be added for full offline use.
- **Cross-document analysis**: The reverse reference index and search service provide infrastructure for cross-document queries.

## Notes

- The project is a static site (no server required)
- All EU regulation data is included in the source as JSON
- The build produces a single-page application deployable to any static host
- Only manual Git operations should deploy — no automated deployment
