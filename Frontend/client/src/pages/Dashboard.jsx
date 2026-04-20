import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import ScoreBadge from "../components/ScoreBadge";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: sessions, loading: sLoad } = useApi("/sessions");
  const { data: stats, loading: stLoad } = useApi("/records/stats/me");

  const topPoses = stats?.slice(0, 4) || [];

  return (
    <div
      style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1.5rem" }}
    >
      <h2 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
        Welcome back, {user?.name} 👋
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "2rem", fontSize: "0.9rem" }}>
        Here's your practice overview.
      </p>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "Total sessions", value: sessions?.length ?? "—" },
          {
            label: "Poses attempted",
            value: stats?.reduce((s, p) => s + p.count, 0) ?? "—",
          },
          {
            label: "Avg score",
            value: stats?.length
              ? Math.round(
                  stats.reduce((s, p) => s + (p.avgScore || 0), 0) /
                    stats.length,
                ) + "%"
              : "—",
          },
          { label: "Unique poses", value: stats?.length ?? "—" },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "#f3f4f6",
              borderRadius: "10px",
              padding: "1rem",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.78rem",
                color: "#6b7280",
                marginBottom: "4px",
              }}
            >
              {label}
            </p>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "1.4rem" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Most practiced poses */}
      {topPoses.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3
            style={{
              fontWeight: 600,
              fontSize: "1rem",
              marginBottom: "0.75rem",
            }}
          >
            Most practiced poses
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {topPoses.map((p) => (
              <div
                key={p._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    textTransform: "capitalize",
                    fontSize: "0.9rem",
                  }}
                >
                  {p._id.replace(/_/g, " ")}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "0.82rem",
                    color: "#6b7280",
                  }}
                >
                  <span>{p.count}× attempts</span>
                  <ScoreBadge score={p.avgScore} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session history */}
      <div>
        <h3
          style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.75rem" }}
        >
          Recent sessions
        </h3>
        {sLoad ? (
          <p style={{ color: "#9ca3af" }}>Loading…</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sessions?.length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                No sessions yet.{" "}
                <Link to="/live" style={{ color: "#4f46e5" }}>
                  Start your first one →
                </Link>
              </p>
            )}
            {sessions?.map((s) => (
              <div
                key={s._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: "0.9rem" }}>
                    {s.title}
                  </p>
                  <p
                    style={{ margin: 0, fontSize: "0.78rem", color: "#6b7280" }}
                  >
                    {new Date(s.startedAt).toLocaleDateString()} ·{" "}
                    {s.durationSecs
                      ? `${Math.round(s.durationSecs / 60)} min`
                      : "In progress"}
                  </p>
                </div>
                <ScoreBadge score={s.overallScore} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
