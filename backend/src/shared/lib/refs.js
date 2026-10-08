import { randomInt } from 'node:crypto';

/**
 * Human refs (rules.md §15): PREFIX- + base-36 time + random characters, upper-case, e.g. USR-MU8Q2K1Z4F7Q.
 * The time part keeps refs roughly sortable; the random part makes two refs from the same millisecond differ
 * and — with `randomChars` ≥ 8 — makes refs that appear in shareable URLs impractical to guess.
 */
export function generateRef(prefix, randomChars = 4) {
  const suffix = Array.from({ length: randomChars }, () => randomInt(36).toString(36)).join('');
  return `${prefix}-${Date.now().toString(36)}${suffix}`.toUpperCase();
}
