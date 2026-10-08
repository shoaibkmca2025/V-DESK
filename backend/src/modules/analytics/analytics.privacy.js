/**
 * Makes client event payloads safe to store (rules.md §21): drops PII keys, masks emails and phone numbers
 * typed into free text (a search box gets both), and bounds size and depth. Pure functions, unit-tested.
 */
import { MAX_ARRAY_ITEMS, MAX_DATA_BYTES, MAX_DEPTH, MAX_STRING_LENGTH, PII_KEYS } from './analytics.constants.js';

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
// 10+ digits, allowing spaces/dashes between them: Indian mobiles with or without +91, Aadhaar, account numbers.
const LONG_NUMBER = /\+?\d(?:[\s-]?\d){9,}/g;
const PAN = /\b[A-Z]{5}\d{4}[A-Z]\b/gi;

const piiKeys = new Set(PII_KEYS);

export function maskText(text) {
  // Mask before the final cut, so truncation can't leave the first nine digits of a phone number behind.
  return text
    .slice(0, MAX_STRING_LENGTH * 4)
    .replace(EMAIL, '[email]')
    .replace(LONG_NUMBER, '[number]')
    .replace(PAN, '[pan]')
    .slice(0, MAX_STRING_LENGTH);
}

function clean(value, depth) {
  if (typeof value === 'string') return maskText(value);
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean' || value === null) return value;
  if (depth >= MAX_DEPTH) return undefined;
  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => clean(item, depth + 1))
      .filter((item) => item !== undefined);
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      // `$`/`.` keys can't be stored safely in MongoDB; PII keys must not be stored at all.
      if (piiKeys.has(key.toLowerCase()) || key.startsWith('$') || key.includes('.')) continue;
      const cleaned = clean(item, depth + 1);
      if (cleaned !== undefined) out[key.slice(0, 64)] = cleaned;
    }
    return out;
  }
  return undefined; // functions, symbols, bigint — not JSON anyway
}

/** @returns {object} a payload that is PII-free, at most MAX_DEPTH deep and MAX_DATA_BYTES when serialised. */
export function sanitizeEventData(data) {
  const cleaned = clean(data ?? {}, 0);
  const object = cleaned && typeof cleaned === 'object' && !Array.isArray(cleaned) ? cleaned : {};
  return Buffer.byteLength(JSON.stringify(object)) > MAX_DATA_BYTES ? { truncated: true } : object;
}
