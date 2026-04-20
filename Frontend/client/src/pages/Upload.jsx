import { useState, useRef } from "react";
import api from "../api/api";
import CorrectionPanel from "../components/CorrectionPanel";
import PoseSelector from "../components/PoseSelector";

export default function Upload() {
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [targetPose, setTargetPose] = useState("");
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResult(null);

    const form = new FormData();
    form.append("file", file);
    if (targetPose) form.append("targetPose", targetPose);

    try {
      const { data } = await api.post("/analyse/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (e) {
      alert(e.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1.5rem" }}
    >
      <h2 style={{ fontWeight: 600, marginBottom: "1.5rem" }}>
        Analyse a pose image
      </h2>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <PoseSelector value={targetPose} onChange={setTargetPose} />
        <button
          onClick={() => fileRef.current.click()}
          style={{
            padding: "6px 16px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          Choose file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !preview && fileRef.current.click()}
        style={{
          border: "2px dashed #d1d5db",
          borderRadius: "12px",
          minHeight: "240px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: preview ? "default" : "pointer",
          overflow: "hidden",
          position: "relative",
          background: "#f9fafb",
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              objectFit: "contain",
            }}
          />
        ) : (
          <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
            Drop an image or video here
          </p>
        )}
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              color: "#4f46e5",
            }}
          >
            Analysing…
          </div>
        )}
      </div>

      {result && (
        <div
          style={{
            marginTop: "1.5rem",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1rem",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: 600,
            }}
          >
            Results
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
  );
}
