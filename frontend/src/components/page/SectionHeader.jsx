/** Centred section heading (kicker + title + one line of context); `dark` for navy sections. */
export default function SectionHeader({ eyebrow, title, highlight, description, dark = false }) {
  return (
    <div className={dark ? 'ui-section-head ui-section-head--center ui-section-head--dark' : 'ui-section-head ui-section-head--center'}>
      {eyebrow && <span className="ui-kicker">{eyebrow}</span>}
      <h2 className="ui-title">
        {title}
        {highlight && (
          <>
            {' '}
            <em>{highlight}</em>
          </>
        )}
      </h2>
      {description && <p className="ui-lead">{description}</p>}
    </div>
  );
}
