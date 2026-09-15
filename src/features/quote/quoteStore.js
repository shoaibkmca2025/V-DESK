import { readJson, writeJson } from '@/lib/storage.js';

/** Generated quote proposals, so /quote/:ref share links resolve (localStorage until the API exists). */

const KEY = 'VDESK_QUOTES';
const MAX = 50;

export function getQuotes() {
  return readJson(KEY, []);
}

export function getQuote(ref) {
  return getQuotes().find((q) => q.ref === ref) || null;
}

export function saveQuote(quote) {
  const quotes = getQuotes().filter((q) => q.ref !== quote.ref);
  quotes.unshift(quote);
  if (quotes.length > MAX) quotes.length = MAX;
  writeJson(KEY, quotes);
  return quote;
}

export function setQuoteStatus(ref, status) {
  const quote = getQuote(ref);
  if (!quote) return null;
  return saveQuote({ ...quote, status });
}
