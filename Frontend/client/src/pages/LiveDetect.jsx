import { useRef, useEffect, useState, useCallback } from "react";
import api from "../api/api";
import SkeletonCanvas from "../components/SkeletonCanvas";
import CorrectionPanel from "../components/CorrectionPanel";
import PoseSelector from "../components/PoseSelector";

const FRAME_INTERVAL_MS = 600;

/* ─── keyframes ─────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    70%  { transform: scale(1.55); opacity: 0; }
    100% { transform: scale(1.55); opacity: 0; }
  }
  @keyframes breathe {
    0%, 100% { opacity: 0.35; transform: scale(1); }
    50%       { opacity: 0.65; transform: scale(1.04); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .live-start-btn {
    transition: background 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
  }
  .live-start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(107,143,113,0.30);
  }
  .live-stop-btn {
    transition: background 0.2s ease, transform 0.2s ease;
  }
  .live-stop-btn:hover {
    background: #a85a36 !important;
    transform: translateY(-1px);
  }
`;

/* ─── recording dot ─────────────────────────────────────────────────────── */
function RecordingDot() {
  return (
    <div
      style={{
        position: "relative",
        width: "10px",
        height: "10px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#C4714A",
          animation: "pulse-ring 1.6s ease-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "1px",
          borderRadius: "50%",
          background: "#C4714A",
        }}
      />
    </div>
  );
}

/* ─── camera-off overlay ────────────────────────────────────────────────── */
function CameraOffOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        background: "linear-gradient(160deg, #1a1f1a 0%, #0f1410 100%)",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(107,143,113,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "breathe 3s ease-in-out infinite",
          fontSize: "1.8rem",
        }}
      >
        🧘
      </div>
      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.35)",
          fontSize: "0.8rem",
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Camera off
      </p>
    </div>
  );
}

/* ─── session timer ─────────────────────────────────────────────────────── */
function SessionTimer({ running }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) {
      setSecs(0);
      return;
    }
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <span
      style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: "0.95rem",
        color: running ? "#6B8F71" : "#b0aa9f",
        letterSpacing: "0.04em",
      }}
    >
      {mm}:{ss}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LIVE DETECT
