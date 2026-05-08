import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap');

  .pr-loader {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    background: #fafaf7;
    z-index: 999;
    animation: pr-fade-in 0.3s ease both;
  }

  @keyframes pr-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .pr-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .pr-icon-wrap {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, #6b8f71 0%, #4a7c52 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    box-shadow: 0 4px 16px rgba(107,143,113,0.25);
    animation: pr-breathe 2.4s ease-in-out infinite;
  }

  @keyframes pr-breathe {
    0%, 100% { transform: scale(1);   box-shadow: 0 4px 16px rgba(107,143,113,0.25); }
    50%       { transform: scale(1.06); box-shadow: 0 8px 28px rgba(107,143,113,0.35); }
  }

  .pr-brand {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 1.2rem;
    color: #2D2D2D;
    letter-spacing: -0.01em;
  }

  .pr-brand span {
    color: #6b8f71;
    font-style: italic;
  }

  .pr-dots {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .pr-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6b8f71;
    animation: pr-dot-pulse 1.2s ease-in-out infinite;
    opacity: 0.3;
  }

  .pr-dot:nth-child(1) { animation-delay: 0s; }
  .pr-dot:nth-child(2) { animation-delay: 0.2s; }
  .pr-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes pr-dot-pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.3); }
  }

  .pr-tagline {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    color: #b0bcb2;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 500;
  }
`;

let stylesInjected = false;

function LoadingScreen() {
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

  return (
    <div className="pr-loader">
      <div className="pr-logo">
        <div className="pr-icon-wrap">🌿</div>
        <div className="pr-brand">
          Asana<span> AI</span>
        </div>
      </div>
      <div className="pr-dots">
        <div className="pr-dot" />
        <div className="pr-dot" />
        <div className="pr-dot" />
      </div>
      <p className="pr-tagline">Finding your balance</p>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}
