import ContactHero from './sections/ContactHero.jsx';
import ContactDirectorySection from './sections/ContactDirectorySection.jsx';

/** Headquarters, commercial hubs & advisory desk. */
export default function ContactPage() {
  return (
    <main id="main-content">
      <ContactHero />
      <ContactDirectorySection />
    </main>
  );
}
