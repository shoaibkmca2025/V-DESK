import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from '@/app/router.jsx';

/*
 * The staff console is not the marketing site. It used to be wrapped in the same frame as the public pages,
 * so someone working leads saw "Co-Working Space", a WhatsApp bubble and a footer of city links — one stray
 * click and they were out of the console and back on the website.
 *
 * These render the real route elements, so switching /admin back to the public frame fails here.
 */
const elementFor = (path) => routes[0].children.find((route) => route.path === path)?.element;

const render = (element) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);

describe('staff console chrome', () => {
  it('shows no marketing navigation, footer or contact widget', () => {
    const html = render(elementFor('admin'));

    expect(html).not.toContain('siteHeader');
    expect(html).not.toContain('Co-Working Space');
    expect(html).not.toContain('List Your Space');
    expect(html).not.toContain('ui-footer');
    expect(html).not.toContain('WhatsApp Us');
  });

  it('still shows them on a public page', () => {
    const html = render(elementFor('pricing'));

    expect(html).toContain('siteHeader');
    expect(html).toContain('Co-Working Space');
  });
});
