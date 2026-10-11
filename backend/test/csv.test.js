import { describe, expect, it } from 'vitest';
import { csvCell, csvRow } from '../src/shared/lib/csv.js';

describe('csv', () => {
  it('quotes commas, quotes and line breaks', () => {
    expect(csvCell('plain')).toBe('plain');
    expect(csvCell('a, b')).toBe('"a, b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('two\nlines')).toBe('"two\nlines"');
  });

  it('neutralises cells a spreadsheet would run as formulas', () => {
    for (const text of ['=1+1', '+91 98765 43210', '-5', '@SUM(A1)', '\tx']) expect(csvCell(text)).toMatch(/^"?'/);
    expect(csvCell('mail me')).toBe('mail me');
  });

  it('writes dates as ISO, numbers as-is, null as empty', () => {
    expect(csvCell(new Date('2026-10-11T05:00:00Z'))).toBe('2026-10-11T05:00:00.000Z');
    expect(csvCell(85)).toBe('85');
    expect(csvCell(-5)).toBe('-5');
    expect(csvCell(null)).toBe('');
    expect(csvRow(['a', null, 'b,c'])).toBe('a,,"b,c"\r\n');
  });
});
