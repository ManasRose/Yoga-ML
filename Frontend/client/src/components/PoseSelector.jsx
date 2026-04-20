import { useApi } from "../hooks/useApi";

export default function PoseSelector({ value, onChange }) {
  const { data: poses, loading } = useApi("/poses");

  if (loading)
    return (
      <select disabled>
        <option>Loading...</option>
      </select>
    );

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        fontSize: "0.85rem",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      <option value="">Auto-detect pose</option>
      {poses?.map((p) => (
        <option key={p.slug} value={p.slug}>
          {p.displayName}
        </option>
      ))}
    </select>
  );
}
