import { useEffect, useState } from 'react';
import { bundledCatalog, loadCatalog } from '@/features/catalog/catalogApi.js';

/**
 * The catalog for React pages: the bundled data immediately, replaced by the live catalog when the
 * API answers. `source` tells the page which it is showing — there is no loading state to handle,
 * because there is always something real to render.
 */
export function useCatalog() {
  const [state, setState] = useState(() => bundledCatalog());

  useEffect(() => {
    let active = true;
    loadCatalog().then((live) => {
      if (active) setState(live);
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
