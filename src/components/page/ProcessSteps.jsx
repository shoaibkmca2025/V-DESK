import Steps from '@/components/ui/Steps.jsx';

/** Numbered process; `steps` = [[title, text], …]. */
export default function ProcessSteps({ steps }) {
  return <Steps steps={steps.map(([title, text]) => ({ title, text }))} />;
}
