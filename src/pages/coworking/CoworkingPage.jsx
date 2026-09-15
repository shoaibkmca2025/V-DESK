import Breadcrumbs from './sections/Breadcrumbs.jsx';
import CoworkingHero from './sections/CoworkingHero.jsx';
import GallerySection from './sections/GallerySection.jsx';
import ServicesSection from './sections/ServicesSection.jsx';
import AmenitiesSection from './sections/AmenitiesSection.jsx';
import LocationSection from './sections/LocationSection.jsx';
import MarketplaceSection from './sections/MarketplaceSection.jsx';
import TeamSavingsCalculator from './sections/TeamSavingsCalculator.jsx';
import NetworkSection from './sections/NetworkSection.jsx';
import FaqSection from './sections/FaqSection.jsx';
import BottomCtaStrip from './sections/BottomCtaStrip.jsx';

/** Coworking spaces, hot desks & private executive cabins. */
export default function CoworkingPage() {
  return (
    <main id="main-content">
      <Breadcrumbs />
      <CoworkingHero />
      <GallerySection />
      <ServicesSection />
      <AmenitiesSection />
      <LocationSection />
      <MarketplaceSection />
      <TeamSavingsCalculator />
      <NetworkSection />
      <FaqSection />
      <BottomCtaStrip />
    </main>
  );
}
