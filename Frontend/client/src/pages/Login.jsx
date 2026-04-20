import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "380px", margin: "5rem auto", padding: "0 1rem" }}>
      <h2
        style={{ fontWeight: 600, marginBottom: "1.5rem", textAlign: "center" }}
      >
        Sign in to Yoga Pose Detector
      </h2>
      <form
        onSubmit={handle}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          style={{
            padding: "10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "0.9rem",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          style={{
            padding: "10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "0.9rem",
          }}
        />
        {error && (
          <p style={{ color: "#dc2626", fontSize: "0.83rem", margin: 0 }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          marginTop: "1rem",
          color: "#6b7280",
        }}
      >
        No account?{" "}
        <Link to="/register" style={{ color: "#4f46e5" }}>
          Register
        </Link>
      </p>
    </div>
  );
}
