import { useEffect } from 'react';
import { initPageRuntime } from '@/features/pageRuntime.js';
import { beginPageScope, endPageScope } from '@/lib/pageScope.js';

/** Wires the interactive behaviour of the rendered page and tears it down on navigation. */
export function usePageRuntime(pageKey) {
  useEffect(() => {
    const scope = beginPageScope();
    initPageRuntime();
    return () => endPageScope(scope);
  }, [pageKey]);
}
