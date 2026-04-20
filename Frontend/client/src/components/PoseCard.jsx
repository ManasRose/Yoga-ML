export default function PoseCard({ pose, onClick }) {
  const categoryColors = {
    standing: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
    seated: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
    balance: { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
    supine: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
    inversion: { bg: "#fff1f2", text: "#be123c", border: "#fecdd3" },
  };

  const colors = categoryColors[pose.category] || categoryColors.standing;

  return (
    <div
      onClick={() => onClick?.(pose)}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "1rem",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s, transform 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        e.currentTarget.style.borderColor = "#4f46e5";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Pose image or placeholder */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: "8px",
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginBottom: "4px",
        }}
      >
        {pose.imageUrl ? (
          <img
            src={pose.imageUrl}
            alt={pose.displayName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "2.5rem" }}>🧘</span>
        )}
      </div>

      {/* Name */}
      <p
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: "0.95rem",
          color: "#111827",
        }}
      >
        {pose.displayName}
      </p>

      {/* Category badge */}
      {pose.category && (
        <span
          style={{
            display: "inline-block",
            alignSelf: "flex-start",
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: "999px",
            fontSize: "0.72rem",
            fontWeight: 500,
            padding: "2px 10px",
            textTransform: "capitalize",
          }}
        >
          {pose.category}
        </span>
      )}

      {/* Description if present */}
      {pose.description && (
        <p
          style={{
            margin: 0,
            fontSize: "0.8rem",
            color: "#6b7280",
            lineHeight: 1.5,
          }}
        >
          {pose.description}
        </p>
      )}
    </div>
  );
}
