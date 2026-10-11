/**
 * Notification templates — definition checks and safe rendering (pure, no database).
 * Run: npx vitest run src/modules/notifications/notifications.template.test.js
 */
import { describe, expect, it } from 'vitest';
import { placeholdersIn, renderTemplate, templateProblems } from './notifications.template.js';

const email = {
  channel: 'email',
  subject: 'Thanks, {{ name }}',
  body: 'Hi {{name}}, we received your enquiry about {{service}}.',
  variables: ['name', 'service'],
  transactional: true,
};
const messages = (template) => templateProblems(template).map((p) => p.message);

describe('templateProblems', () => {
  it('accepts a well-formed template and finds its placeholders', () => {
    expect(templateProblems(email)).toEqual([]);
    expect([...placeholdersIn(email.body)]).toEqual(['name', 'service']);
  });

  it('needs a subject on email only, and transactional SMS', () => {
    expect(messages({ ...email, subject: null })).toContain('Email templates need a subject');
    expect(messages({ ...email, channel: 'whatsapp' })).toContain('Only email templates have a subject');
    expect(messages({ ...email, channel: 'sms', subject: null, transactional: false })).toContain(
      'SMS templates must be transactional',
    );
    expect(templateProblems({ ...email, channel: 'sms', subject: null })).toEqual([]);
  });

  it('requires placeholders and declared variables to match exactly', () => {
    expect(messages({ ...email, variables: ['name'] })).toContain('Placeholder {{service}} is not declared');
    expect(messages({ ...email, variables: ['name', 'service', 'city'] })).toContain("Variable 'city' is never used");
    expect(messages({ ...email, variables: ['name', 'name', 'service'] })).toContain('Variables must be unique');
  });

  it('rejects malformed placeholders', () => {
    for (const body of ['Hi {{name', 'Hi {{ 1st }}', 'Hi {{na me}}', 'Hi {{}}']) {
      expect(messages({ ...email, body: `${body} {{name}} {{service}}` })).toContain(
        'Malformed placeholder — use {{ name }}',
      );
    }
  });
});

describe('renderTemplate', () => {
  it('fills placeholders with text and numbers', () => {
    expect(renderTemplate(email, { name: 'Priya', service: 'Virtual Office' })).toEqual({
      subject: 'Thanks, Priya',
      body: 'Hi Priya, we received your enquiry about Virtual Office.',
    });
    const sms = { channel: 'sms', subject: null, body: 'Room for {{n}} people', variables: ['n'] };
    expect(renderTemplate(sms, { n: 8 })).toEqual({ subject: null, body: 'Room for 8 people' });
  });

  it('inserts values literally — a value is never expanded as a placeholder', () => {
    const out = renderTemplate(email, { name: '{{service}}', service: '{{name}}' });
    expect(out.body).toBe('Hi {{service}}, we received your enquiry about {{name}}.');
  });

  it('turns control characters and newlines in values into spaces', () => {
    const out = renderTemplate(email, { name: 'Priya\r\nBcc: x@evil.test', service: 'VO\u0000' });
    expect(out.subject).toBe('Thanks, Priya  Bcc: x@evil.test');
    for (const ch of ['\r', '\n', '\u0000']) expect(out.body).not.toContain(ch);
  });

  it('refuses missing, unknown, empty, oversized and non-text values', () => {
    const fails = (values) => {
      try {
        renderTemplate(email, values);
      } catch (err) {
        return err;
      }
      return null;
    };
    for (const values of [
      { name: 'Priya' },
      { name: 'Priya', service: 'VO', extra: 'x' },
      { name: '   ', service: 'VO' },
      { name: 'x'.repeat(501), service: 'VO' },
      { name: { toString: () => 'Priya' }, service: 'VO' },
      { name: ['Priya'], service: 'VO' },
      { name: Number.NaN, service: 'VO' },
    ]) {
      expect(fails(values)).toMatchObject({ status: 400, code: 'INVALID_TEMPLATE_VARIABLES' });
    }
  });
});
