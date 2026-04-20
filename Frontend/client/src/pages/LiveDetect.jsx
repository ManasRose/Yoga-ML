import { useRef, useEffect, useState, useCallback } from "react";
import api from "../api/api";
import SkeletonCanvas from "../components/SkeletonCanvas";
import CorrectionPanel from "../components/CorrectionPanel";
import PoseSelector from "../components/PoseSelector";

const FRAME_INTERVAL_MS = 600;

export default function LiveDetect() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [dims, setDims] = useState({ w: 640, h: 480 });
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

        // Persist record to DB
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
        // silently skip bad frames
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
      const { videoWidth: w, videoHeight: h } = videoRef.current;
      setDims({ w, h });

      const sid = await startSession();
      setIsRunning(true);
      intervalRef.current = setInterval(
        () => captureAndSend(sid),
        FRAME_INTERVAL_MS,
      );
    } catch (e) {
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
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
        padding: "1.5rem",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      {/* Left: Camera */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            position: "relative",
            background: "#000",
            borderRadius: "12px",
            overflow: "hidden",
            aspectRatio: "4/3",
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
            }}
          />
          {result?.keypoints && (
            <SkeletonCanvas
              keypoints={result.keypoints}
              width={dims.w}
              height={dims.h}
            />
          )}
          {!isRunning && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>Camera off</p>
            </div>
          )}
        </div>

        {error && (
          <p
            style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: "8px" }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={isRunning ? stopCamera : startCamera}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              background: isRunning ? "#dc2626" : "#4f46e5",
              color: "#fff",
              border: "none",
              fontSize: "0.9rem",
            }}
          >
            {isRunning ? "Stop" : "Start camera"}
          </button>
          <PoseSelector value={targetPose} onChange={setTargetPose} />
        </div>
      </div>

      {/* Right: Corrections */}
      <div
        style={{
          width: "300px",
          flexShrink: 0,
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          background: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "0.75rem 1rem",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Real-time feedback
        </div>
        <CorrectionPanel
          label={result?.label}
          confidence={result?.confidence}
          score={result?.score}
          corrections={result?.corrections}
        />
      </div>
    </div>
  );
}
