import { describe, expect, it } from 'vitest';
import { passwordProblem } from '@/features/auth/staffSession.js';

describe('staff password rule (ADR-012)', () => {
  it('matches the API: 12+ characters with a letter and a number', () => {
    expect(passwordProblem('short 1')).toMatch(/12 characters/);
    expect(passwordProblem('only letters here')).toMatch(/number/);
    expect(passwordProblem('123456789012345')).toMatch(/letter/);
    expect(passwordProblem('x1'.repeat(65))).toMatch(/128/);
    expect(passwordProblem('correct horse battery 42')).toBeNull();
  });
});
