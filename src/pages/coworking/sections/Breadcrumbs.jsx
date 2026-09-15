import { Link } from 'react-router';

/** BREADCRUMBS NAVIGATION (TEC REFERENCE) */
export default function Breadcrumbs() {
  return (
    <div className="cw-breadcrumbs-bar">
      <div className="container">
        <nav className="cw-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">
            <i className="ph-bold ph-house" />
            Home
          </Link>
          <i className="ph-bold ph-caret-right" />
          <Link to="/locations">Our Locations</Link>
          <i className="ph-bold ph-caret-right" />
          <Link to="/locations#delhi">New Delhi</Link>
          <i className="ph-bold ph-caret-right" />
          <span className="active">Worldmark Aerocity</span>
        </nav>
      </div>
    </div>
  );
}
