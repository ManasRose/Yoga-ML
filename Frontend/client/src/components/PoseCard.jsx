import { useEffect, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

  .pose-card {
    background: #fff;
    border: 1px solid #eef1ee;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease, border-color 0.2s;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 4px rgba(45,45,45,0.05);
  }

  .pose-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(107,143,113,0.13), 0 2px 8px rgba(45,45,45,0.06);
    border-color: rgba(107,143,113,0.35);
  }

  .pose-card-static {
    cursor: default;
  }

  .pose-card-static:hover {
    transform: none;
    box-shadow: 0 1px 4px rgba(45,45,45,0.05);
    border-color: #eef1ee;
  }

  .pose-img-wrap {
    width: 100%;
    aspect-ratio: 4/3;
    background: linear-gradient(135deg, #f0f4f1 0%, #e8f0e9 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .pose-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .pose-card:hover .pose-img-wrap img {
    transform: scale(1.04);
  }

  .pose-img-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .pose-img-icon {
    font-size: 2.8rem;
    line-height: 1;
    filter: saturate(0.7);
  }

  .pose-img-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%);
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .pose-card:hover .pose-img-shimmer {
    opacity: 1;
    animation: shimmer 0.8s ease forwards;
  }

  @keyframes shimmer {
    from { background-position: -200% 0; }
    to   { background-position: 200% 0; }
  }

  .pose-body {
    padding: 0.9rem 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }

  .pose-name {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 0.98rem;
    color: #2D2D2D;
    margin: 0;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .pose-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    align-self: flex-start;
    border-radius: 999px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.68rem;
    font-weight: 600;
    padding: 3px 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .pose-desc {
    font-family: 'DM Sans', sans-serif;
    margin: 0;
    font-size: 0.78rem;
    color: #8a9490;
    line-height: 1.55;
    font-weight: 400;
  }

  .pose-footer {
    margin-top: auto;
    padding-top: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    color: #b0bcb2;
    letter-spacing: 0.02em;
  }

  .pose-footer-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #c8d4ca;
  }
`;

const CATEGORY_STYLES = {
  standing: { bg: "#f0f4f1", text: "#4a7c52", dot: "#6b8f71" },
  seated: { bg: "#fdf6f2", text: "#a05c3a", dot: "#c4714a" },
  balance: { bg: "#f5f0f8", text: "#7a5c9a", dot: "#9b7cb6" },
  supine: { bg: "#fdf8f0", text: "#8a6c30", dot: "#d4a85a" },
  inversion: { bg: "#f0f5f8", text: "#3a6878", dot: "#5a8fa0" },
};

const CATEGORY_ICONS = {
  standing: "🌲",
  seated: "🪷",
  balance: "🌙",
  supine: "☀️",
  inversion: "🌊",
};

let stylesInjected = false;

export default function PoseCard({ pose, onClick }) {
  const styleRef = useRef(null);

  useEffect(() => {
    if (!stylesInjected) {
      const el = document.createElement("style");
      el.textContent = STYLES;
      document.head.appendChild(el);
      styleRef.current = el;
      stylesInjected = true;
    }
  }, []);

  const cat = pose.category?.toLowerCase();
  const colors = CATEGORY_STYLES[cat] || CATEGORY_STYLES.standing;
  const catIcon = CATEGORY_ICONS[cat] || "🧘";

  return (
    <div
      className={`pose-card${!onClick ? " pose-card-static" : ""}`}
      onClick={() => onClick?.(pose)}
    >
      {/* Image */}
      <div className="pose-img-wrap">
        {pose.imageUrl ? (
          <img src={pose.imageUrl} alt={pose.displayName} />
        ) : (
          <div className="pose-img-placeholder">
            <span className="pose-img-icon">{catIcon}</span>
          </div>
        )}
        <div className="pose-img-shimmer" />
      </div>

      {/* Body */}
      <div className="pose-body">
        <p className="pose-name">{pose.displayName}</p>

        {pose.category && (
          <span
            className="pose-badge"
            style={{ background: colors.bg, color: colors.text }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: colors.dot,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {pose.category}
          </span>
        )}

        {pose.description && <p className="pose-desc">{pose.description}</p>}

        {(pose.sanskritName || pose.difficulty) && (
          <div className="pose-footer">
            {pose.sanskritName && <span>{pose.sanskritName}</span>}
            {pose.sanskritName && pose.difficulty && (
              <div className="pose-footer-dot" />
            )}
            {pose.difficulty && (
              <span style={{ textTransform: "capitalize" }}>
                {pose.difficulty}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
