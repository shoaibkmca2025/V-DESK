import { filterVoMarkets, prefillVoCity } from '@/features/virtualOffice/voPage.js';
import { asset } from '@/lib/assets.js';

/** 5. PICK OFFICE ADDRESS IN DELHI NCR & ACROSS INDIA */
export default function MicroMarketsSection() {
  return (
    <section className="section vo-markets-section" id="voMicroMarketsSection">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow" style={{ color: 'var(--vd-teal-primary)' }}>
            <i className="ph-bold ph-compass" />
            Strategic Prime Locations
          </span>
          <h2 className="section__title">
            PICK YOUR OFFICE ADDRESS
            <br />
            <span className="highlight-gold">IN DELHI NCR & PAN-INDIA</span>
          </h2>
          <p className="section__desc">
            Select a prestigious commercial hub that best represents your brand. Ready with instant documentation.
          </p>
        </div>
        <div className="vo-city-filter-bar reveal">
          <button
            type="button"
            className="vo-city-tab-btn active"
            onClick={(event) => filterVoMarkets('all', event.currentTarget)}
          >
            All Locations
          </button>
          <button
            type="button"
            className="vo-city-tab-btn"
            onClick={(event) => filterVoMarkets('Delhi NCR', event.currentTarget)}
          >
            Delhi NCR
          </button>
          <button
            type="button"
            className="vo-city-tab-btn"
            onClick={(event) => filterVoMarkets('Gurugram', event.currentTarget)}
          >
            Gurugram
          </button>
          <button
            type="button"
            className="vo-city-tab-btn"
            onClick={(event) => filterVoMarkets('Noida', event.currentTarget)}
          >
            Noida
          </button>
          <button
            type="button"
            className="vo-city-tab-btn"
            onClick={(event) => filterVoMarkets('Mumbai', event.currentTarget)}
          >
            Mumbai
          </button>
          <button
            type="button"
            className="vo-city-tab-btn"
            onClick={(event) => filterVoMarkets('Bengaluru', event.currentTarget)}
          >
            Bengaluru
          </button>
        </div>
        <div className="vo-markets-grid" id="voMarketsGrid">
          <div className="vo-market-card reveal" data-city="Delhi NCR">
            <div className="vo-market-img-wrap">
              <img
                src={asset('assets/cp-hub.jpg')}
                alt="Connaught Place Virtual Office"
                className="vo-market-img"
                onError={(event) => (event.currentTarget.src = 'assets/coworking-1.jpg')}
              />
              <span className="vo-market-badge">Central Delhi • CBD</span>
            </div>
            <div className="vo-market-body">
              <span className="vo-market-city">Delhi NCR</span>
              <h3 className="vo-market-name">Connaught Place</h3>
              <p className="vo-market-addr">Barakhamba Road & Statesman House Nexus, New Delhi – 110001</p>
              <div className="vo-market-footer">
                <div className="vo-market-price">
                  ₹1,299 <span>/ mo</span>
                </div>
                <a
                  href="#voLeadCard"
                  className="vo-market-btn"
                  onClick={() => prefillVoCity('Delhi NCR (Connaught Place)')}
                >
                  Select →
                </a>
              </div>
            </div>
          </div>
          <div className="vo-market-card reveal" data-city="Delhi NCR">
            <div className="vo-market-img-wrap">
              <img
                src={asset('assets/nehru-place.jpg')}
                alt="South Delhi Virtual Office"
                className="vo-market-img"
                onError={(event) => (event.currentTarget.src = 'assets/coworking-2.jpg')}
              />
              <span className="vo-market-badge">South Delhi • Tech Hub</span>
            </div>
            <div className="vo-market-body">
              <span className="vo-market-city">Delhi NCR</span>
              <h3 className="vo-market-name">Nehru Place & Okhla</h3>
              <p className="vo-market-addr">International Trade Tower, Nehru Place, New Delhi – 110019</p>
              <div className="vo-market-footer">
                <div className="vo-market-price">
                  ₹999 <span>/ mo</span>
                </div>
                <a
                  href="#voLeadCard"
                  className="vo-market-btn"
                  onClick={() => prefillVoCity('Delhi NCR (South Delhi / Nehru Place)')}
                >
                  Select →
                </a>
              </div>
            </div>
          </div>
          <div className="vo-market-card reveal" data-city="Delhi NCR">
            <div className="vo-market-img-wrap">
              <img
                src={asset('assets/aerocity.jpg')}
                alt="Aerocity Virtual Office"
                className="vo-market-img"
                onError={(event) => (event.currentTarget.src = 'assets/coworking-3.jpg')}
              />
              <span className="vo-market-badge">MNC • Luxury Hub</span>
            </div>
            <div className="vo-market-body">
              <span className="vo-market-city">Delhi NCR</span>
              <h3 className="vo-market-name">Aerocity Worldmark</h3>
              <p className="vo-market-addr">Worldmark Towers, Asset Area, Aerocity, New Delhi – 110037</p>
              <div className="vo-market-footer">
                <div className="vo-market-price">
                  ₹1,799 <span>/ mo</span>
                </div>
                <a
                  href="#voLeadCard"
                  className="vo-market-btn"
                  onClick={() => prefillVoCity('Delhi NCR (Aerocity Worldmark)')}
                >
                  Select →
                </a>
              </div>
            </div>
          </div>
          <div className="vo-market-card reveal" data-city="Gurugram">
            <div className="vo-market-img-wrap">
              <img
                src={asset('assets/cyber-city.jpg')}
                alt="Cyber City Gurugram Virtual Office"
                className="vo-market-img"
                onError={(event) => (event.currentTarget.src = 'assets/coworking-4.jpg')}
              />
              <span className="vo-market-badge">Fortune 500 Corridor</span>
            </div>
            <div className="vo-market-body">
              <span className="vo-market-city">Gurugram</span>
              <h3 className="vo-market-name">DLF Cyber City</h3>
              <p className="vo-market-addr">Building 10 & Cyber Hub Complex, DLF Phase 2, Gurugram – 122002</p>
              <div className="vo-market-footer">
                <div className="vo-market-price">
                  ₹1,499 <span>/ mo</span>
                </div>
                <a
                  href="#voLeadCard"
                  className="vo-market-btn"
                  onClick={() => prefillVoCity('Gurugram (DLF Cyber City)')}
                >
                  Select →
                </a>
              </div>
            </div>
          </div>
          <div className="vo-market-card reveal" data-city="Gurugram">
            <div className="vo-market-img-wrap">
              <img
                src={asset('assets/golf-course.jpg')}
                alt="Golf Course Road Virtual Office"
                className="vo-market-img"
                onError={(event) => (event.currentTarget.src = 'assets/coworking-1.jpg')}
              />
              <span className="vo-market-badge">Ultra-Prime Corridor</span>
            </div>
            <div className="vo-market-body">
              <span className="vo-market-city">Gurugram</span>
              <h3 className="vo-market-name">Golf Course Road</h3>
              <p className="vo-market-addr">Horizon Center & One Horizon Boulevard, Sector 43, Gurugram – 122002</p>
              <div className="vo-market-footer">
                <div className="vo-market-price">
                  ₹1,699 <span>/ mo</span>
                </div>
                <a
                  href="#voLeadCard"
                  className="vo-market-btn"
                  onClick={() => prefillVoCity('Gurugram (Golf Course Road)')}
                >
                  Select →
                </a>
              </div>
            </div>
          </div>
          <div className="vo-market-card reveal" data-city="Noida">
            <div className="vo-market-img-wrap">
              <img
                src={asset('assets/noida-hub.jpg')}
                alt="Noida Sector 62 Virtual Office"
                className="vo-market-img"
                onError={(event) => (event.currentTarget.src = 'assets/coworking-2.jpg')}
              />
              <span className="vo-market-badge">IT & Startup Park</span>
            </div>
            <div className="vo-market-body">
              <span className="vo-market-city">Noida</span>
              <h3 className="vo-market-name">Sector 62 & Expressway</h3>
              <p className="vo-market-addr">Logix Cyber Park & Advant Navis, Sector 62 / 142, Noida – 201301</p>
              <div className="vo-market-footer">
                <div className="vo-market-price">
                  ₹899 <span>/ mo</span>
                </div>
                <a
                  href="#voLeadCard"
                  className="vo-market-btn"
                  onClick={() => prefillVoCity('Noida (Sector 62 & Expressway)')}
                >
                  Select →
                </a>
              </div>
            </div>
          </div>
          <div className="vo-market-card reveal" data-city="Mumbai">
            <div className="vo-market-img-wrap">
              <img
                src={asset('assets/bkc-hub.jpg')}
                alt="Mumbai BKC Virtual Office"
                className="vo-market-img"
                onError={(event) => (event.currentTarget.src = 'assets/coworking-3.jpg')}
              />
              <span className="vo-market-badge">Financial Capital</span>
            </div>
            <div className="vo-market-body">
              <span className="vo-market-city">Mumbai</span>
              <h3 className="vo-market-name">Bandra Kurla Complex</h3>
              <p className="vo-market-addr">G-Block Financial District, Bandra East, Mumbai – 400051</p>
              <div className="vo-market-footer">
                <div className="vo-market-price">
                  ₹2,199 <span>/ mo</span>
                </div>
                <a href="#voLeadCard" className="vo-market-btn" onClick={() => prefillVoCity('Mumbai (BKC)')}>
                  Select →
                </a>
              </div>
            </div>
          </div>
          <div className="vo-market-card reveal" data-city="Bengaluru">
            <div className="vo-market-img-wrap">
              <img
                src={asset('assets/bangalore-hub.jpg')}
                alt="Bengaluru Koramangala Virtual Office"
                className="vo-market-img"
                onError={(event) => (event.currentTarget.src = 'assets/coworking-4.jpg')}
              />
              <span className="vo-market-badge">Silicon Valley of India</span>
            </div>
            <div className="vo-market-body">
              <span className="vo-market-city">Bengaluru</span>
              <h3 className="vo-market-name">Koramangala & Indiranagar</h3>
              <p className="vo-market-addr">80 Feet Road & 100 Feet Road Tech Corridor, Bengaluru – 560034</p>
              <div className="vo-market-footer">
                <div className="vo-market-price">
                  ₹1,199 <span>/ mo</span>
                </div>
                <a
                  href="#voLeadCard"
                  className="vo-market-btn"
                  onClick={() => prefillVoCity('Bengaluru (Koramangala / Indiranagar)')}
                >
                  Select →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
