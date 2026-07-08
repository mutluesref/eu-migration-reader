import { describe, it, expect, vi } from 'vitest';
import { copyToClipboard } from '../utils/clipboard';

describe('copyToClipboard', () => {
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
});
