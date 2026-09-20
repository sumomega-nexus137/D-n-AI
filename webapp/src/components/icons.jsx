// Компактный набор строчных иконок (stroke=currentColor), чтобы не тянуть
// иконочную библиотеку ради десятка глифов.
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconGrain = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 21V9m0 0c0-3.3 2-6.6 5.4-7.6C17.4 4.9 15.2 8 12 9Zm0 0C12 5.7 10 2.4 6.6 1.4 6.6 4.9 8.8 8 12 9Z" />
  </svg>
);

export const IconLeaf = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 20c9 1 16-4 16-15C10 5 3 10 4 20Z" />
    <path d="M4 20C6 14 10 10 16 8" />
  </svg>
);

export const IconChat = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16H5.5A1.5 1.5 0 0 1 4 14.5Z" />
  </svg>
);

export const IconUser = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
  </svg>
);

export const IconUpload = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 16V5m0 0 4 4m-4-4-4 4" />
    <path d="M5 19h14" />
  </svg>
);

export const IconSpark = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M18 6l-2.5 2.5M6 18l2.5-2.5M18 18l-2.5-2.5" />
  </svg>
);

export const IconArrow = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

export const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m5 13 4 4L19 7" />
  </svg>
);

export const IconTelegram = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M21.9 4.3 18.6 20c-.24 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1 .5l.36-5.13L18 5.5c.4-.36-.09-.56-.62-.2L6.55 12.2l-4.97-1.56c-1.08-.34-1.1-1.08.23-1.6L20.5 2.73c.9-.33 1.68.2 1.4 1.57Z" />
  </svg>
);

export const IconMic = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);
