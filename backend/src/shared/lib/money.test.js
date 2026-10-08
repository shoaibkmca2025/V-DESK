/**
 * Money helpers — unit tests (rules.md §13, ADR-007: exact intermediates, one rounding at the final total).
 * Run: npm test  (or: npx vitest run src/shared/lib/money.test.js)
 */
import { describe, expect, it } from 'vitest';
import {
  assertPaise,
  BPS_DENOMINATOR,
  exactBps,
  isPaise,
  roundToPaise,
  rupeesToPaise,
  splitInHalf,
  toExact,
} from './money.js';

describe('isPaise / assertPaise', () => {
  it('accepts safe integers, including zero and negatives', () => {
    expect(isPaise(0)).toBe(true);
    expect(isPaise(124900)).toBe(true);
    expect(isPaise(-500)).toBe(true);
    expect(assertPaise(124900)).toBe(124900);
  });

  it('rejects rupee floats, non-numbers and unsafe integers', () => {
    for (const value of [12.5, NaN, Infinity, '100', null, undefined, Number.MAX_SAFE_INTEGER + 1]) {
      expect(isPaise(value)).toBe(false);
    }
    expect(() => assertPaise(1249.5, 'basePrice')).toThrow(TypeError);
    expect(() => assertPaise(1249.5, 'basePrice')).toThrow(/basePrice must be an integer number of paise/);
  });
});

describe('rupeesToPaise', () => {
  it('converts whole and fractional rupees', () => {
    expect(rupeesToPaise(1249)).toBe(124900);
    expect(rupeesToPaise(0.1 + 0.2)).toBe(30); // float noise is absorbed by the single Math.round
    expect(rupeesToPaise(21500.54)).toBe(2150054);
  });

  it('refuses non-finite input', () => {
    expect(() => rupeesToPaise(NaN)).toThrow(TypeError);
    expect(() => rupeesToPaise(Infinity)).toThrow(TypeError);
  });
});

describe('toExact / exactBps / roundToPaise', () => {
  it('round-trips whole paise without change', () => {
    expect(roundToPaise(toExact(0))).toBe(0);
    expect(roundToPaise(toExact(2277600))).toBe(2277600);
    expect(roundToPaise(toExact(-2277600))).toBe(-2277600);
  });

  it('keeps sub-paisa fractions instead of rounding them', () => {
    // 18 % of 1 paisa is 0.18 paise: rounding early would lose it entirely.
    const gst = exactBps(toExact(1), 1800);
    expect(gst).toBe((toExact(1) * 18n) / 100n);
    expect(roundToPaise(gst)).toBe(0);
    // ...but a hundred of them add up to 18 paise when rounded once at the end.
    expect(roundToPaise(gst * 100n)).toBe(18);
  });

  it('stays exact over three successive basis-point applications', () => {
    // 1 paisa × 12.34 % × 56.78 % × 99.99 % has 12 decimal places — still representable.
    const exact = exactBps(exactBps(exactBps(toExact(1), 1234), 5678), 9999);
    expect(exact * BigInt(BPS_DENOMINATOR) ** 3n).toBe(toExact(1) * 1234n * 5678n * 9999n);
  });

  it('rounds half away from zero', () => {
    const half = toExact(1) / 2n;
    expect(roundToPaise(toExact(10) + half)).toBe(11);
    expect(roundToPaise(toExact(10) + half - 1n)).toBe(10);
    expect(roundToPaise(-(toExact(10) + half))).toBe(-11);
    expect(roundToPaise(-(toExact(10) + half - 1n))).toBe(-10);
  });

  it('reproduces the ADR-007 example: Nashik annual VO + GST + mail = ₹21,500.54', () => {
    const subtotal = toExact((124900 + 0 + 35000 + 29900) * 12);
    const discounted = subtotal - exactBps(subtotal, 2000);
    expect(roundToPaise(discounted + exactBps(discounted, 1800))).toBe(2150054);
  });

  it('refuses rupee floats at the boundary', () => {
    expect(() => toExact(12.5)).toThrow(TypeError);
  });
});

describe('splitInHalf', () => {
  it('splits even amounts equally', () => {
    expect(splitInHalf(327974)).toEqual([163987, 163987]);
    expect(splitInHalf(0)).toEqual([0, 0]);
  });

  it('gives the odd paisa to the first half and always adds back up', () => {
    expect(splitInHalf(327975)).toEqual([163988, 163987]);
    for (const amount of [1, 3, 99, 100001]) {
      const [a, b] = splitInHalf(amount);
      expect(a + b).toBe(amount);
      expect(a - b).toBeLessThanOrEqual(1);
    }
  });

  it('refuses non-paise input', () => {
    expect(() => splitInHalf(10.5)).toThrow(TypeError);
  });
});
