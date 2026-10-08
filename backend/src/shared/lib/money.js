/**
 * Money helpers (rules.md §13, ADR-004). Amounts are integer paise; percentages are integer basis points
 * (1800 bps = 18 %).
 *
 * Percentages of paise produce fractions of a paisa, and rounding them early drifts totals (decision 2026-10-08,
 * docs/backend/memory.md). So intermediate amounts are kept as exact BigInt "sub-paise" values and rounded once,
 * at the final total. SUB_PAISE = 10^12 keeps up to three successive basis-point applications exact.
 */

export const BPS_DENOMINATOR = 10_000;
const SUB_PAISE = 10n ** 12n;

/** True for a safe integer amount in paise. */
export function isPaise(value) {
  return Number.isSafeInteger(value);
}

/** Throws a TypeError unless `value` is an integer paise amount — catches rupee floats leaking in. */
export function assertPaise(value, name = 'amount') {
  if (!isPaise(value)) throw new TypeError(`${name} must be an integer number of paise, got ${value}`);
  return value;
}

/** Rupees (as the client sends them) → integer paise. */
export function rupeesToPaise(rupees) {
  if (!Number.isFinite(rupees)) throw new TypeError(`rupees must be a finite number, got ${rupees}`);
  return Math.round(rupees * 100);
}

/** Integer paise → exact sub-paise value for intermediate arithmetic. */
export function toExact(paise) {
  return BigInt(assertPaise(paise)) * SUB_PAISE;
}

/** `bps` basis points of an exact amount, still exact (no rounding). */
export function exactBps(exactAmount, bps) {
  return (exactAmount * BigInt(bps)) / BigInt(BPS_DENOMINATOR);
}

/** Rounds an exact amount to integer paise, half away from zero. The only place rounding happens. */
export function roundToPaise(exactAmount) {
  const negative = exactAmount < 0n;
  const magnitude = negative ? -exactAmount : exactAmount;
  let paise = magnitude / SUB_PAISE;
  if ((magnitude % SUB_PAISE) * 2n >= SUB_PAISE) paise += 1n;
  const result = Number(negative ? -paise : paise);
  return assertPaise(result, 'rounded amount');
}

/** Splits paise into two integer halves that always add back up (CGST gets the extra paisa when odd). */
export function splitInHalf(paise) {
  assertPaise(paise);
  const first = Math.ceil(paise / 2);
  return [first, paise - first];
}
