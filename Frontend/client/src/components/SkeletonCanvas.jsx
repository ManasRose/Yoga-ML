import { useEffect, useRef } from "react";

// MediaPipe pose connections
const CONNECTIONS = [
  [11, 13],
  [13, 15], // left arm
  [12, 14],
  [14, 16], // right arm
  [11, 12], // shoulders
  [23, 24], // hips
  [11, 23],
  [12, 24], // torso
  [23, 25],
  [25, 27], // left leg
  [24, 26],
  [26, 28], // right leg
];

// Color per body region
const CONNECTION_COLORS = {
  arm: "rgba(107,143,113,0.85)", // sage green — arms
  torso: "rgba(196,113,74,0.75)", // terracotta — torso
  leg: "rgba(107,143,113,0.7)", // sage green — legs
  hip: "rgba(212,168,90,0.8)", // amber — hips
};

const CONNECTION_META = [
  { pair: [11, 13], region: "arm" },
  { pair: [13, 15], region: "arm" },
  { pair: [12, 14], region: "arm" },
  { pair: [14, 16], region: "arm" },
  { pair: [11, 12], region: "torso" },
  { pair: [23, 24], region: "hip" },
  { pair: [11, 23], region: "torso" },
  { pair: [12, 24], region: "torso" },
  { pair: [23, 25], region: "leg" },
  { pair: [25, 27], region: "leg" },
  { pair: [24, 26], region: "leg" },
  { pair: [26, 28], region: "leg" },
];

export default function SkeletonCanvas({ keypoints }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !keypoints?.length) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const px = (kp) => kp.x * canvas.width;
    const py = (kp) => kp.y * canvas.height;
    const visible = (kp) => kp && (kp.visibility ?? 1) > 0.3;

    // Draw connections with region colors + glow
    CONNECTION_META.forEach(({ pair: [a, b], region }) => {
      const kpA = keypoints[a],
        kpB = keypoints[b];
      if (!visible(kpA) || !visible(kpB)) return;

      const color = CONNECTION_COLORS[region];

      // Glow pass
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.12;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(px(kpA), py(kpA));
      ctx.lineTo(px(kpB), py(kpB));
      ctx.stroke();
      ctx.restore();

      // Main line
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(px(kpA), py(kpA));
      ctx.lineTo(px(kpB), py(kpB));
      ctx.stroke();
      ctx.restore();
    });

    // Draw joints
    keypoints.forEach((kp, i) => {
      if (!visible(kp)) return;

      const cx = px(kp),
        cy = py(kp);

      // Outer glow ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(107,143,113,0.1)";
      ctx.fill();
      ctx.restore();

      // White border
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.restore();

      // Colored fill
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
      ctx.fillStyle =
        i >= 23
          ? "rgba(107,143,113,0.9)" // lower body — sage
          : i >= 11
            ? "rgba(196,113,74,0.9)" // upper body — terracotta
            : "rgba(212,168,90,0.9)"; // face — amber
      ctx.fill();
      ctx.restore();
    });
  }, [keypoints]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        transform: "scaleX(-1)",
      }}
    />
  );
}
