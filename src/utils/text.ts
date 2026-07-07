export function splitIntoParagraphs(text: string): string[] {
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
