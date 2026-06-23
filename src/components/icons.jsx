const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

export function IconList(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <rect x="3.5" y="4.5" width="5" height="5" rx="1.2" />
      <rect x="3.5" y="14.5" width="5" height="5" rx="1.2" />
      <path d="M11.5 7h9M11.5 17h9" />
    </svg>
  );
}

export function IconPair(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <circle cx="8.5" cy="9" r="3.4" />
      <circle cx="15.7" cy="9" r="3.4" />
      <path d="M4 19c.7-2.8 2.4-4.3 4.5-4.3S12.3 16.2 13 19" />
      <path d="M11 19c.7-2.8 2.4-4.3 4.5-4.3S19.3 16.2 20 19" />
    </svg>
  );
}

export function IconTree(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <circle cx="12" cy="4.8" r="2" />
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="12" cy="18.5" r="2" />
      <circle cx="18.5" cy="18.5" r="2" />
      <path d="M12 6.8v4M12 10.8H5.5v5.7M12 10.8v5.7M12 10.8h6.5v5.7" />
    </svg>
  );
}

export function IconSettings(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19.4 13.5c.1-.5.1-1 0-1.5l1.6-1.4-1.5-2.6-2 .6a7.6 7.6 0 0 0-1.3-.75L16 5.6h-3l-.2 2.25c-.47.18-.9.43-1.3.75l-2-.6-1.5 2.6 1.6 1.4c-.1.5-.1 1 0 1.5L8 14.9l1.5 2.6 2-.6c.4.32.83.57 1.3.75L13 20h3l.2-2.35c.47-.18.9-.43 1.3-.75l2 .6 1.5-2.6-1.6-1.4Z" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...base} strokeWidth={2.2} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconBack(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...base} strokeWidth={2.1} {...props}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

export function IconChevronRight(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} strokeWidth={2} {...props}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function IconEdit(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M4 20l.9-3.6L16.4 5 19 7.6 7.5 19.1 4 20Z" />
      <path d="M14 7l3 3" />
    </svg>
  );
}

export function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M5 7h14M9.5 7V5.2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M7 7l.8 12a1.4 1.4 0 0 0 1.4 1.3h5.6A1.4 1.4 0 0 0 16.2 19L17 7" />
    </svg>
  );
}

export function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} strokeWidth={2.1} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.2" />
      <path d="M19 19l-4-4" />
    </svg>
  );
}

export function IconDownload(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M12 4v11M8 11l4 4 4-4" />
      <path d="M5 18.5h14V20H5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconUpload(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M12 15V4M8 8l4-4 4 4" />
      <path d="M5 18.5h14V20H5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBeetle(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M9 6c-2.4-1.7-4.4-1.4-5.6.6 1 0 2 .3 2.8 1" />
      <path d="M15 6c2.4-1.7 4.4-1.4 5.6.6-1 0-2 .3-2.8 1" />
      <ellipse cx="12" cy="8.5" rx="2" ry="1.6" />
      <ellipse cx="12" cy="12" rx="2.8" ry="2.2" />
      <ellipse cx="12" cy="17" rx="3.6" ry="4.4" />
      <path d="M12 10.4v10.8" />
      <path d="M9 11l-3.2.5M9 13.6l-3.6 1M9 16.2l-3.4 2" />
      <path d="M15 11l3.2.5M15 13.6l3.6 1M15 16.2l3.4 2" />
    </svg>
  );
}

export function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} strokeWidth={2.4} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function IconCase(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <rect x="3.5" y="7" width="17" height="12" rx="1.6" />
      <path d="M8 7V5.6A1.6 1.6 0 0 1 9.6 4h4.8A1.6 1.6 0 0 1 16 5.6V7" />
      <path d="M3.5 12h17" />
    </svg>
  );
}
