import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import CentreAddressCard, { rowsFor } from '@/components/cards/CentreAddressCard.jsx';
import { LOCATIONS } from '@/data/locations.js';

/*
 * The card is what a city page is now made of, so this renders the real component with real centre data.
 * It catches what the row unit test cannot: a broken link, a heading built from the wrong field, or a
 * price shown for a service the centre does not offer.
 */
const render = (centre) => renderToStaticMarkup(
  <MemoryRouter>
    <CentreAddressCard centre={centre} />
  </MemoryRouter>,
);

// A Mumbai centre that does not sell every plan, so the N/A path is exercised.
const BKC = LOCATIONS.find((c) => c.id === 'MUM-003');
const FLAGSHIP = LOCATIONS.find((c) => c.flagship);

describe('centre address card', () => {
  it('names the locality and the city', () => {
    const html = render(BKC);
    expect(html).toContain(BKC.areaName);
    expect(html).toContain('Mumbai');
  });

  it('sends Book Now to that city, not another', () => {
    expect(render(BKC)).toContain('/locations/mumbai/virtual-office');
  });

  it('shows N/A for a service the centre does not offer', () => {
    // This centre does not offer company registration, so that row has no price to show.
    expect(BKC.services).not.toContain('Company Registration');
    expect(render(BKC)).toContain('N/A');
  });

  it('flags only the centres marked popular', () => {
    expect(render(FLAGSHIP)).toContain('Popular');
    expect(render(BKC)).not.toContain('Popular');
  });

  it('renders every real centre without throwing', () => {
    for (const centre of LOCATIONS) {
      const html = render(centre);
      expect(html).toContain(centre.areaName);
      // A price that failed to resolve would reach the page as "₹undefined" or "₹NaN".
      expect(html).not.toMatch(/₹(undefined|NaN)/);
    }
  });
});

/*
 * Delhi quotes its own yearly rate card rather than the derived monthly prices. These are the figures the
 * client published, so a typo here is a wrong price in front of a customer.
 */
describe('a centre with its own rate card', () => {
  const asafAli = LOCATIONS.find((c) => c.id === 'DEL-001');
  const connaught = LOCATIONS.find((c) => c.id === 'DEL-004');

  it('shows the rate card, per year, not the derived monthly prices', () => {
    const rows = rowsFor(asafAli);

    expect(rows.map(([, label, price, unit]) => [label, price, unit])).toEqual([
      ['Business Registration', '₹12,999', '/year'],
      ['GST Registration', '₹12,999', '/year'],
      ['Mailing Address', '₹9,999', '/year'],
      ['Virtual Desk Plan', '₹36,000', '/year'],
    ]);
  });

  it('shows N/A for a plan the centre does not sell', () => {
    expect(rowsFor(connaught).find(([, label]) => label === 'Virtual Desk Plan')[2]).toBeNull();
  });

  it('badges the zone rather than the city, and uses the centre tagline', () => {
    const html = render(asafAli);

    expect(html).toContain('Central Delhi');
    expect(html).toContain('A prestigious business address in the heart of Delhi');
  });
});
