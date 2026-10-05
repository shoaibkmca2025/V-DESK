import { describe, expect, it, vi } from 'vitest';
import { beginPageScope, endPageScope, listen, onPageExit, scopedObserver } from '@/lib/pageScope.js';

describe('pageScope', () => {
  it('removes listeners, runs cleanups and disconnects observers on exit', () => {
    const scope = beginPageScope();
    const handler = vi.fn();
    listen(window, 'resize', handler);
    const cleanup = vi.fn();
    onPageExit(cleanup);
    const observer = { disconnect: vi.fn() };
    scopedObserver(observer);

    window.dispatchEvent(new Event('resize'));
    expect(handler).toHaveBeenCalledTimes(1);

    endPageScope(scope);
    window.dispatchEvent(new Event('resize'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalled();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});
