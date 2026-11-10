import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import CentreAddressCard from '@/components/cards/CentreAddressCard.jsx';
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

const BKC = LOCATIONS.find((c) => c.id === 'MUM-002');
const FLAGSHIP = LOCATIONS.find((c) => c.flagship);

describe('centre address card', () => {
  it('names the locality and the city', () => {
    const html = render(BKC);
    expect(html).toContain('BKC Business Address');
    expect(html).toContain('Mumbai');
  });

  it('sends Book Now to that city, not another', () => {
    expect(render(BKC)).toContain('/locations/mumbai/virtual-office');
  });

  it('shows N/A for a service the centre does not offer', () => {
    // BKC has no Coworking, so the desk row has no price to show.
    expect(BKC.services).not.toContain('Coworking');
    expect(render(BKC)).toContain('N/A');
  });

  it('flags only the centres marked popular', () => {
    expect(render(FLAGSHIP)).toContain('Popular Location');
    expect(render(BKC)).not.toContain('Popular Location');
  });

  it('renders every real centre without throwing', () => {
    for (const centre of LOCATIONS) {
      const html = render(centre);
      expect(html).toContain('Business Address');
      // A price that failed to resolve would reach the page as "₹undefined" or "₹NaN".
      expect(html).not.toMatch(/₹(undefined|NaN)/);
    }
  });
});
