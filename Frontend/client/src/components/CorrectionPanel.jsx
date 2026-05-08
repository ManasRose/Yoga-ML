import { useRef, useEffect } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

  .cp-wrap * { box-sizing: border-box; }

  .cp-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 100%;
    min-height: 180px;
    padding: 2rem;
    font-family: 'DM Sans', sans-serif;
    color: #9ca89e;
    font-size: 0.85rem;
    letter-spacing: 0.02em;
    text-align: center;
  }

  .cp-empty-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #f0f4f1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
  }

  .cp-header {
    padding: 1.1rem 1.2rem 0.9rem;
    border-bottom: 1px solid #eef1ee;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .cp-label {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 1.05rem;
    color: #2D2D2D;
    margin: 0 0 3px;
    line-height: 1.3;
    text-transform: capitalize;
  }

  .cp-confidence {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.73rem;
    color: #9ca89e;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 500;
    margin: 0;
  }

  .cp-score-ring {
    position: relative;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
  }

  .cp-score-ring svg {
    transform: rotate(-90deg);
    display: block;
  }

  .cp-score-num {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    color: #2D2D2D;
  }

  .cp-body {
    padding: 1rem 1.2rem 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cp-great {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: #f0f4f1;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    color: #4a7c52;
    letter-spacing: 0.01em;
  }

  .cp-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    background: #fafaf7;
    border: 1px solid #eef1ee;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: #3a3a3a;
    line-height: 1.5;
    transition: background 0.2s;
    animation: cp-slide-in 0.3s ease both;
  }

  .cp-item:hover { background: #f4f7f4; }

  .cp-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 5px;
  }

  .cp-dot-high   { background: #c4714a; }
  .cp-dot-medium { background: #d4a85a; }
  .cp-dot-low    { background: #6b8f71; }

  .cp-sev-label {
    display: block;
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.55;
    margin-bottom: 2px;
    line-height: 1.2;
  }

  .cp-msg {
    display: block;
    line-height: 1.5;
  }

  @keyframes cp-slide-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

function ScoreRing({ score }) {
  const color = score >= 75 ? "#6b8f71" : score >= 45 ? "#d4a85a" : "#c4714a";
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = ((score ?? 0) / 100) * circ;

  return (
    <div className="cp-score-ring">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="#eef1ee"
          strokeWidth="4"
        />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="cp-score-num" style={{ color }}>
        {Math.round(score ?? 0)}
      </div>
    </div>
  );
}

const sevDotClass = {
  high: "cp-dot-high",
  medium: "cp-dot-medium",
  low: "cp-dot-low",
};
const sevLabel = { high: "Fix", medium: "Improve", low: "Tip" };

export default function CorrectionPanel({
  label,
  confidence,
  score,
  corrections = [],
}) {
  if (!label) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="cp-wrap cp-empty">
          <div className="cp-empty-icon">🧘</div>
          <span>
            Start your camera
            <br />
            to detect a pose
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="cp-wrap">
        {/* ── Header ── */}
        <div className="cp-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="cp-label">{label.replace(/_/g, " ")}</p>
            <p className="cp-confidence">
              Confidence · {Math.round((confidence || 0) * 100)}%
            </p>
          </div>
          <ScoreRing score={score ?? 0} />
        </div>

        {/* ── Corrections ── */}
        <div className="cp-body">
          {corrections.length === 0 ? (
            <div className="cp-great">
              <span>✦</span> Great form — hold this pose!
            </div>
          ) : (
            corrections.map((c, i) => (
              <div
                key={i}
                className="cp-item"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span
                  className={`cp-dot ${sevDotClass[c.severity] || "cp-dot-low"}`}
                />
                <div>
                  <span className="cp-sev-label">
                    {sevLabel[c.severity] || "Tip"}
                  </span>
                  <span className="cp-msg">{c.message}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
