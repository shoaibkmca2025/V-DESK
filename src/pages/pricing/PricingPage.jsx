import PricingHero from './sections/PricingHero.jsx';
import PlansMatrixSection from './sections/PlansMatrixSection.jsx';
import SavingsComparisonSection from './sections/SavingsComparisonSection.jsx';

/** Plans, pricing matrix & operational savings calculator. */
export default function PricingPage() {
  return (
    <main id="main-content">
      <PricingHero />
      <PlansMatrixSection />
      <SavingsComparisonSection />
    </main>
  );
}