══════════════════════════════════════════════════════════════════════ */
export default function LiveDetect() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [targetPose, setTargetPose] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState("");

  const startSession = async () => {
    const { data } = await api.post("/sessions", { title: "Live session" });
    setSessionId(data._id);
    return data._id;
  };

  const captureAndSend = useCallback(
    async (sid) => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
      try {
        const { data } = await api.post("/analyse/frame", {
          imageBase64,
          targetPose: targetPose || null,
        });
        setResult(data);
        if (sid && data.label) {
          api
            .post("/records", {
              sessionId: sid,
              detectedLabel: data.label,
              confidenceScore: data.confidence,
              overallScore: data.score,
              keypoints: data.keypoints,
              corrections: data.corrections,
            })
            .catch(() => {});
        }
      } catch {
        /* skip bad frames */
      }
    },
    [targetPose],
  );

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const sid = await startSession();
      setIsRunning(true);
      intervalRef.current = setInterval(
        () => captureAndSend(sid),
        FRAME_INTERVAL_MS,
      );
    } catch {
      setError("Camera permission denied. Please allow camera access.");
    }
  };

  const stopCamera = async () => {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRunning(false);
    if (sessionId) {
      await api.patch(`/sessions/${sessionId}/end`).catch(() => {});
      setSessionId(null);
    }
  };

  useEffect(
    () => () => {
      clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  return (
    <>
      <style>{css}</style>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "2rem 1.5rem",
          fontFamily: "'Outfit', sans-serif",
          animation: "fadeUp 0.45s ease both",
        }}
      >
        {/* ── Page title ── */}
        <div style={{ marginBottom: "1.5rem" }}>
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
            Live detection
          </p>
          <h2
            style={{
              margin: 0,
              fontFamily: "'DM Serif Display', serif",
              fontWeight: 400,
              fontSize: "1.7rem",
              color: "#2D2D2D",
            }}
          >
            Real-time Pose Analysis
          </h2>
        </div>

        {/* ── Main two-column layout ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* ── LEFT: camera ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Camera viewport */}
            <div
              style={{
                position: "relative",
                borderRadius: "20px",
                overflow: "hidden",
                aspectRatio: "4/3",
                background: "#0f1410",
                boxShadow: isRunning
                  ? "0 0 0 2px #6B8F71, 0 16px 48px rgba(107,143,113,0.18)"
                  : "0 8px 32px rgba(0,0,0,0.18)",
                transition: "box-shadow 0.4s ease",
              }}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)",
                  display: "block",
                }}
              />
              {result?.keypoints && (
                <SkeletonCanvas keypoints={result.keypoints} />
              )}
              {!isRunning && <CameraOffOverlay />}

              {/* Live badge */}
              {isRunning && (
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    background: "rgba(10,14,10,0.65)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "99px",
                    padding: "5px 12px",
                    animation: "slideIn 0.3s ease both",
                  }}
                >
                  <RecordingDot />
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#fff",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Live
                  </span>
                </div>
              )}

              {/* Timer overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: "rgba(10,14,10,0.55)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "99px",
                  padding: "5px 14px",
                }}
              >
                <SessionTimer running={isRunning} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "#FDF6F2",
                  border: "1px solid #f0c8b5",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.82rem",
                  color: "#C4714A",
                  fontWeight: 500,
                }}
              >
                ⚠ {error}
              </div>
            )}

            {/* Controls bar */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {isRunning ? (
                <button
                  className="live-stop-btn"
                  onClick={stopCamera}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "99px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: "#C4714A",
                    color: "#fff",
                    border: "none",
                    fontSize: "0.85rem",
                    fontFamily: "'Outfit', sans-serif",
                    letterSpacing: "0.02em",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      background: "#fff",
                      borderRadius: "2px",
                      flexShrink: 0,
                    }}
                  />
                  Stop session
                </button>
              ) : (
                <button
                  className="live-start-btn"
                  onClick={startCamera}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "99px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: "#6B8F71",
                    color: "#fff",
                    border: "none",
                    fontSize: "0.85rem",
                    fontFamily: "'Outfit', sans-serif",
                    letterSpacing: "0.02em",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>▶</span>
                  Start camera
                </button>
              )}

              {/* Divider */}
              <div
                style={{ width: "1px", height: "28px", background: "#EDF0EC" }}
              />

              <PoseSelector value={targetPose} onChange={setTargetPose} />
            </div>

            {/* Hint */}
            {!isRunning && (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.78rem",
                  color: "#c4bfb4",
                  fontFamily: "'Outfit', sans-serif",
                  animation: "fadeUp 0.5s ease both 0.2s",
                }}
              >
                Choose a target pose (or leave on auto-detect), then press{" "}
                <strong style={{ color: "#6B8F71" }}>Start camera</strong> to
                begin.
              </p>
            )}
          </div>

          {/* ── RIGHT: correction panel ── */}
          <div
            style={{
              borderRadius: "20px",
              background: "#fff",
              boxShadow: "0 2px 16px rgba(45,45,45,0.07)",
              overflow: "hidden",
              animation: "fadeUp 0.5s ease both 0.12s",
              position: "sticky",
              top: "76px" /* stick below navbar */,
            }}
          >
            {/* Panel header */}
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
                  background: isRunning ? "#6B8F71" : "#c4bfb4",
                  transition: "background 0.3s",
                }}
              />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  fontFamily: "'Outfit', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "#2D2D2D",
                }}
              >
                Real-time feedback
              </span>
            </div>

            <CorrectionPanel
              label={result?.label}
              confidence={result?.confidence}
              score={result?.score}
              corrections={result?.corrections}
            />
          </div>
        </div>
      </div>
    </>
  );
}
