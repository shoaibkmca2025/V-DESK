import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import LocationsFeature from '@/components/page/LocationsFeature.jsx';
import { LOCATIONS } from '@/data/locations.js';

const delhi = LOCATIONS.filter((c) => c.city === 'Delhi');
const render = (centres, city = 'Delhi') =>
  renderToStaticMarkup(
    <MemoryRouter>
      <LocationsFeature city={city} centres={centres} />
    </MemoryRouter>,
  );

describe('landing-page locations layout', () => {
  it('features one centre with its plans beside it', () => {
    const html = render(delhi);

    expect(html).toContain('Asaf Ali Road');
    expect(html).toContain('A prestigious business address in the heart of Delhi');
    expect(html).toContain('Available plans at Central Delhi');
    expect(html).toContain('₹12,999');
    expect(html).toContain('₹36,000');
  });

  it('tabs by zone', () => {
    const html = render(delhi);

    expect(html).toContain('Central Delhi');
    expect(html).toContain('South Delhi');
  });

  it('offers the rest of the city to explore, from outside the open zone', () => {
    const html = render(delhi);

    // Asaf Ali Road is Central Delhi; these two are South Delhi and must still appear.
    expect(html).toContain('Saket District Centre');
    expect(html).toContain('Saket');
    expect(html).toContain('View all locations');
  });

  it('renders nothing rather than breaking when a city has no centres', () => {
    expect(render([], 'Nowhere')).toBe('');
  });
});
