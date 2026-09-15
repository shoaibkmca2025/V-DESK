import VirtualOfficeHero from './sections/VirtualOfficeHero.jsx';
import NeedsSection from './sections/NeedsSection.jsx';
import GuaranteesSection from './sections/GuaranteesSection.jsx';
import ServicesSection from './sections/ServicesSection.jsx';
import MicroMarketsSection from './sections/MicroMarketsSection.jsx';
import ProcessSection from './sections/ProcessSection.jsx';
import VirtualOfficeConfigurator from '@/components/sections/VirtualOfficeConfigurator.jsx';
import SolutionFinder from '@/components/sections/SolutionFinder.jsx';
import KycDocuments from '@/components/sections/KycDocuments.jsx';
import PlansComparisonSection from './sections/PlansComparisonSection.jsx';
import FaqSection from './sections/FaqSection.jsx';

/** Virtual office for GST registration & company incorporation. */
export default function VirtualOfficePage() {
  return (
    <main id="main-content">
      <VirtualOfficeHero />
      <NeedsSection />
      <GuaranteesSection />
      <ServicesSection />
      <MicroMarketsSection />
      <ProcessSection />
      <VirtualOfficeConfigurator />
      <SolutionFinder />
      <KycDocuments />
      <PlansComparisonSection />
      <FaqSection />
    </main>
  );
}
