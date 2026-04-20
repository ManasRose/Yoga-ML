import { useEffect, useRef } from "react";

const CONNECTIONS = [
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16], // arms
  [11, 12],
  [23, 24], // shoulders, hips
  [11, 23],
  [12, 24], // torso
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28], // legs
];

export default function SkeletonCanvas({ keypoints, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !keypoints?.length) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 2;
    CONNECTIONS.forEach(([a, b]) => {
      const kpA = keypoints[a],
        kpB = keypoints[b];
      if (!kpA || !kpB || kpA.visibility < 0.5 || kpB.visibility < 0.5) return;
      ctx.beginPath();
      ctx.moveTo(kpA.x * width, kpA.y * height);
      ctx.lineTo(kpB.x * width, kpB.y * height);
      ctx.stroke();
    });

    // Draw joints
    keypoints.forEach((kp) => {
      if (!kp || kp.visibility < 0.5) return;
      ctx.beginPath();
      ctx.arc(kp.x * width, kp.y * height, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#818cf8";
      ctx.fill();
    });
  }, [keypoints, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    />
  );
}
