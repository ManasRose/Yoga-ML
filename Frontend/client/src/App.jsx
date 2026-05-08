import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LiveDetect from "./pages/LiveDetect";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";

/* ─── Global base styles injected once at app root ─────────────────────
   All pages use Outfit as the body font. The warm off-white background
   is set here so it shows even before any page component mounts.
   The Login / Register pages override this with their own full-page
   canvas, so there's no conflict.
──────────────────────────────────────────────────────────────────────── */
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: #FAFAF7;
    color: #2D2D2D;
    font-family: 'Outfit', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* scrollbar — subtle sage tint */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: #C8D9CA;
    border-radius: 99px;
  }
  ::-webkit-scrollbar-thumb:hover { background: #6B8F71; }

  /* remove default button / input outlines in favour of our custom focus rings */
  button:focus-visible {
    outline: 2px solid #6B8F71;
    outline-offset: 2px;
  }
  input:focus-visible { outline: none; }

  /* page-level fade-in so route transitions feel smooth */
  @keyframes pageFade {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .page-enter {
    animation: pageFade 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
`;

function GlobalStyles() {
  return <style>{globalCss}</style>;
}

/* ─── thin page wrapper that triggers the fade animation ─────────────── */
function Page({ children }) {
  return <div className="page-enter">{children}</div>;
}

export default function App() {
  return (
    <>
      <GlobalStyles />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public */}
            <Route
              path="/login"
              element={
                <Page>
                  <Login />
                </Page>
              }
            />
            <Route
              path="/register"
              element={
                <Page>
                  <Register />
                </Page>
              }
            />

            {/* Protected */}
            <Route
              path="/live"
              element={
                <ProtectedRoute>
                  <Page>
                    <LiveDetect />
                  </Page>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Page>
                    <Upload />
                  </Page>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Page>
                    <Dashboard />
                  </Page>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}
