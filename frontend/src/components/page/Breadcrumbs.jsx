import { Fragment } from 'react';
import { Link } from 'react-router';

/** Breadcrumb bar. `trail` = [{ label, to? }, …]; the last entry is the current page. */
export default function Breadcrumbs({ trail }) {
  return (
    <div className="cw-breadcrumbs-bar">
      <div className="container">
        <nav className="cw-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">
            <i className="ph-bold ph-house" />
            Home
          </Link>
          {trail.map((item, index) => (
            <Fragment key={item.label}>
              <i className="ph-bold ph-caret-right" />
              {index === trail.length - 1 || !item.to ? <span className="active">{item.label}</span> : <Link to={item.to}>{item.label}</Link>}
            </Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
}
