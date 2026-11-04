import { describe, expect, it } from 'vitest';
import { apiUrlGuard, apiUrlProblem } from '../../scripts/check-api-url.js';

describe('production API address check', () => {
  it('accepts a public https address ending in /api/v1', () => {
    expect(apiUrlProblem('https://vdesk-api.shoaibk-mca2024.workers.dev/api/v1')).toBeNull();
    expect(apiUrlProblem('https://api.vdesk.in/api/v1/')).toBeNull();
  });

  it('rejects what broke the live site on 30 Oct, and its relatives', () => {
    for (const bad of [
      'http://127.0.0.1:5080/api/v1',
      'https://localhost:5000/api/v1',
      'https://192.168.1.20/api/v1',
      'https://10.0.0.5/api/v1',
      'https://my-laptop.local/api/v1',
    ]) {
      expect(apiUrlProblem(bad), bad).not.toBeNull();
    }
  });

  it('rejects a missing, malformed, plain-http or wrong-path address', () => {
    expect(apiUrlProblem('')).toMatch(/not set/);
    expect(apiUrlProblem(undefined)).toMatch(/not set/);
    expect(apiUrlProblem('vdesk-api/api/v1')).toMatch(/not a valid URL/);
    expect(apiUrlProblem('http://api.vdesk.in/api/v1')).toMatch(/https/);
    expect(apiUrlProblem('https://api.vdesk.in')).toMatch(/\/api\/v1/);
  });

  it('only stops production builds', () => {
    const fail = (message) => {
      throw new Error(message);
    };
    expect(() => apiUrlGuard({ mode: 'production', apiUrl: '' }).buildStart.call({ error: fail })).toThrow(/not set/);
    expect(() => apiUrlGuard({ mode: 'development', apiUrl: '' }).buildStart.call({ error: fail })).not.toThrow();
  });
});
