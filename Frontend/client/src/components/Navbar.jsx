import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        height: "56px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        to="/dashboard"
        style={{
          fontWeight: 600,
          fontSize: "1.1rem",
          color: "#111",
          textDecoration: "none",
        }}
      >
        🧘 Yoga Pose Detection / Correction
      </Link>
      {user && (
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
            fontSize: "0.9rem",
          }}
        >
          <Link
            to="/live"
            style={{
              color: "#4f46e5",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Live
          </Link>
          <Link
            to="/upload"
            style={{
              color: "#4f46e5",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Upload
          </Link>
          <Link
            to="/dashboard"
            style={{
              color: "#4f46e5",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "4px 12px",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
