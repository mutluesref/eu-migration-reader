import { afterEach, describe, it, expect, vi } from 'vitest';
import { copyToClipboard } from '../utils/clipboard';

describe('copyToClipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when clipboard API fails', async () => {
    const result = await copyToClipboard('test');
    expect(result).toBe(false);
  });

  it('returns true when clipboard API succeeds', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    const result = await copyToClipboard('test');
    expect(result).toBe(true);
  });

  it('returns false when fallback copy command reports failure', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('denied')),
      },
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    const result = await copyToClipboard('test');

    expect(result).toBe(false);
    expect(document.querySelector('textarea')).toBeNull();
  });
});
