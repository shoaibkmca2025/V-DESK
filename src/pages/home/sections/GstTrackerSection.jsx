import { lookupGstTrackerStatus } from '@/features/gst/gstTracker.js';
import { openConsultationModal } from '@/features/quote/quoteModal.js';

/** SECTION: GST & APPLICATION STATUS TRACKING PLATFORM Enterprise Platform (Section 37: Track Documents Verified -> Submitted -> ARN -> Officer Review -> Completed) */
export default function GstTrackerSection() {
  return (
    <section className="section gst-tracker-section" id="gstTrackerSection">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow" style={{ color: 'var(--vd-teal-primary)' }}>
            <i className="ph-bold ph-magnifying-glass" />
            Live Compliance Telemetry
          </span>
          <h2 className="section__title">
            REAL-TIME APPLICATION
            <br />
            <span className="highlight-gold">& GST STATUS TRACKER</span>
          </h2>
          <p className="section__desc">
            Enter your V-DESK Application Ref or Government ARN to view verified live processing milestones.
          </p>
        </div>
        <div className="tracker-console reveal">
          <div className="tracker-input-row">
            <div className="tracker-input-wrap">
              <i className="ph-bold ph-barcode tracker-icon" />
              <input
                type="text"
                id="gstTrackerInput"
                className="tracker-input"
                placeholder="Enter ARN or App Ref (e.g. AA270326019284Z or VD-MUM-8921)..."
                defaultValue="AA270326019284Z"
              />
            </div>
            <button type="button" className="btn btn--primary tracker-btn" onClick={() => lookupGstTrackerStatus()}>
              <i className="ph-bold ph-arrow-counter-clockwise" />
              Track Status
            </button>
          </div>
          <div className="gst-stepper" id="gstStepperDisplay">
            <div className="gst-step completed">
              <div className="gst-step-circle">
                <i className="ph-bold ph-check" />
              </div>
              <div className="gst-step-label">Documents Verified</div>
              <div className="gst-step-date">10 Mar 2026</div>
            </div>
            <div className="gst-step-line completed" />
            <div className="gst-step completed">
              <div className="gst-step-circle">
                <i className="ph-bold ph-check" />
              </div>
              <div className="gst-step-label">Application Submitted</div>
              <div className="gst-step-date">11 Mar 2026</div>
            </div>
            <div className="gst-step-line completed" />
            <div className="gst-step completed">
              <div className="gst-step-circle">
                <i className="ph-bold ph-check" />
              </div>
              <div className="gst-step-label">ARN Generated</div>
              <div className="gst-step-date">11 Mar 2026 • 04:15 PM</div>
            </div>
            <div className="gst-step-line in-progress" />
            <div className="gst-step active">
              <div className="gst-step-circle">
                <i className="ph-bold ph-hourglass-high" />
              </div>
              <div className="gst-step-label">Officer Review</div>
              <div className="gst-step-date">In Progress • Ward 4</div>
            </div>
            <div className="gst-step-line" />
            <div className="gst-step pending">
              <div className="gst-step-circle">5</div>
              <div className="gst-step-label">Registration Completed</div>
              <div className="gst-step-date">Expected 14 Mar</div>
            </div>
          </div>
          <div className="tracker-detail-banner" id="gstTrackerDetailBanner">
            <div className="tracker-badge-pill">
              <i className="ph-bold ph-shield-check" />
              V-DESK Compliance Desk
            </div>
            <div className="tracker-message">
              <strong>Current Stage: Officer Scrutiny (Ward 4B, Mumbai MMR)</strong>
              <span>
                Our legal representative is coordinating with the jurisdictional tax officer. Rent agreement and
                electricity NOC verified. No physical inspection query raised.
              </span>
            </div>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => openConsultationModal('GST ARN Expedite Assistance')}
            >
              <i className="ph-bold ph-headset" />
              Request Expedite
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
