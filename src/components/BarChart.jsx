// File: src/components/BarChart.jsx
// Used by: pages/DossDashboard.jsx, pages/StudentDashboard.jsx
// A simple horizontal bar chart made only with HTML + CSS (no chart library)
export default function BarChart({ data, colorFor, emptyText = 'No data yet' }) {
  if (data.length === 0) return <p className="muted">{emptyText}</p>;

  const maxCount = Math.max(1, ...data.map((entry) => entry.count || 0));

  return (
    <ul className="bar-chart">
      {data.map(({ label, count }, index) => (
        <li key={label} className="bar-chart__row">
          <span className="bar-chart__label">{label}</span>
          <span className="bar-chart__track">
            <span
              className="bar-chart__fill"
              style={{
                width: `${(count / maxCount) * 100}%`,
                background: colorFor?.(label) ?? undefined,
                animationDelay: `${index * 60}ms`,
              }}
            />
          </span>
          <span className="bar-chart__value">{count}</span>
        </li>
      ))}
    </ul>
  );
}
