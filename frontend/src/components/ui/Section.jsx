/** Page section with the simple-UI spacing and optional heading block. */
export default function Section({ id, tone, tight, kicker, title, lead, align = 'center', children, className = '' }) {
  const classes = ['ui-section', tone && `ui-section--${tone}`, tight && 'ui-section--tight', className].filter(Boolean).join(' ');
  return (
    <section id={id} className={classes}>
      <div className="ui-container">
        {(kicker || title || lead) && (
          <div className={align === 'left' ? 'ui-section-head ui-section-head--left' : 'ui-section-head ui-section-head--center'}>
            {kicker && <span className="ui-kicker">{kicker}</span>}
            {title && <h2 className="ui-title">{title}</h2>}
            {lead && <p className="ui-lead">{lead}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
