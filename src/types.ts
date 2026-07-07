export interface Article {
  number: number | string;
  title: string;
  subject: string;
  content: string;
  part?: string | null;
  chapter?: string | null;
  section?: string | null;
}

export interface DocumentData {
  id: string;
  shortName: string;
  celex: string;
  title: string;
  recitals: { number: number; text: string }[];
  articles: Article[];
  error?: string;
}

export interface DocumentIndex {
  id: string;
  shortName: string;
  celex: string;
  title: string;
  articleCount: number;
  hasError: boolean;
}

export interface Reference {
  documentId: string;
  articleNumber: string;
  paragraph?: string;
  displayText: string;
}

export interface HistoryEntry {
  documentId: string;
  articleNumber: string;
}


