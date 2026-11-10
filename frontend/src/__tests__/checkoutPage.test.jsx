import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import CheckoutPage from '@/pages/account/CheckoutPage.jsx';

/*
 * The checkout used to bill a hardcoded ₹21,499 for any link that carried no amount. These render the
 * real page both ways: a link with a price must offer to take it, a link without one must offer nothing.
 */
const at = (search) => renderToStaticMarkup(
  <MemoryRouter initialEntries={[`/checkout${search}`]}>
    <CheckoutPage />
  </MemoryRouter>,
);

describe('checkout page', () => {
  it('shows the amount the link carries', () => {
    const html = at('?item=Virtual%20Office&amount=21499&city=Mumbai');
    expect(html).toContain('21,499');
    expect(html).toContain('Virtual Office');
  });

  it('offers no price, and no way to pay, when the link carries none', () => {
    const html = at('');
    expect(html).toContain('Pick a plan to continue');
    expect(html).toContain('/pricing');
    // The old invented default must not come back, by any route.
    expect(html).not.toContain('21,499');
    expect(html).not.toMatch(/Pay .*Securely/);
  });

  it('treats a junk amount as no amount', () => {
    expect(at('?amount=abc')).toContain('Pick a plan to continue');
    expect(at('?amount=-500')).toContain('Pick a plan to continue');
  });
});
