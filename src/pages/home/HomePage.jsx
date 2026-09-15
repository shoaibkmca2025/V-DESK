import HeroSection from './sections/HeroSection.jsx';
import TrustStrip from './sections/TrustStrip.jsx';
import PillarsSection from './sections/PillarsSection.jsx';
import ProcessFlowSection from './sections/ProcessFlowSection.jsx';
import JourneySection from './sections/JourneySection.jsx';
import ServicesSection from './sections/ServicesSection.jsx';
import VirtualOfficeConfigurator from '@/components/sections/VirtualOfficeConfigurator.jsx';
import SolutionFinder from '@/components/sections/SolutionFinder.jsx';
import KycDocuments from '@/components/sections/KycDocuments.jsx';
import LocationsSection from './sections/LocationsSection.jsx';
import PlansMatrixSection from './sections/PlansMatrixSection.jsx';
import PricingCalculatorSection from './sections/PricingCalculatorSection.jsx';
import MeetingRoomsSection from './sections/MeetingRoomsSection.jsx';
import GstTrackerSection from './sections/GstTrackerSection.jsx';
import SetupWizardSection from './sections/SetupWizardSection.jsx';
import TrustPillarsSection from './sections/TrustPillarsSection.jsx';
import TestimonialsSection from './sections/TestimonialsSection.jsx';
import KnowledgeSection from './sections/KnowledgeSection.jsx';
import FinalCtaSection from './sections/FinalCtaSection.jsx';
import ContactSection from './sections/ContactSection.jsx';

/** Homepage: universal platform hub (hero, services, configurator, locations, pricing, wizard, testimonials, contact). */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <PillarsSection />
      <ProcessFlowSection />
      <JourneySection />
      <ServicesSection />
      <VirtualOfficeConfigurator />
      <SolutionFinder />
      <KycDocuments />
      <LocationsSection />
      <PlansMatrixSection />
      <PricingCalculatorSection />
      <MeetingRoomsSection />
      <GstTrackerSection />
      <SetupWizardSection />
      <TrustPillarsSection />
      <TestimonialsSection />
      <KnowledgeSection />
      <FinalCtaSection />
      <ContactSection />
    </>
  );
}
