/** Big-number trust row. `stats` = [[value, label]]. */
export default function StatsRow({ stats }) {
  return (
    <div className="ui-stats">
      {stats.map(([value, label]) => (
        <div key={label} className="ui-stat">
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
