/**
 * Notification templates — pure checks and rendering, no database.
 *
 * Templates are plain text on every channel (no HTML), so a variable can never inject markup. A template declares
 * its variables; the placeholders in its subject and body must be exactly those. Rendering is one pass over the
 * stored template, so a value that itself contains `{{ … }}` is inserted literally, never expanded. Values must be
 * strings or numbers, are length-capped, and have control characters (newlines included) replaced by spaces, so a
 * value can't add lines to an SMS or a subject.
 */
import { badRequest } from '../../shared/errors/AppError.js';
import { MAX_VARIABLE_LENGTH, PLACEHOLDER_PATTERN } from './notifications.constants.js';

/** The placeholder names used in a piece of text. */
export function placeholdersIn(text) {
  return new Set([...(text ?? '').matchAll(PLACEHOLDER_PATTERN)].map((match) => match[1]));
}

/**
 * Problems with a template definition, as validation `details` (empty when it is fine).
 * @param {{ channel, subject?, body, variables, transactional }} template
 */
export function templateProblems({ channel, subject, body, variables, transactional }) {
  const problems = [];
  const problem = (path, message) => problems.push({ in: 'body', path, message });

  if (channel === 'email' && !subject) problem('subject', 'Email templates need a subject');
  if (channel !== 'email' && subject) problem('subject', 'Only email templates have a subject');
  // SMS is for transactional messages only (modules.md §3.10, PRD §50).
  if (channel === 'sms' && !transactional) problem('transactional', 'SMS templates must be transactional');

  const declared = new Set(variables);
  if (declared.size !== variables.length) problem('variables', 'Variables must be unique');
  const used = new Set([...placeholdersIn(subject), ...placeholdersIn(body)]);
  for (const name of used) if (!declared.has(name)) problem('variables', `Placeholder {{${name}}} is not declared`);
  for (const name of declared) if (!used.has(name)) problem('variables', `Variable '${name}' is never used`);
  // Anything that looks like a placeholder but isn't a valid one is almost certainly a typo.
  const stray = /\{\{(?!\s*[A-Za-z][A-Za-z0-9_]*\s*\}\})/;
  if (stray.test(subject ?? '') || stray.test(body)) problem('body', 'Malformed placeholder — use {{ name }}');
  return problems;
}

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

/** Checks `values` against the template's declared variables and returns them as safe strings. */
function safeValues(template, values) {
  const details = [];
  const declared = new Set(template.variables);
  for (const name of Object.keys(values)) {
    if (!declared.has(name)) details.push({ path: `variables.${name}`, message: 'Not a variable of this template' });
  }
  const safe = {};
  for (const name of template.variables) {
    const value = values[name];
    if (typeof value !== 'string' && !(typeof value === 'number' && Number.isFinite(value))) {
      details.push({ path: `variables.${name}`, message: 'Required (text or number)' });
      continue;
    }
    const text = String(value).replace(CONTROL_CHARS, ' ').trim();
    if (text.length === 0 || text.length > MAX_VARIABLE_LENGTH) {
      details.push({ path: `variables.${name}`, message: `Must be 1–${MAX_VARIABLE_LENGTH} characters` });
      continue;
    }
    safe[name] = text;
  }
  if (details.length > 0)
    throw badRequest('INVALID_TEMPLATE_VARIABLES', 'Template variables are missing or invalid', details);
  return safe;
}

/** Renders `{ subject, body }` from a stored template and caller values (single pass, values inserted literally). */
export function renderTemplate(template, values = {}) {
  const safe = safeValues(template, values);
  const fill = (text) => text.replace(PLACEHOLDER_PATTERN, (_, name) => safe[name]);
  return { subject: template.subject ? fill(template.subject) : null, body: fill(template.body) };
}
