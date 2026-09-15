/** SECTION 02 &mdash; CREDIBILITY TRUST BAR 10+ Cities | 50+ Grade-A Hubs | 10,000+ Businesses Served | 4.9&#9733; Client Rating */
export default function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="container">
        <div className="trust-strip__grid reveal-stagger" id="trustStrip">
          <div className="trust-strip__item">
            <div className="trust-strip__value">
              <span className="counter" data-target="10">
                0
              </span>
              <span className="accent">+</span>
            </div>
            <div className="trust-strip__label">Prime Metros & Cities</div>
            <div className="trust-strip__sub">Pan-India Commercial Network</div>
          </div>
          <div className="trust-strip__item">
            <div className="trust-strip__value">
              <span className="counter" data-target="50">
                0
              </span>
              <span className="accent">+</span>
            </div>
            <div className="trust-strip__label">Grade-A Hubs</div>
            <div className="trust-strip__sub">Premium Commercial Towers</div>
          </div>
          <div className="trust-strip__item">
            <div className="trust-strip__value">
              <span className="counter" data-target="10000">
                0
              </span>
              <span className="accent">+</span>
            </div>
            <div className="trust-strip__label">Businesses Served</div>
            <div className="trust-strip__sub">Founders, CAs & Enterprises</div>
          </div>
          <div className="trust-strip__item">
            <div className="trust-strip__value">
              <span className="counter" data-target="100">
                0
              </span>
              <span className="accent">%</span>
            </div>
            <div className="trust-strip__label">Tax Compliance</div>
            <div className="trust-strip__sub">Guaranteed NOC & Bill</div>
          </div>
          <div className="trust-strip__item">
            <div className="trust-strip__value">
              <span className="counter" data-target="4.9" data-decimals="1">
                0
              </span>
              <span className="accent">★</span>
            </div>
            <div className="trust-strip__label">Client Rating</div>
            <div className="trust-strip__sub">2,400+ Verified Reviews</div>
          </div>
        </div>
      </div>
    </section>
  );
}
