import LocationsHero from './sections/LocationsHero.jsx';
import MetroDirectorySection from './sections/MetroDirectorySection.jsx';
import CentreTourSection from './sections/CentreTourSection.jsx';

/** Pan-India commercial hubs directory. */
export default function LocationsPage() {
  return (
    <main id="main-content">
      <LocationsHero />
      <MetroDirectorySection />
      <CentreTourSection />
    </main>
  );
}
