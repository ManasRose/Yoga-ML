const LEVELS = {
  high: { bg: "#f0f4f1", text: "#4a7c52", dot: "#6b8f71", label: "Great" },
  medium: { bg: "#fdf8f0", text: "#8a6c30", dot: "#d4a85a", label: "Fair" },
  low: { bg: "#fdf3f0", text: "#a05c3a", dot: "#c4714a", label: "Low" },
};

export default function ScoreBadge({ score }) {
  if (score == null) return null;
  const level = score >= 75 ? "high" : score >= 45 ? "medium" : "low";
  const { bg, text, dot, label } = LEVELS[level];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: bg,
        color: text,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: "0.75rem",
        padding: "3px 10px 3px 8px",
        borderRadius: "999px",
        letterSpacing: "0.02em",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {Math.round(score)} · {label}
    </span>
  );
}
