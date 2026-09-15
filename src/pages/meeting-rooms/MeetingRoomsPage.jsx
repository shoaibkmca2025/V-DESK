import MeetingRoomsHero from './sections/MeetingRoomsHero.jsx';
import SchedulerSection from './sections/SchedulerSection.jsx';
import RoomShowcaseSection from './sections/RoomShowcaseSection.jsx';
import RoomSpecsSection from './sections/RoomSpecsSection.jsx';

/** On-demand meeting rooms & boardrooms with live booking. */
export default function MeetingRoomsPage() {
  return (
    <main id="main-content">
      <MeetingRoomsHero />
      <SchedulerSection />
      <RoomShowcaseSection />
      <RoomSpecsSection />
    </main>
  );
}
