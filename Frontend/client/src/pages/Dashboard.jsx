import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import ScoreBadge from "../components/ScoreBadge";
import { useEffect, useRef, useState } from "react";

/* ─── tiny keyframe injector ──────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(6px) scale(0.92); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes barGrow {
    from { width: 0%; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .dash-card {
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.25s ease;
  }
  .dash-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(107,143,113,0.14) !important;
  }
  .session-row {
    transition: background 0.18s ease, transform 0.18s ease;
  }
  .session-row:hover {
    background: #F0F4F1 !important;
    transform: translateX(3px);
  }
  .pose-row {
    transition: background 0.18s ease;
  }
  .pose-row:hover {
    background: #FDF6F2 !important;
  }
  .cta-btn {
    transition: background 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
  .cta-btn:hover {
    background: #b3613c !important;
    transform: translateY(-2px);
  }
`;

/* ─── animated counter ─────────────────────────────────────────────────── */
function AnimatedValue({ value }) {
  const [displayed, setDisplayed] = useState("—");
  useEffect(() => {
    if (value === "—" || value == null) return;
    const isNum = !isNaN(parseFloat(value));
    if (!isNum) {
      setDisplayed(value);
      return;
    }
    const end = parseFloat(value);
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(ease * end);
      setDisplayed(String(value).includes("%") ? cur + "%" : cur);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{displayed}</span>;
}

/* ─── stat card ────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, delay, accent }) {
  return (
    <div
      className="dash-card"
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "1.4rem 1.5rem",
        boxShadow: "0 2px 12px rgba(45,45,45,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        animation: `fadeUp 0.5s ease both`,
        animationDelay: delay,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* decorative corner tint */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "70px",
          height: "70px",
          background:
            accent === "terra"
              ? "radial-gradient(circle at top right, #FDF6F2, transparent 70%)"
              : "radial-gradient(circle at top right, #F0F4F1, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: accent === "terra" ? "#FDF6F2" : "#F0F4F1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
        }}
      >
        {icon}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "1.9rem",
          fontWeight: 600,
          fontFamily: "'DM Serif Display', serif",
          color: "#2D2D2D",
          animation: "countUp 0.5s ease both",
          animationDelay: delay,
        }}
      >
        <AnimatedValue value={value} />
      </p>

      <p
        style={{
          margin: 0,
          fontSize: "0.75rem",
          color: "#9a9a8e",
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
    </div>
  );
}

/* ─── pose progress row ─────────────────────────────────────────────────── */
function PoseRow({ pose, rank, delay }) {
  const pct = Math.round(pose.avgScore || 0);
  return (
    <div
      className="pose-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "12px 16px",
        borderRadius: "12px",
        background: "#fff",
        border: "1px solid #EDF0EC",
        animation: "fadeUp 0.5s ease both",
        animationDelay: delay,
        cursor: "default",
      }}
    >
      {/* rank */}
      <span
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "1rem",
          color: rank === 1 ? "#C4714A" : "#c4bfb4",
          minWidth: "18px",
        }}
      >
        {rank}
      </span>

      {/* name + bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: "0 0 6px",
            fontWeight: 500,
            fontSize: "0.88rem",
            textTransform: "capitalize",
            color: "#2D2D2D",
            fontFamily: "'Outfit', sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {pose._id.replace(/_/g, " ")}
        </p>
        <div
          style={{ height: "4px", borderRadius: "99px", background: "#F0F4F1" }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: "99px",
              width: `${pct}%`,
              background:
                pct >= 75
                  ? "linear-gradient(90deg, #6B8F71, #8aad90)"
                  : pct >= 45
                    ? "linear-gradient(90deg, #C4714A, #d98b6a)"
                    : "linear-gradient(90deg, #c4bfb4, #dad5cc)",
              animation: "barGrow 1s cubic-bezier(0.22,1,0.36,1) both",
              animationDelay: delay,
            }}
          />
        </div>
      </div>

      {/* meta */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "#b0aa9f",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {pose.count}×
        </span>
        <ScoreBadge score={pose.avgScore} />
      </div>
    </div>
  );
}

/* ─── session row ───────────────────────────────────────────────────────── */
function SessionRow({ s, delay }) {
  const date = new Date(s.startedAt);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const duration = s.durationSecs
    ? `${Math.round(s.durationSecs / 60)} min`
    : "In progress";

  return (
    <div
      className="session-row"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "13px 16px",
        borderRadius: "12px",
        background: "#fff",
        border: "1px solid #EDF0EC",
        animation: "fadeUp 0.5s ease both",
        animationDelay: delay,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* subtle time-dot indicator */}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: s.durationSecs ? "#6B8F71" : "#C4714A",
            flexShrink: 0,
            boxShadow: s.durationSecs ? "none" : "0 0 0 3px #FDF6F2",
          }}
        />
        <div>
          <p
            style={{
              margin: 0,
              fontWeight: 500,
              fontSize: "0.88rem",
              color: "#2D2D2D",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {s.title}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "0.74rem",
              color: "#b0aa9f",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {formatted} · {duration}
          </p>
        </div>
      </div>
      <ScoreBadge score={s.overallScore} />
    </div>
  );
}

