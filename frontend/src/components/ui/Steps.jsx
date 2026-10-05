/** Numbered "how it works" cards. `steps` = [{ title, text, time }]. */
export default function Steps({ steps }) {
  return (
    <div className="ui-steps">
      {steps.map((step, index) => (
        <div key={step.title} className="ui-step">
          <div className="ui-step__num">{index + 1}</div>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
          {step.time && (
            <span className="ui-step__time">
              <i className="ph-bold ph-clock" /> {step.time}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
