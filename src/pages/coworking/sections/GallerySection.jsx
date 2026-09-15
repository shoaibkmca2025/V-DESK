import { switchCwGalleryTab } from '@/features/coworking/coworking.js';

/** INTERACTIVE CENTRE GALLERY SHOWCASE (TEC REFERENCE) */
export default function GallerySection() {
  return (
    <section className="section cw-gallery-section" id="cwGallerySection">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow">
            <i className="ph-bold ph-image" />
            Flagship Visual Tour
          </span>
          <h2 className="section__title">
            EXPLORE WORLDMARK AEROCITY
            <br />
            <span className="highlight-gold">ARCHITECTURAL SHOWCASE</span>
          </h2>
          <p className="section__desc">
            Step inside New Delhi's most prestigious commercial address. Every space is curated with biophilic elements,
            ergonomic acoustic design, and premium executive finishes.
          </p>
        </div>
        <div className="cw-gallery-tabs">
          <button
            type="button"
            className="cw-gallery-tab-btn active"
            onClick={(event) => switchCwGalleryTab('lounge', event.currentTarget)}
          >
            <i className="ph-bold ph-armchair" />
            Executive Lounge
          </button>
          <button
            type="button"
            className="cw-gallery-tab-btn"
            onClick={(event) => switchCwGalleryTab('barista', event.currentTarget)}
          >
            <i className="ph-bold ph-coffee" />
            Barista Cafe
          </button>
          <button
            type="button"
            className="cw-gallery-tab-btn"
            onClick={(event) => switchCwGalleryTab('reception', event.currentTarget)}
          >
            <i className="ph-bold ph-sparkle" />
            Light Reception
          </button>
          <button
            type="button"
            className="cw-gallery-tab-btn"
            onClick={(event) => switchCwGalleryTab('boardroom', event.currentTarget)}
          >
            <i className="ph-bold ph-presentation" />
            4K AV Boardrooms
          </button>
          <button
            type="button"
            className="cw-gallery-tab-btn"
            onClick={(event) => switchCwGalleryTab('cabins', event.currentTarget)}
          >
            <i className="ph-bold ph-door" />
            Private Cabins
          </button>
          <button
            type="button"
            className="cw-gallery-tab-btn"
            onClick={(event) => switchCwGalleryTab('library', event.currentTarget)}
          >
            <i className="ph-bold ph-book-open" />
            Silent Library
          </button>
        </div>
        <div className="cw-gallery-display" id="cwGalleryDisplay">
          <div className="cw-gallery-image-wrap">
            <img
              id="cwGalleryImg"
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
              alt="Executive Members Lounge at Worldmark Aerocity"
              className="cw-gallery-img"
            />
            <div className="cw-gallery-overlay">
              <span className="cw-gallery-tag" id="cwGalleryTag">
                Executive Members Lounge
              </span>
              <h3 className="cw-gallery-caption" id="cwGalleryCaption">
                Curated Breakout Lounge with Designer Furnishings & Natural Light
              </h3>
              <p className="cw-gallery-specs" id="cwGallerySpecs">
                Level 7 Worldmark 4 • Capacity: 60 Pax • High-Speed Dual Wi-Fi • Complimentary Artisan Beverages
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
