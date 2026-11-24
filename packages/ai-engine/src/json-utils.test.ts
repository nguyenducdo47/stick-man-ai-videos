import { describe, expect, it } from 'vitest';

import { extractJsonText } from './json-utils.js';

describe('extractJsonText', () => {
  it('strips Qwen think blocks', () => {
    const raw = 'reasoning here</think>\n{"script":"hello world long enough","synopsis":"x"}';
    expect(extractJsonText(raw)).toBe(
      '{"script":"hello world long enough","synopsis":"x"}',
    );
  });

  it('extracts fenced json', () => {
    const raw = 'Here:\n```json\n{"scenes":[]}\n```';
    expect(extractJsonText(raw)).toBe('{"scenes":[]}');
  });

  it('slices from first brace', () => {
    const raw = 'Output: {"a":1} trailing';
    expect(extractJsonText(raw)).toBe('{"a":1} trailing');
  });
});