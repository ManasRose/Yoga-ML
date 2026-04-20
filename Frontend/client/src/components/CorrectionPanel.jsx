const severityIcon = { high: "🔴", medium: "🟡", low: "🟢" };

export default function CorrectionPanel({
  label,
  confidence,
  score,
  corrections = [],
}) {
  if (!label)
    return (
      <div style={{ padding: "1.5rem", textAlign: "center", color: "#6b7280" }}>
        No pose detected yet
      </div>
    );

  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "capitalize",
            }}
          >
            {label.replace(/_/g, " ")}
          </p>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7280" }}>
            Confidence: {Math.round((confidence || 0) * 100)}%
          </p>
        </div>
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color:
              score >= 75 ? "#16a34a" : score >= 45 ? "#ca8a04" : "#dc2626",
          }}
        >
          {Math.round(score ?? 0)}
        </div>
      </div>

      {corrections.length === 0 ? (
        <p style={{ color: "#16a34a", fontWeight: 500, fontSize: "0.9rem" }}>
          ✓ Great form!
        </p>
      ) : (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {corrections.map((c, i) => (
            <li
              key={i}
              style={{
                background: "#f9fafb",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "0.85rem",
                borderLeft: `3px solid ${c.severity === "high" ? "#ef4444" : c.severity === "medium" ? "#f59e0b" : "#22c55e"}`,
              }}
            >
              <span style={{ marginRight: "6px" }}>
                {severityIcon[c.severity]}
              </span>
              {c.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
