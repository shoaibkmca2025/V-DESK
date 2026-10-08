import { afterEach, describe, expect, it, vi } from 'vitest';
import { rateLimit } from '../src/shared/middleware/rateLimit.js';

// The limiter is off under NODE_ENV=test so integration tests can post freely; these tests switch it on.
function hit(limiter, ip = '203.0.113.7') {
  const res = { set: vi.fn() };
  const next = vi.fn();
  limiter({ ip }, res, next);
  return { error: next.mock.calls[0][0], res };
}

describe('rateLimit', () => {
  afterEach(() => vi.useRealTimers());

  it('allows `max` requests per window, then answers 429 with Retry-After', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const limiter = rateLimit({ name: 'test', windowMs: 60_000, max: 3, enabled: true });
    for (let i = 0; i < 3; i++) expect(hit(limiter).error).toBeUndefined();

    vi.advanceTimersByTime(20_000);
    const { error, res } = hit(limiter);
    expect(error).toMatchObject({ status: 429, code: 'RATE_LIMITED' });
    expect(res.set).toHaveBeenCalledWith('Retry-After', '40');
  });

  it('starts a fresh window once the old one ends', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const limiter = rateLimit({ name: 'test', windowMs: 60_000, max: 1, enabled: true });
    hit(limiter);
    expect(hit(limiter).error).toBeDefined();
    vi.advanceTimersByTime(60_000);
    expect(hit(limiter).error).toBeUndefined();
  });

  it('counts each IP separately', () => {
    const limiter = rateLimit({ name: 'test', windowMs: 60_000, max: 1, enabled: true });
    hit(limiter, '198.51.100.1');
    expect(hit(limiter, '198.51.100.2').error).toBeUndefined();
    expect(hit(limiter, '198.51.100.1').error).toBeDefined();
  });

  it('does nothing when disabled', () => {
    const limiter = rateLimit({ name: 'test', windowMs: 60_000, max: 1, enabled: false });
    for (let i = 0; i < 5; i++) expect(hit(limiter).error).toBeUndefined();
  });
});
