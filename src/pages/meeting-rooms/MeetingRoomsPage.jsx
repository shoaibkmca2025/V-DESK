import FaqAccordion from '@/components/page/FaqAccordion.jsx';
import { Button, CtaBand, FeatureCards, Section, SplitHero, Steps } from '@/components/ui/index.js';
import { MEETING_ROOMS } from '@/data/meetingRooms.js';
import { openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';
import SchedulerSection from './sections/SchedulerSection.jsx';

const STEPS = [
  { title: 'Pick a room and time', text: 'Choose the city, room size, date and time slot that suits you.', time: '1 minute' },
  { title: 'Hold and pay', text: 'We hold the slot for 10 minutes while you pay online.', time: '2 minutes' },
  { title: 'Walk in and meet', text: 'Your booking confirmation and GST invoice arrive instantly.', time: 'Instant' },
];

const INCLUDED = [
  { icon: 'ph-monitor', title: '4K screens', text: 'Wireless screen sharing from any laptop or phone.' },
  { icon: 'ph-video-camera', tone: 'gold', title: 'Video conferencing', text: 'Cameras and sound bars ready for Zoom, Teams and Meet.' },
  { icon: 'ph-coffee', tone: 'navy', title: 'Refreshments', text: 'Tea, coffee and water served during your meeting.' },
];

const FAQS = [
  ['How does a booking hold work?', 'When you pick a slot we hold it for 10 minutes while you pay. If payment isn’t completed, the slot is released automatically.'],
  ['Can I cancel a booking?', 'Yes. Sign in and cancel any upcoming booking from the My Bookings page.'],
  ['Do I get a GST invoice?', 'Yes, every booking includes a GST invoice so you can claim input tax credit.'],
];

/** Meeting rooms — see room sizes and prices, book a slot, pay online. */
export default function MeetingRoomsPage() {
  return (
    <main id="main-content" className="ui-page">
      <SplitHero
        badge="Book by the hour"
        title={
          <>
            Meeting rooms & boardrooms, <em>bookable in minutes</em>
          </>
        }
        description="Professional rooms for interviews, client meetings and board meetings — with screens, video calls and refreshments included."
        price={499}
        priceNote="per hour"
        actions={
          <>
            <Button href="#scheduler" variant="primary" size="lg" iconRight="ph-arrow-down">
              Check availability
            </Button>
            <Button variant="outline" size="lg" onClick={() => openMeetingBookingModal()}>
              Quick book
            </Button>
          </>
        }
        trust={['Instant confirmation', 'GST invoice', 'Screens & Wi-Fi included']}
        aside={
          <div className="ui-card" style={{ width: '100%', maxWidth: '420px', gap: '4px' }}>
            <h3 style={{ marginBottom: '10px' }}>Room sizes & prices</h3>
            <div className="ui-table-wrap" style={{ border: 0 }}>
              <table className="ui-table">
                <tbody>
                  {MEETING_ROOMS.map((room) => (
                    <tr key={room.name}>
                      <td>
                        <strong>{room.name}</strong>
                        <br />
                        <span style={{ color: '#64748B', fontSize: '0.8rem' }}>{room.capacity}</span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <strong>₹{room.priceHour.toLocaleString('en-IN')}</strong>
                        <span style={{ color: '#64748B', fontSize: '0.8rem' }}> /hr</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        }
      />

      <SchedulerSection />

      <Section id="how" tone="white" kicker="How it works" title="Booked in three steps">
        <Steps steps={STEPS} />
      </Section>

      <Section id="included" kicker="Included" title="Every room comes ready">
        <FeatureCards items={INCLUDED} />
      </Section>

      <Section id="faq" tone="white" kicker="FAQ" title="Common questions">
        <FaqAccordion items={FAQS} />
      </Section>

      <section className="ui-section ui-section--tight">
        <div className="ui-container">
          <CtaBand title="Need a room for a regular team meeting?" text="Ask about monthly room credits — they come free with our All-Inclusive virtual office plan." source="Meeting Rooms - Final CTA" />
        </div>
      </section>
    </main>
  );
}
