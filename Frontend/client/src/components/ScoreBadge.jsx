const colors = {
  high: { bg: "#dcfce7", text: "#166534" },
  medium: { bg: "#fef9c3", text: "#854d0e" },
  low: { bg: "#fee2e2", text: "#991b1b" },
};

export default function ScoreBadge({ score }) {
  if (score == null) return null;
  const level = score >= 75 ? "high" : score >= 45 ? "medium" : "low";
  const { bg, text } = colors[level];
  return (
    <span
      style={{
        background: bg,
        color: text,
        fontWeight: 600,
        fontSize: "0.8rem",
        padding: "2px 10px",
        borderRadius: "999px",
      }}
    >
      {Math.round(score)}%
    </span>
  );
}
