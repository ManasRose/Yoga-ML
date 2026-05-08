import { useState, useRef } from "react";
import api from "../api/api";
import CorrectionPanel from "../components/CorrectionPanel";
import PoseSelector from "../components/PoseSelector";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes scanline {
    0%   { top: 0%; opacity: 1; }
    90%  { top: 100%; opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes pulse-border {
    0%, 100% { border-color: rgba(107,143,113,0.4); }
    50%       { border-color: rgba(107,143,113,0.9); }
  }
  @keyframes resultSlide {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .drop-zone {
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }
  .drop-zone:hover {
    border-color: #6B8F71 !important;
    background: #F5F8F5 !important;
  }
  .drop-zone.drag-over {
    border-color: #6B8F71 !important;
    background: #EEF4EF !important;
    transform: scale(1.005);
  }
  .drop-zone.analysing {
    animation: pulse-border 1.4s ease-in-out infinite;
  }

  .choose-btn {
    transition: background 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
  }
  .choose-btn:hover {
    background: #5a7d60 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(107,143,113,0.28);
  }

  .clear-btn {
    transition: background 0.15s ease, color 0.15s ease;
  }
  .clear-btn:hover {
    background: #FDF6F2 !important;
    color: #C4714A !important;
    border-color: #f0c8b5 !important;
  }
`;

/* ─── scanning overlay ──────────────────────────────────────────────── */
function ScanOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(250,250,247,0.82)",
        backdropFilter: "blur(2px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        zIndex: 2,
        borderRadius: "inherit",
      }}
    >
      {/* animated scan line */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "3px",
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: "inherit",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "10%",
            right: "10%",
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, #6B8F71, transparent)",
            animation: "scanline 1.6s ease-in-out infinite",
          }}
        />
      </div>

      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: "3px solid #EDF0EC",
          borderTopColor: "#6B8F71",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            margin: "0 0 3px",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: "#2D2D2D",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Analysing pose…
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            color: "#b0aa9f",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          This usually takes a moment
        </p>
      </div>
    </div>
  );
}

/* ─── empty drop zone content ──────────────────────────────────────── */
function DropZoneEmpty({ isDragging }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        padding: "3rem 2rem",
        transition: "transform 0.2s ease",
        transform: isDragging ? "scale(1.04)" : "scale(1)",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          background: isDragging ? "#EEF4EF" : "#F0F4F1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.8rem",
          transition: "background 0.2s ease",
          boxShadow: isDragging ? "0 4px 20px rgba(107,143,113,0.2)" : "none",
        }}
      >
        {isDragging ? "🧘" : "🖼️"}
      </div>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            margin: "0 0 4px",
            fontWeight: 600,
            fontSize: "0.92rem",
            color: "#2D2D2D",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {isDragging ? "Release to analyse" : "Drop your image here"}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            color: "#b0aa9f",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          JPG, PNG, or video — or click{" "}
          <span style={{ color: "#6B8F71", fontWeight: 600 }}>Choose file</span>{" "}
          above
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   UPLOAD
══════════════════════════════════════════════════════════════════════ */
export default function Upload() {
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [targetPose, setTargetPose] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResult(null);
    setError("");

    const form = new FormData();
    form.append("file", file);
    if (targetPose) form.append("targetPose", targetPose);

    try {
      const { data } = await api.post("/analyse/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Analysis failed. Please try another image.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clearAll = () => {
    setPreview(null);
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <style>{css}</style>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem 4rem",
          fontFamily: "'Outfit', sans-serif",
          animation: "fadeUp 0.45s ease both",
        }}
      >
        {/* ── Header ── */}
        <div style={{ marginBottom: "1.75rem" }}>
          <p
            style={{
              margin: "0 0 2px",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#6B8F71",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Image analysis
          </p>
          <h2
            style={{
              margin: "0 0 6px",
              fontFamily: "'DM Serif Display', serif",
              fontWeight: 400,
              fontSize: "1.7rem",
              color: "#2D2D2D",
            }}
          >
            Analyse a Pose Image
          </h2>
          <p style={{ margin: 0, fontSize: "0.83rem", color: "#b0aa9f" }}>
            Upload a photo or video and get instant form feedback.
          </p>
        </div>

        {/* ── Controls row ── */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "1.25rem",
          }}
        >
          <PoseSelector value={targetPose} onChange={setTargetPose} />

          <div
            style={{
              width: "1px",
              height: "28px",
              background: "#EDF0EC",
              flexShrink: 0,
            }}
          />

          <button
            className="choose-btn"
            onClick={() => fileRef.current.click()}
            style={{
              padding: "9px 20px",
              borderRadius: "99px",
              background: "#6B8F71",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <span>📁</span> Choose file
          </button>

          {preview && !loading && (
            <button
              className="clear-btn"
              onClick={clearAll}
              style={{
                padding: "9px 16px",
                borderRadius: "99px",
                background: "transparent",
                color: "#b0aa9f",
                border: "1px solid #EDF0EC",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 500,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Clear
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {/* ── Main area: drop zone + result panel ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: result ? "1fr 300px" : "1fr",
            gap: "20px",
            alignItems: "start",
            transition: "grid-template-columns 0.3s ease",
          }}
        >
          {/* Drop zone */}
          <div
            className={`drop-zone${isDragging ? " drag-over" : ""}${loading ? " analysing" : ""}`}
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => !preview && fileRef.current.click()}
            style={{
              border: `2px dashed ${isDragging ? "#6B8F71" : "#D8E4D9"}`,
              borderRadius: "20px",
              minHeight: "280px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: preview ? "default" : "pointer",
              overflow: "hidden",
              position: "relative",
              background: preview ? "#000" : "#FAFAF7",
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "480px",
                  objectFit: "contain",
                  display: "block",
                  borderRadius: "18px",
                  opacity: loading ? 0.45 : 1,
                  transition: "opacity 0.3s ease",
                }}
              />
            ) : (
              <DropZoneEmpty isDragging={isDragging} />
            )}

            {loading && <ScanOverlay />}
          </div>

          {/* Result panel */}
          {result && (
            <div
              style={{
                borderRadius: "20px",
                background: "#fff",
                boxShadow: "0 2px 16px rgba(45,45,45,0.07)",
                overflow: "hidden",
                animation: "resultSlide 0.45s cubic-bezier(0.22,1,0.36,1) both",
                position: "sticky",
                top: "76px",
              }}
            >
              <div
                style={{
                  padding: "1rem 1.2rem",
                  borderBottom: "1px solid #EDF0EC",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#6B8F71",
                  }}
                />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "#2D2D2D",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Analysis results
                </span>
              </div>
              <CorrectionPanel
                label={result.label}
                confidence={result.confidence}
                score={result.score}
                corrections={result.corrections}
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: "1rem",
              background: "#FDF6F2",
              border: "1px solid #f0c8b5",
              borderRadius: "12px",
              padding: "11px 15px",
              fontSize: "0.82rem",
              color: "#C4714A",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              animation: "fadeUp 0.3s ease both",
            }}
          >
            <span>⚠</span> {error}
          </div>
        )}
      </div>
    </>
  );
}
