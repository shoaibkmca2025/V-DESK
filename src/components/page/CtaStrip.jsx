import CtaBand from '@/components/ui/CtaBand.jsx';

/** Closing call-to-action: quote + WhatsApp. */
export default function CtaStrip({ title = 'Ready to set up your business address?', text = 'Talk to a V-DESK advisor or get an exact quote in 15 minutes.', source = 'CTA Strip' }) {
  return (
    <section className="ui-section ui-section--tight">
      <div className="ui-container">
        <CtaBand title={title} text={text} source={source} />
      </div>
    </section>
  );
}
