import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float1 {
    0%,100% { transform: translateY(0px)   rotate(0deg); }
    50%      { transform: translateY(-18px) rotate(4deg); }
  }
  @keyframes float2 {
    0%,100% { transform: translateY(0px)   rotate(0deg); }
    50%      { transform: translateY(14px)  rotate(-3deg); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }

  .auth-input {
    width: 100%;
    box-sizing: border-box;
    padding: 13px 16px;
    border: 1.5px solid #E2E8E3;
    border-radius: 12px;
    font-size: 0.88rem;
    font-family: 'Outfit', sans-serif;
    color: #2D2D2D;
    background: #FAFAF7;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .auth-input::placeholder { color: #c4bfb4; }
  .auth-input:focus {
    border-color: #6B8F71;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(107,143,113,0.12);
  }
  .auth-input:hover:not(:focus) { border-color: #b8c9ba; }

  .auth-btn {
    width: 100%;
    padding: 13px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
    font-size: 0.88rem;
    letter-spacing: 0.03em;
    cursor: pointer;
    background: #6B8F71;
    color: #fff;
    transition: background 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .auth-btn:hover:not(:disabled) {
    background: #5a7d60;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(107,143,113,0.28);
  }
  .auth-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .auth-link {
    color: #6B8F71;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.15s;
  }
  .auth-link:hover { color: #C4714A; }

  .error-shake { animation: shake 0.4s ease; }
`;

/* ─── decorative background orbs ──────────────────────────────────────── */
function Orbs() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "-80px",
          right: "-80px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(107,143,113,0.13) 0%, transparent 70%)",
          animation: "float1 8s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-60px",
          left: "-60px",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(196,113,74,0.10) 0%, transparent 70%)",
          animation: "float2 10s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "45%",
          left: "5%",
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(107,143,113,0.07) 0%, transparent 70%)",
          animation: "float1 12s ease-in-out infinite 2s",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </>
  );
}

/* ─── spinner ──────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <div
      style={{
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.35)",
        borderTopColor: "#fff",
        animation: "spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

/* ─── field wrapper with label ────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        style={{
          fontSize: "0.74rem",
          fontWeight: 600,
          color: "#8a9e8d",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════════════════════ */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>

      {/* full-page canvas */}
      <div
        style={{
          minHeight: "100vh",
          background: "#FAFAF7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Orbs />

        {/* card */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "400px",
            background: "#fff",
            borderRadius: "24px",
            padding: "2.5rem 2.25rem",
            boxShadow:
              "0 4px 40px rgba(45,45,45,0.10), 0 1px 4px rgba(45,45,45,0.06)",
            animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* brand mark */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #F0F4F1 0%, #E4EDE5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                margin: "0 auto 1rem",
                boxShadow: "0 2px 8px rgba(107,143,113,0.18)",
              }}
            >
              🪷
            </div>
            <h2
              style={{
                margin: "0 0 6px",
                fontFamily: "'DM Serif Display', serif",
                fontWeight: 400,
                fontSize: "1.65rem",
                color: "#2D2D2D",
              }}
            >
              Welcome back
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "#b0aa9f",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Sign in to continue your practice
            </p>
          </div>

          {/* form */}
          <form
            onSubmit={handle}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <Field label="Email">
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </Field>

            <Field label="Password">
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </Field>

            {/* error */}
            {error && (
              <div
                className={shake ? "error-shake" : ""}
                style={{
                  background: "#FDF6F2",
                  border: "1px solid #f0c8b5",
                  borderRadius: "10px",
                  padding: "9px 13px",
                  fontSize: "0.8rem",
                  color: "#C4714A",
                  fontWeight: 500,
                  fontFamily: "'Outfit', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
              style={{ marginTop: "4px" }}
            >
              {loading ? (
                <>
                  <Spinner /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "1.5rem 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#EDF0EC" }} />
            <span
              style={{
                fontSize: "0.72rem",
                color: "#c4bfb4",
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              NEW HERE?
            </span>
            <div style={{ flex: 1, height: "1px", background: "#EDF0EC" }} />
          </div>

          <p
            style={{
              margin: 0,
              textAlign: "center",
              fontSize: "0.83rem",
              color: "#b0aa9f",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
