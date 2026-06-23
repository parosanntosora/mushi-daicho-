import { statusMeta, sexSymbol } from "../../utils/constants.js";

export function GenerationBadge({ generation }) {
  if (!generation) return null;
  const isWd = String(generation).toUpperCase() === "WD";
  return (
    <span className={`badge-gen mono${isWd ? " is-wd" : ""}`}>{generation}</span>
  );
}

export function StatusDot({ status }) {
  const meta = statusMeta(status);
  return (
    <span className="status-pill" style={{ color: meta.color, background: meta.soft }}>
      <span className="status-dot" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

export function SexMark({ sex }) {
  const symbol = sexSymbol(sex);
  const cls = sex === "male" ? "sex-mark sex-male" : sex === "female" ? "sex-mark sex-female" : "sex-mark";
  return <span className={cls}>{symbol}</span>;
}

export function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`chip${active ? " is-active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({ children, onClick, type = "button", full, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary${full ? " is-full" : ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, type = "button", danger, full }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn-ghost${danger ? " is-danger" : ""}${full ? " is-full" : ""}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {action}
    </div>
  );
}
