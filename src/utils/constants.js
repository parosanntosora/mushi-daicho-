// 世代の定番候補（自由入力も可）
export const GENERATION_PRESETS = ["WD", "F1", "F2", "F3", "F4", "F5以降"];

export const SEX_OPTIONS = [
  { value: "male", label: "オス" },
  { value: "female", label: "メス" },
  { value: "unknown", label: "不明" },
];

export const STATUS_OPTIONS = [
  { value: "alive", label: "生存中", color: "var(--color-status-alive)", soft: "var(--color-status-alive-soft)" },
  { value: "dead", label: "死亡", color: "var(--color-status-dead)", soft: "var(--color-status-dead-soft)" },
  { value: "transferred", label: "譲渡済み", color: "var(--color-status-transferred)", soft: "var(--color-status-transferred-soft)" },
  { value: "sold", label: "売却済み", color: "var(--color-status-sold)", soft: "var(--color-status-sold-soft)" },
];

export function statusMeta(value) {
  return STATUS_OPTIONS.find((s) => s.value === value) || STATUS_OPTIONS[0];
}

export function sexLabel(value) {
  return SEX_OPTIONS.find((s) => s.value === value)?.label || "不明";
}

export function sexSymbol(value) {
  if (value === "male") return "♂";
  if (value === "female") return "♀";
  return "—";
}

// ラベル未入力の個体でも区別がつくよう、表示名を組み立てる
export function individualDisplayName(ind) {
  if (!ind) return "不明な個体";
  if (ind.label?.trim()) return ind.label.trim();
  const parts = [ind.species?.trim() || "種類未設定"];
  if (ind.generation) parts.push(ind.generation);
  return parts.join(" ");
}

export function individualSubLabel(ind) {
  if (!ind) return "";
  const bits = [];
  if (ind.sex) bits.push(sexSymbol(ind.sex));
  if (ind.acquiredDate) bits.push(ind.acquiredDate);
  return bits.join(" ・ ");
}
