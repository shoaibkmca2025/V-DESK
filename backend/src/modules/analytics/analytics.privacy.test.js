/**
 * Analytics — unit tests for payload sanitising (no database).
 * Run: npx vitest run src/modules/analytics/analytics.privacy.test.js
 */
import { describe, expect, it } from 'vitest';
import { maskText, sanitizeEventData } from './analytics.privacy.js';

describe('analytics privacy', () => {
  it('drops PII keys at any level, whatever their case', () => {
    const data = sanitizeEventData({
      docType: 'PAN Card',
      fileName: 'rahul-sharma-pan.pdf',
      filters: { city: 'Mumbai', Email: 'x@y.com', nested: { mobile: '9876543210', ok: 1 } },
    });
    expect(data).toEqual({ docType: 'PAN Card', filters: { city: 'Mumbai', nested: { ok: 1 } } });
  });

  it('masks emails, phone numbers and PANs typed into free text', () => {
    expect(maskText('call me on +91 98765 43210 or rahul@acme.in')).toBe('call me on [number] or [email]');
    expect(maskText('my pan is ABCDE1234F')).toBe('my pan is [pan]');
    expect(maskText('virtual office for 10 people')).toBe('virtual office for 10 people');
  });

  it('bounds depth, string length, array length and total size', () => {
    expect(sanitizeEventData({ a: { b: { c: { d: 1 } } } })).toEqual({ a: { b: {} } });
    expect(sanitizeEventData({ q: 'x'.repeat(500) }).q).toHaveLength(200);
    expect(sanitizeEventData({ list: Array.from({ length: 50 }, (_, i) => i) }).list).toHaveLength(20);
    const big = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`k${i}`, 'y'.repeat(150)]));
    expect(sanitizeEventData(big)).toEqual({ truncated: true });
  });

  it('refuses keys MongoDB would treat as operators or paths', () => {
    expect(sanitizeEventData({ $where: 'x', 'a.b': 1, fine: true })).toEqual({ fine: true });
  });

  it('turns missing or non-object data into an empty object', () => {
    expect(sanitizeEventData(undefined)).toEqual({});
    expect(sanitizeEventData({ n: Number.NaN })).toEqual({ n: null });
  });
});
