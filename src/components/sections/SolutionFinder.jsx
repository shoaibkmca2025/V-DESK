import { filterDiscoveryEngine } from '@/features/discovery/discoveryEngine.js';
import { scrollToSection } from '@/features/ui/scroll.js';

/** "What does your business need today?" workspace discovery engine. */
export default function SolutionFinder() {
  return (
    <section className="section solution-finder" id="solutionFinder">
      <div id="workspaces" style={{ position: 'relative', top: '-80px', visibility: 'hidden' }} aria-hidden="true" />
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow">Smart Discovery</span>
          <h2 className="section__title">
            FIND YOUR PERFECT
            <br />
            WORKSPACE SETUP.
          </h2>
          <p className="section__desc">
            Filter our verified commercial portfolio by city, workspace model, team capacity, and duration.
          </p>
        </div>
        <div className="finder__grid reveal-stagger">
          <div className="finder__card" onClick={() => scrollToSection('#wizard')}>
            <div className="finder__card-icon">
              <i className="ph-bold ph-rocket-launch" />
            </div>
            <div className="finder__card-label">Start</div>
            <div className="finder__card-title">Set up my business</div>
            <div className="finder__card-desc">
              Incorporate your company, obtain GST, and establish your brand correctly.
            </div>
            <div className="finder__card-services">
              <span>Pvt Ltd / LLP Incorporation</span>
              <span>GST Registration & Filing</span>
              <span>Trademark Protection</span>
            </div>
            <div className="finder__card-cta">
              <button className="btn btn--primary btn--sm">Get Started →</button>
            </div>
          </div>
          <div className="finder__card" onClick={() => scrollToSection('#services')}>
            <div className="finder__card-icon">
              <i className="ph-bold ph-map-pin" />
            </div>
            <div className="finder__card-label">Establish</div>
            <div className="finder__card-title">Professional business address</div>
            <div className="finder__card-desc">Verified commercial address with registered deed and landlord NOC.</div>
            <div className="finder__card-services">
              <span>Virtual Office Address</span>
              <span>GST Address (PPOB/APOB)</span>
              <span>Mail & Courier Handling</span>
            </div>
            <div className="finder__card-cta">
              <button className="btn btn--primary btn--sm">Explore Addresses →</button>
            </div>
          </div>
          <div className="finder__card" onClick={() => scrollToSection('#services')}>
            <div className="finder__card-icon">
              <i className="ph-bold ph-laptop" />
            </div>
            <div className="finder__card-label">Work</div>
            <div className="finder__card-title">Dedicated workspace</div>
            <div className="finder__card-desc">Ergonomic desks, private team cabins, and conference rooms.</div>
            <div className="finder__card-services">
              <span>Hot Desk & Dedicated Desk</span>
              <span>Private Team Cabins</span>
              <span>4K-Enabled Boardrooms</span>
            </div>
            <div className="finder__card-cta">
              <button className="btn btn--primary btn--sm">Find Workspace →</button>
            </div>
          </div>
          <div className="finder__card" onClick={() => scrollToSection('#locations')}>
            <div className="finder__card-icon">
              <i className="ph-bold ph-chart-line-up" />
            </div>
            <div className="finder__card-label">Expand</div>
            <div className="finder__card-title">Enter a new city</div>
            <div className="finder__card-desc">
              Establish presence in 10+ major metros with zero capital expenditure.
            </div>
            <div className="finder__card-services">
              <span>Multi-City Virtual Office</span>
              <span>Multi-State GST (APOB)</span>
              <span>Nationwide Boardrooms</span>
            </div>
            <div className="finder__card-cta">
              <button className="btn btn--primary btn--sm">Explore Hubs →</button>
            </div>
          </div>
        </div>
        <div className="discovery-filter-engine reveal" id="discoveryFilterEngine">
          <div className="discovery-filter-bar">
            <div className="filter-group">
              <label className="filter-label" htmlFor="discCity">
                <i className="ph-bold ph-map-pin" />
                City
              </label>
              <select id="discCity" className="filter-select" onChange={() => filterDiscoveryEngine()}>
                <option value="all">All Cities (10+)</option>
                <option value="Nashik">Nashik (Flagship)</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="discType">
                <i className="ph-bold ph-buildings" />
                Workspace Type
              </label>
              <select id="discType" className="filter-select" onChange={() => filterDiscoveryEngine()}>
                <option value="all">All Workspaces</option>
                <option value="Virtual Office">Virtual Office</option>
                <option value="Coworking">Coworking Desk</option>
                <option value="Private Office">Private Cabin</option>
                <option value="Meeting Rooms">Meeting Room</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="discTeam">
                <i className="ph-bold ph-users-three" />
                Team Size
              </label>
              <select id="discTeam" className="filter-select" onChange={() => filterDiscoveryEngine()}>
                <option value="all">Any Team Size</option>
                <option value="solo">1—2 Solo / Founders</option>
                <option value="growth">3—8 Growth Team</option>
                <option value="team">9—20 Enterprise</option>
                <option value="large">20+ Custom Suite</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="discDuration">
                <i className="ph-bold ph-calendar" />
                Duration
              </label>
              <select id="discDuration" className="filter-select" onChange={() => filterDiscoveryEngine()}>
                <option value="all">Flexible</option>
                <option value="daily">Hourly / Daily</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual (Save 20%)</option>
              </select>
            </div>
            <div className="filter-group filter-group--btn">
              <button className="btn btn--primary btn--full" onClick={() => filterDiscoveryEngine()}>
                <i className="ph-bold ph-funnel" />
                Apply Filter
              </button>
            </div>
          </div>
          <div className="discovery-results-grid" id="discoveryResultsContainer" />
        </div>
      </div>
    </section>
  );
}
