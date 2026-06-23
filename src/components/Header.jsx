import { IconBack } from "./icons.jsx";

export function Header({ title, onBack, right = null, subtitle = null }) {
  return (
    <header className="app-header">
      <div className="app-header-row">
        <div className="app-header-side app-header-left">
          {onBack && (
            <button className="header-icon-btn" onClick={onBack} aria-label="戻る">
              <IconBack />
            </button>
          )}
        </div>
        <div className="app-header-titles">
          <h1 className="app-header-title">{title}</h1>
          {subtitle && <p className="app-header-subtitle">{subtitle}</p>}
        </div>
        <div className="app-header-side app-header-right">{right}</div>
      </div>
    </header>
  );
}
