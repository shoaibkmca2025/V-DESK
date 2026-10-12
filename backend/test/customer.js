import { unauthorized } from '../src/shared/errors/AppError.js';

/**
 * Test stand-in for identity's customer principal, which fails closed until customer sign-in exists
 * (src/modules/identity/identity.customer.js). The customer id comes from an `x-test-customer` header. Use in a test
 * file (path relative to that file):
 *   vi.mock('../identity/identity.customer.js', () => import('../../../test/customer.js'));
 */
export async function resolveCustomer(req) {
  const id = req.get('x-test-customer');
  if (!id) throw unauthorized('AUTH_REQUIRED', 'Please sign in to continue');
  return { id };
}

export const customer = (id) => ({ 'x-test-customer': id });
