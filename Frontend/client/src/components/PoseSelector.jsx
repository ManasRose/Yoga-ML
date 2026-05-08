import { useEffect, useRef, useState } from "react";
import { useApi } from "../hooks/useApi";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

  .ps-wrap {
    position: relative;
    display: inline-block;
    font-family: 'DM Sans', sans-serif;
  }

  .ps-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px 7px 14px;
    background: #fff;
    border: 1px solid #e0e8e1;
    border-radius: 10px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.83rem;
    font-weight: 500;
    color: #3a4a3c;
    white-space: nowrap;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    min-width: 170px;
    justify-content: space-between;
    user-select: none;
  }

  .ps-trigger:hover {
    border-color: #6b8f71;
    box-shadow: 0 0 0 3px rgba(107,143,113,0.1);
  }

  .ps-trigger.open {
    border-color: #6b8f71;
    box-shadow: 0 0 0 3px rgba(107,143,113,0.12);
    background: #fafaf7;
  }

  .ps-trigger-left {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .ps-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #6b8f71;
    flex-shrink: 0;
    transition: background 0.2s;
  }

  .ps-dot.auto { background: #b0bcb2; }

  .ps-chevron {
    width: 14px;
    height: 14px;
    color: #9ca89e;
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .ps-chevron.open { transform: rotate(180deg); }

  .ps-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 100%;
    background: #fff;
    border: 1px solid #e0e8e1;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(45,45,45,0.1), 0 2px 8px rgba(107,143,113,0.08);
    z-index: 200;
    overflow: hidden;
    animation: ps-drop-in 0.18s cubic-bezier(0.34,1.56,0.64,1) both;
    max-height: 260px;
    display: flex;
    flex-direction: column;
  }

  @keyframes ps-drop-in {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .ps-search {
    padding: 8px 10px;
    border-bottom: 1px solid #f0f4f1;
    flex-shrink: 0;
  }

  .ps-search input {
    width: 100%;
    border: 1px solid #e0e8e1;
    border-radius: 7px;
    padding: 5px 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: #2D2D2D;
    background: #fafaf7;
    outline: none;
    transition: border-color 0.2s;
  }

  .ps-search input:focus {
    border-color: #6b8f71;
  }

  .ps-search input::placeholder { color: #b0bcb2; }

  .ps-list {
    overflow-y: auto;
    flex: 1;
  }

  .ps-list::-webkit-scrollbar { width: 4px; }
  .ps-list::-webkit-scrollbar-track { background: transparent; }
  .ps-list::-webkit-scrollbar-thumb { background: #d4e0d5; border-radius: 4px; }

  .ps-option {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: #3a4a3c;
    cursor: pointer;
    transition: background 0.15s;
    font-weight: 400;
  }

  .ps-option:hover { background: #f0f4f1; }

  .ps-option.selected {
    background: #f0f4f1;
    font-weight: 600;
    color: #4a7c52;
  }

  .ps-option-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6b8f71;
    flex-shrink: 0;
    opacity: 0.5;
  }

  .ps-option.selected .ps-option-dot { opacity: 1; }

  .ps-auto-option {
    border-bottom: 1px solid #f0f4f1;
    color: #6b7880;
    font-style: italic;
  }

  .ps-auto-option .ps-option-dot { background: #b0bcb2; }

  .ps-empty {
    padding: 16px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    color: #b0bcb2;
    text-align: center;
  }

  .ps-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.83rem;
    color: #b0bcb2;
    min-width: 170px;
  }

  .ps-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #e0e8e1;
    border-top-color: #6b8f71;
    border-radius: 50%;
    animation: ps-spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes ps-spin {
    to { transform: rotate(360deg); }
  }
`;

let stylesInjected = false;

export default function PoseSelector({ value, onChange }) {
  const { data: poses, loading } = useApi("/poses");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!stylesInjected) {
      const el = document.createElement("style");
      el.textContent = STYLES;
      document.head.appendChild(el);
      stylesInjected = true;
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div className="ps-wrap">
        <div className="ps-loading">
          <div className="ps-spinner" />
          Loading poses…
        </div>
      </div>
    );
  }

  const selectedPose = poses?.find((p) => p.slug === value);
  const filtered = poses?.filter(
    (p) =>
      !search || p.displayName.toLowerCase().includes(search.toLowerCase()),
  );

  const select = (slug) => {
    onChange(slug);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="ps-wrap" ref={wrapRef}>
      <div
        className={`ps-trigger${open ? " open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="ps-trigger-left">
          <div className={`ps-dot${!value ? " auto" : ""}`} />
          <span>{selectedPose?.displayName || "Auto-detect pose"}</span>
        </div>
        <svg
          className={`ps-chevron${open ? " open" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {open && (
        <div className="ps-dropdown">
          {poses?.length > 6 && (
            <div className="ps-search">
              <input
                autoFocus
                placeholder="Search poses…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          <div className="ps-list">
            {!search && (
              <div
                className={`ps-option ps-auto-option${!value ? " selected" : ""}`}
                onClick={() => select("")}
              >
                <div className="ps-option-dot" />
                Auto-detect pose
              </div>
            )}
            {filtered?.length === 0 && (
              <div className="ps-empty">No poses found</div>
            )}
            {filtered?.map((p) => (
              <div
                key={p.slug}
                className={`ps-option${value === p.slug ? " selected" : ""}`}
                onClick={() => select(p.slug)}
              >
                <div className="ps-option-dot" />
                {p.displayName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
