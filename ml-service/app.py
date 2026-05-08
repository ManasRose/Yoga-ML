import os
import cv2
import math
import json
import base64
import numpy as np
import joblib
import mediapipe as mp
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE      = os.path.dirname(__file__)
MODELS    = os.path.join(BASE, "models")

MODEL_PATH  = os.path.join(MODELS, "yoga_svm_82class.pkl")
SCALER_PATH = os.path.join(MODELS, "yoga_scaler_82class.pkl")
LABEL_MAP   = os.path.join(MODELS, "label_map_82.json")

model  = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
with open(LABEL_MAP) as f:
    label_map = json.load(f)

# ── Use legacy solutions API (no OpenGL needed) ────────
mp_pose = mp.solutions.pose
pose_detector = mp_pose.Pose(
    static_image_mode=True,
    model_complexity=1,
    enable_segmentation=False,
    min_detection_confidence=0.5,
)
print("✅ Model and MediaPipe loaded.")


def angle(a, b, c):
    ax, ay = a[0] - b[0], a[1] - b[1]
    cx, cy = c[0] - b[0], c[1] - b[1]
    dot = ax * cx + ay * cy
    mag = (math.hypot(ax, ay) * math.hypot(cx, cy)) + 1e-6
    return math.degrees(math.acos(max(-1, min(1, dot / mag))))


def get_features(landmarks):
    coords = []
    pts = []
    for lm in landmarks:
        coords.extend([lm.x, lm.y])
        pts.append((lm.x, lm.y))
    angles = [
        angle(pts[11], pts[13], pts[15]),
        angle(pts[12], pts[14], pts[16]),
        angle(pts[13], pts[11], pts[23]),
        angle(pts[14], pts[12], pts[24]),
        angle(pts[11], pts[23], pts[25]),
        angle(pts[12], pts[24], pts[26]),
        angle(pts[23], pts[25], pts[27]),
        angle(pts[24], pts[26], pts[28]),
    ]
    return np.array(coords + angles).reshape(1, -1)


def get_keypoints(landmarks):
    return [
        {
            "x": lm.x,
            "y": lm.y,
            "z": lm.z,
            "visibility": lm.visibility,
        }
        for lm in landmarks
    ]


def generate_corrections(landmarks, pred_label, target_pose, confidence):
    corrections = []
    pts = [(lm.x, lm.y) for lm in landmarks]

    if confidence < 0.5:
        corrections.append({"severity": "high", "message": "Move to a well-lit area and ensure full body is visible."})

    if target_pose and pred_label.lower() != target_pose.lower():
        corrections.append({"severity": "medium", "message": f"Detected '{pred_label}' but target is '{target_pose}'. Adjust your pose."})

    left_elbow_ang  = angle(pts[11], pts[13], pts[15])
    right_elbow_ang = angle(pts[12], pts[14], pts[16])
    left_knee_ang   = angle(pts[11], pts[23], pts[25])
    right_knee_ang  = angle(pts[12], pts[24], pts[26])

    if left_elbow_ang < 150:
        corrections.append({"severity": "medium", "message": "Extend your left arm more fully."})
    if right_elbow_ang < 150:
        corrections.append({"severity": "medium", "message": "Extend your right arm more fully."})
    if left_knee_ang < 160:
        corrections.append({"severity": "low", "message": "Try to straighten your left leg."})
    if right_knee_ang < 160:
        corrections.append({"severity": "low", "message": "Try to straighten your right leg."})

    return corrections if corrections else [{"severity": "low", "message": "Great form! Hold the pose."}]


def decode_image(image_bytes):
    arr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def run_inference(img_bgr, target_pose=None):
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    result  = pose_detector.process(img_rgb)

    if not result.pose_landmarks:
        return None

    landmarks  = result.pose_landmarks.landmark
    feat       = get_features(landmarks)
    feat_scaled = scaler.transform(feat)

    pred_id    = int(model.predict(feat_scaled)[0])
    probs      = model.predict_proba(feat_scaled)[0]
    confidence = float(probs.max())
    label      = label_map.get(str(pred_id), str(pred_id)).replace("_", " ")
    score      = round(confidence * 100)

    keypoints   = get_keypoints(landmarks)
    corrections = generate_corrections(landmarks, label, target_pose, confidence)

    return {
        "label":       label,
        "confidence":  round(confidence, 4),
        "score":       score,
        "keypoints":   keypoints,
        "corrections": corrections,
    }


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/predict/frame", methods=["POST"])
def predict_frame():
    data = request.get_json()
    if not data or "image" not in data:
        return jsonify({"error": "Missing 'image' field"}), 400
    try:
        img_bytes = base64.b64decode(data["image"])
        img_bgr   = decode_image(img_bytes)
        target    = data.get("targetPose") or None
        result    = run_inference(img_bgr, target)
        if result is None:
            return jsonify({"error": "No pose detected"}), 422
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict/upload", methods=["POST"])
def predict_upload():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    try:
        file      = request.files["file"]
        img_bytes = file.read()
        img_bgr   = decode_image(img_bytes)
        target    = request.form.get("targetPose") or None
        result    = run_inference(img_bgr, target)
        if result is None:
            return jsonify({"error": "No pose detected"}), 422
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)

app.add_url_rule("/analyse/frame",  view_func=predict_frame,  methods=["POST"])
app.add_url_rule("/analyse/upload", view_func=predict_upload, methods=["POST"])