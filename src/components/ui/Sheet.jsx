export function ConfirmSheet({ open, title, description, confirmLabel = "削除する", danger = true, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="sheet-overlay" onClick={onCancel}>
      <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
        <p className="sheet-title">{title}</p>
        {description && <p className="sheet-desc">{description}</p>}
        <button
          className={`sheet-btn${danger ? " is-danger" : ""}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
        <button className="sheet-btn sheet-btn-cancel" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </div>
  );
}
