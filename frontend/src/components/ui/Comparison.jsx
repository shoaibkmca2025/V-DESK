/**
 * Two-column comparison (V-DESK vs the alternative). `rows` = [[label, ours, theirs]].
 * Rendered as a real table so it stays readable to screen readers and on small screens.
 */
export default function Comparison({ ours = 'V-DESK virtual office', theirs = 'Renting an office', rows }) {
  return (
    <div className="ui-table-wrap ui-compare">
      <table className="ui-table">
        <thead>
          <tr>
            <th scope="col">&nbsp;</th>
            <th scope="col" className="ui-compare__ours">
              <i className="ph-bold ph-check-circle" /> {ours}
            </th>
            <th scope="col">{theirs}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, good, bad]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td className="ui-compare__good">
                <i className="ph-bold ph-check" /> {good}
              </td>
              <td className="ui-compare__bad">{bad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
