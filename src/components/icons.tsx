type P = { size?: number; color?: string; className?: string };

const stroke = (size: number, color: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const HomeIcon = ({ size = 20, color = "currentColor", filled }: P & { filled?: boolean }) =>
  filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M3.5 11.2L12 3.8l8.5 7.4V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" />
    </svg>
  ) : (
    <svg {...stroke(size, color)}>
      <path d="M3.5 11.2L12 3.8l8.5 7.4V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" />
    </svg>
  );
export const MarketIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M4 18l5-6 4 3 7-9" />
  </svg>
);
export const FlagIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </svg>
);
export const BarsIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M5 20V10M12 20V4M19 20v-7" />
  </svg>
);
export const SparkleIcon = ({ size = 26, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </svg>
);
export const BoltIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M13.5 2L5 13.5h6L10 22l9-12h-6.2z" />
  </svg>
);
export const HistoryIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1M3.5 4v4h4" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const BackIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
export const CloseIcon = ({ size = 20, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const ChevronIcon = ({ size = 18, color = "currentColor", className }: P) => (
  <svg {...stroke(size, color)} className={className}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);
export const CheckIcon = ({ size = 16, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)} strokeWidth={2.6}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const LockIcon = ({ size = 16, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
export const ChatIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M5 5h14v10H9l-4 4z" />
    <path d="M12 8v3M12 13.5v.5" />
  </svg>
);
export const SendIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);
export const ShieldIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z" />
  </svg>
);
export const KeyIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l9-9M16 7l3 3" />
  </svg>
);
export const MegaphoneIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M4 10v4h3l7 4V6L7 10z" />
    <path d="M18 9a4 4 0 0 1 0 6" />
  </svg>
);
export const InboxIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M4 13l2.5-8h11L20 13v6H4z" />
    <path d="M4 13h5l1 2h4l1-2h5" />
  </svg>
);
export const InfoIcon = ({ size = 18, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8v.5" />
  </svg>
);
export const WalletIcon = ({ size = 22, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <rect x="3.5" y="6" width="17" height="13" rx="3" />
    <path d="M16 12.5h1.5M3.5 9h17" />
  </svg>
);
export const ExternalIcon = ({ size = 16, color = "currentColor" }: P) => (
  <svg {...stroke(size, color)}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);
