import { IconList, IconPair, IconTree, IconSettings } from "./icons.jsx";

const TABS = [
  { key: "home", label: "一覧", Icon: IconList },
  { key: "pairs", label: "ペア", Icon: IconPair },
  { key: "tree", label: "家系図", Icon: IconTree },
  { key: "settings", label: "設定", Icon: IconSettings },
];

export function TabBar({ active, onChange }) {
  return (
    <nav className="tabbar">
      {TABS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            className={`tabbar-btn${isActive ? " is-active" : ""}`}
            onClick={() => onChange(key)}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
