export interface RawReference {
  articleNumber: string;
  paragraph?: string;
  documentId: string | null;
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface Reference {
  documentId: string;
  articleNumber: string;
  paragraph?: string;
  displayText: string;
}
