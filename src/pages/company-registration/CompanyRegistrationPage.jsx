import CompanyRegistrationHero from './sections/CompanyRegistrationHero.jsx';
import EntityMatrixSection from './sections/EntityMatrixSection.jsx';
import IncorporationWizardSection from './sections/IncorporationWizardSection.jsx';
import IncorporationTimelineSection from './sections/IncorporationTimelineSection.jsx';
import CaConsultationSection from './sections/CaConsultationSection.jsx';

/** Company incorporation (Pvt Ltd, LLP, OPC, Section 8) & MCA compliance. */
export default function CompanyRegistrationPage() {
  return (
    <main id="main-content">
      <CompanyRegistrationHero />
      <EntityMatrixSection />
      <IncorporationWizardSection />
      <IncorporationTimelineSection />
      <CaConsultationSection />
    </main>
  );
}
