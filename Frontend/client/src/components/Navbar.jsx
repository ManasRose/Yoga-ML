import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

  .nav-root {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2.5rem;
    height: 62px;
    background: rgba(250, 250, 247, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(107, 143, 113, 0.12);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .nav-brand-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #6b8f71 0%, #4a7c52 100%);
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    box-shadow: 0 2px 8px rgba(107,143,113,0.25);
  }

  .nav-brand-text {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 1.15rem;
    color: #2D2D2D;
    letter-spacing: -0.01em;
  }

  .nav-brand-text span {
    color: #6b8f71;
    font-style: italic;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .nav-link {
    position: relative;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    color: #6b7280;
    text-decoration: none;
    padding: 6px 14px;
    border-radius: 8px;
    letter-spacing: 0.01em;
    transition: color 0.2s, background 0.2s;
  }

  .nav-link:hover {
    color: #2D2D2D;
    background: rgba(107,143,113,0.08);
  }

  .nav-link.active {
    color: #4a7c52;
    background: rgba(107,143,113,0.12);
    font-weight: 600;
  }

  .nav-divider {
    width: 1px;
    height: 20px;
    background: #e5e7e5;
    margin: 0 0.5rem;
  }

  .nav-user {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    color: #9ca89e;
  }

  .nav-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f0f4f1, #d4e8d6);
    border: 1.5px solid rgba(107,143,113,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
    color: #4a7c52;
    letter-spacing: 0.03em;
  }

  .nav-logout {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    color: #9ca89e;
    background: none;
    border: 1px solid #e5e7e5;
    border-radius: 8px;
    padding: 5px 12px;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }

  .nav-logout:hover {
    color: #c4714a;
    border-color: rgba(196,113,74,0.3);
    background: rgba(196,113,74,0.05);
  }
`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "YO";

  return (
    <>
      <style>{STYLES}</style>
      <nav className="nav-root">
        {/* Brand */}
        <Link to="/dashboard" className="nav-brand">
          <div className="nav-brand-icon">🌿</div>
          <span className="nav-brand-text">
            Asana<span> AI</span>
          </span>
        </Link>

        {/* Nav links + user */}
        {user && (
          <div className="nav-links">
            <Link to="/live" className={isActive("/live")}>
              Live
            </Link>
            <Link to="/upload" className={isActive("/upload")}>
              Upload
            </Link>
            <Link to="/dashboard" className={isActive("/dashboard")}>
              Dashboard
            </Link>

            <div className="nav-divider" />

            <div className="nav-user">
              <div className="nav-avatar">{initials}</div>
            </div>

            <button className="nav-logout" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
