import { Link } from 'react-router';

/** `.ui-btn` — renders a <Link> (`to`), <a> (`href`) or <button> (default). */
export default function Button({ to, href, variant = 'primary', size, block, icon, iconRight, children, className = '', type = 'button', ...rest }) {
  const classes = ['ui-btn', `ui-btn--${variant}`, size && `ui-btn--${size}`, block && 'ui-btn--block', className].filter(Boolean).join(' ');
  const content = (
    <>
      {icon && <i className={`ph-bold ${icon}`} />}
      {children}
      {iconRight && <i className={`ph-bold ${iconRight}`} />}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}
