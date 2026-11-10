/*
 * One-off: drop rules from a stylesheet whose selectors are built only from class names that appear
 * nowhere in the application source.
 *
 * Deliberately timid. A rule is removed only when EVERY selector in its list is made of class
 * selectors, combinators and pseudo-classes alone, and every one of those classes is unused. Anything
 * touching an element name, an id, an attribute, `*`, `:root`, a keyframe or an unknown at-rule is kept,
 * because those can match markup the scan cannot see.
 *
 * Usage: node scripts/prune-css.mjs <file.css> [--write]   (run from frontend/)
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const [cssPath, ...flags] = process.argv.slice(2);
const write = flags.includes('--write');
/* Everything that can put a class into the page: the app source, and the HTML shell Vite builds around it. */
const SOURCES = ['src', 'index.html'];

/** Every word in the app source — class names, but also dynamic prefixes like `card__status--`. */
function sourceTokens(paths) {
  const tokens = new Set();
  const take = (file) => {
    for (const t of readFileSync(file, 'utf8').match(/[a-zA-Z0-9_-]+/g) ?? []) tokens.add(t);
  };
  const walk = (d) => {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      if (entry === 'node_modules' || entry === 'styles') continue;
      if (statSync(full).isDirectory()) walk(full);
      else if (['.js', '.jsx', '.ts', '.tsx', '.html'].includes(extname(entry))) take(full);
    }
  };
  for (const p of paths) {
    if (!existsSync(p)) continue;
    if (statSync(p).isDirectory()) walk(p);
    else take(p);
  }
  return tokens;
}

const tokens = sourceTokens(SOURCES);
const dynamicPrefixes = [...tokens].filter((t) => t.endsWith('-'));
/** Used if the name is in the source, or a dynamic prefix in the source builds it. */
const isUsed = (cls) => tokens.has(cls) || dynamicPrefixes.some((p) => cls.startsWith(p) && cls !== p);

/** Only class selectors, combinators and pseudos — nothing that could match markup by element or id. */
const CLASS_ONLY = /^(?:\s*[>+~]?\s*(?:\.[a-zA-Z][\w-]*|:{1,2}[a-zA-Z-]+(?:\([^)]*\))?)+\s*)+$/;

function classesIn(sel) {
  return (sel.match(/\.([a-zA-Z][\w-]*)/g) ?? []).map((c) => c.slice(1));
}

function selectorIsDead(selectorList) {
  const parts = selectorList.split(',').map((s) => s.trim()).filter(Boolean);
  if (!parts.length) return false;
  return parts.every((sel) => {
    if (!CLASS_ONLY.test(sel)) return false;
    const classes = classesIn(sel);
    return classes.length > 0 && classes.every((c) => !isUsed(c));
  });
}

/** Split a stylesheet into top-level blocks, keeping at-rules whole unless they only wrap rules. */
function splitBlocks(css) {
  const blocks = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        blocks.push(css.slice(start, i + 1));
        start = i + 1;
      }
    }
  }
  if (start < css.length) blocks.push(css.slice(start));
  return blocks;
}

const KEEP_AT = /^\s*@(?:keyframes|font-face|supports|import|charset|property|layer|container)/;

function prune(css, removed) {
  return splitBlocks(css)
    .map((block) => {
      const open = block.indexOf('{');
      if (open === -1) return block;
      const prelude = block.slice(0, open);
      const body = block.slice(open + 1, block.lastIndexOf('}'));

      if (KEEP_AT.test(prelude)) return block;
      if (/^\s*@media/.test(prelude)) {
        const inner = prune(body, removed);
        // A media query left with nothing but whitespace goes too.
        return inner.trim() ? `${prelude}{${inner}}` : '';
      }
      if (/^\s*@/.test(prelude)) return block;

      if (selectorIsDead(prelude)) {
        removed.push(prelude.trim().replace(/\s+/g, ' '));
        return '';
      }
      return block;
    })
    .join('');
}

const before = readFileSync(cssPath, 'utf8');
const removed = [];
const after = prune(before, removed).replace(/\n{3,}/g, '\n\n');

console.log(`${cssPath}`);
console.log(`  ${(before.length / 1024).toFixed(1)} KB -> ${(after.length / 1024).toFixed(1)} KB`);
console.log(`  ${removed.length} rule(s) removed`);
for (const sel of removed.slice(0, 15)) console.log(`    - ${sel}`);
if (removed.length > 15) console.log(`    … and ${removed.length - 15} more`);

if (write) {
  writeFileSync(cssPath, after);
  console.log('  written');
} else {
  console.log('  (dry run)');
}
