import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import LocationsPlans from '@/components/page/LocationsPlans.jsx';
import { LOCATIONS } from '@/data/locations.js';

const render = (city, centres) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <LocationsPlans city={city} centres={centres} />
    </MemoryRouter>,
  );

const delhi = LOCATIONS.filter((c) => c.city === 'Delhi');
const mumbai = LOCATIONS.filter((c) => c.city === 'Mumbai');

describe('Our Locations & Plans', () => {
  it('shows every centre in the city with its rate card', () => {
    const html = render('Delhi', delhi);

    expect(html).toContain('Asaf Ali Road');
    expect(html).toContain('Connaught Place');
    expect(html).toContain('₹12,999');
    expect(html).toContain('Premium business addresses at prime locations in Delhi');
  });

  it('offers a tab per zone, plus All Locations', () => {
    const html = render('Delhi', delhi);

    expect(html).toContain('All Locations');
    expect(html).toContain('Central Delhi');
    expect(html).toContain('South Delhi');
  });

  it('hides the tab bar where there is nothing to choose between', () => {
    // Mumbai's centres carry no zone, so a tab bar would be one pointless button.
    expect(mumbai.every((c) => !c.zone)).toBe(true);
    expect(render('Mumbai', mumbai)).not.toContain('All Locations');
  });

  it('carries the trust strip and its one call to action', () => {
    const html = render('Delhi', delhi);

    expect(html).toContain('Trusted &amp; Reliable');
    expect(html).toContain('Dedicated Support');
    expect(html).toContain('Contact Us');
  });
});
