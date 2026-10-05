import { useLayoutEffect } from 'react';
import { PAGES } from '@/config/pages.js';

function setMeta(name, content) {
  const meta = document.head.querySelector(`meta[name="${name}"]`);
  if (meta && content) meta.setAttribute('content', content);
}

/** Applies the page title, description and the per-page <html>/<body> classes. `meta` overrides title/description for dynamic pages. */
export function usePageDocument(pageKey, meta) {
  const title = meta?.title;
  const description = meta?.description;
  useLayoutEffect(() => {
    const page = PAGES[pageKey];
    document.title = title || page.title;
    setMeta('description', description || page.description);
    document.documentElement.className = page.htmlClass;
    document.body.className = page.bodyClass;
    document.body.style.overflow = '';
  }, [pageKey, title, description]);
}