/* ─── empty state ───────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "2.5rem 1rem",
        animation: "fadeUp 0.5s ease both",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🪷</div>
      <p
        style={{
          margin: "0 0 4px",
          fontWeight: 500,
          fontSize: "0.9rem",
          color: "#2D2D2D",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        No sessions yet
      </p>
      <p
        style={{
          margin: "0 0 1.25rem",
          fontSize: "0.82rem",
          color: "#b0aa9f",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        Your practice history will appear here.
      </p>
      <Link to="/live">
        <button
          className="cta-btn"
          style={{
            background: "#C4714A",
            color: "#fff",
            border: "none",
            borderRadius: "99px",
            padding: "9px 22px",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          Start your first session →
        </button>
      </Link>
    </div>
  );
}

/* ─── section heading ───────────────────────────────────────────────────── */
function SectionHeading({ children, delay }) {
  return (
    <h3
      style={{
        margin: "0 0 0.9rem",
        fontFamily: "'DM Serif Display', serif",
        fontWeight: 400,
        fontSize: "1.2rem",
        color: "#2D2D2D",
        animation: "fadeUp 0.5s ease both",
        animationDelay: delay,
      }}
    >
      {children}
    </h3>
  );
}

/* ─── loading skeleton ──────────────────────────────────────────────────── */
function Skeleton({ h = "14px", w = "100%", r = "8px", mb = "0" }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: r,
        marginBottom: mb,
        background:
          "linear-gradient(90deg, #F0F4F1 25%, #E8EDE9 50%, #F0F4F1 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite linear",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user } = useAuth();
  const { data: sessions, loading: sLoad } = useApi("/sessions");
  const { data: stats, loading: stLoad } = useApi("/records/stats/me");

  const topPoses = stats?.slice(0, 4) || [];
  const totalAttempts = stats?.reduce((s, p) => s + p.count, 0) ?? "—";
  const avgScore = stats?.length
    ? Math.round(
        stats.reduce((s, p) => s + (p.avgScore || 0), 0) / stats.length,
      ) + "%"
    : "—";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <>
      <style>{css}</style>

      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem 4rem",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            marginBottom: "2.5rem",
            animation: "fadeUp 0.4s ease both",
          }}
        >
          <p
            style={{
              margin: "0 0 2px",
              fontSize: "0.78rem",
              color: "#6B8F71",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {greeting}
          </p>
          <h2
            style={{
              margin: "0 0 6px",
              fontFamily: "'DM Serif Display', serif",
              fontWeight: 400,
              fontSize: "2rem",
              color: "#2D2D2D",
            }}
          >
            {user?.name}'s Practice
          </h2>
          <p style={{ margin: 0, color: "#b0aa9f", fontSize: "0.85rem" }}>
            Track your progress, review sessions, and keep the streak going.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "12px",
            marginBottom: "2.5rem",
          }}
        >
          <StatCard
            label="Total sessions"
            value={sessions?.length ?? "—"}
            icon="📅"
            delay="0.05s"
            accent="green"
          />
          <StatCard
            label="Poses attempted"
            value={totalAttempts}
            icon="🧘"
            delay="0.10s"
            accent="green"
          />
          <StatCard
            label="Avg score"
            value={avgScore}
            icon="⭐"
            delay="0.15s"
            accent="terra"
          />
          <StatCard
            label="Unique poses"
            value={stats?.length ?? "—"}
            icon="🌿"
            delay="0.20s"
            accent="terra"
          />
        </div>

        {/* ── Most practiced poses ── */}
        {(stLoad || topPoses.length > 0) && (
          <div style={{ marginBottom: "2.5rem" }}>
            <SectionHeading delay="0.22s">Most practiced poses</SectionHeading>

            {stLoad ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "#fff",
                      border: "1px solid #EDF0EC",
                      display: "flex",
                      gap: "14px",
                      alignItems: "center",
                    }}
                  >
                    <Skeleton h="12px" w="16px" r="4px" />
                    <div style={{ flex: 1 }}>
                      <Skeleton h="10px" w="50%" r="4px" mb="8px" />
                      <Skeleton h="4px" r="99px" />
                    </div>
                    <Skeleton h="22px" w="48px" r="99px" />
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {topPoses.map((p, i) => (
                  <PoseRow
                    key={p._id}
                    pose={p}
                    rank={i + 1}
                    delay={`${0.25 + i * 0.06}s`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Recent sessions ── */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "0.9rem",
              animation: "fadeUp 0.5s ease both",
              animationDelay: "0.28s",
            }}
          >
            <SectionHeading delay="0s">Recent sessions</SectionHeading>
            {sessions?.length > 0 && (
              <Link
                to="/live"
                style={{
                  fontSize: "0.78rem",
                  color: "#6B8F71",
                  fontWeight: 600,
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                }}
              >
                + New session
              </Link>
            )}
          </div>

          {sLoad ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    padding: "13px 16px",
                    borderRadius: "12px",
                    background: "#fff",
                    border: "1px solid #EDF0EC",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <Skeleton h="8px" w="8px" r="50%" />
                    <div>
                      <Skeleton h="10px" w="120px" r="4px" mb="6px" />
                      <Skeleton h="8px" w="80px" r="4px" />
                    </div>
                  </div>
                  <Skeleton h="22px" w="48px" r="99px" />
                </div>
              ))}
            </div>
          ) : sessions?.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #EDF0EC",
                borderRadius: "16px",
              }}
            >
              <EmptyState />
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {sessions.map((s, i) => (
                <SessionRow key={s._id} s={s} delay={`${0.3 + i * 0.05}s`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
