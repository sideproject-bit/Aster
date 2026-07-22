type IconProps = { className?: string };

export function BoldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M4 2.5h4.2a2.4 2.4 0 0 1 0 4.8H4V2.5Zm0 4.8h4.6a2.5 2.5 0 0 1 0 5H4V7.3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ItalicIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M7 2.5h5M4 13.5h5M9.5 2.5 6.5 13.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="2.2" cy="4" r="1" fill="currentColor" />
      <circle cx="2.2" cy="8" r="1" fill="currentColor" />
      <circle cx="2.2" cy="12" r="1" fill="currentColor" />
      <path
        d="M5.5 4h8.3M5.5 8h8.3M5.5 12h8.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function QuoteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M3 9.5c0-2.5 1.2-4 3-4.7l.5 1.1c-1.2.6-1.8 1.4-1.9 2.4.3-.1.6-.1.9-.1a2 2 0 0 1 0 4A2 2 0 0 1 3 9.5Zm7 0c0-2.5 1.2-4 3-4.7l.5 1.1c-1.2.6-1.8 1.4-1.9 2.4.3-.1.6-.1.9-.1a2 2 0 0 1 0 4A2 2 0 0 1 10 9.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TextColorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M6.5 2.5 2.5 12M6.5 2.5l4 9.5M3.7 9h5.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="2" y="13.2" width="9" height="1.6" rx="0.5" fill="currentColor" />
    </svg>
  );
}

export function HighlightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M9.5 2.5 13 6l-6 6-4-1 1-4 5.5-4.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M3 11l-1 3 3-1" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function FootnoteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M2.5 3.5h11M2.5 7h7M2.5 10.5h7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <text x="11.5" y="14" fontSize="5.5" fill="currentColor" stroke="none">
        1
      </text>
    </svg>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="2" y="2.5" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5.3" cy="6" r="1.1" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M2.5 11.5 6 8l2.5 2.5L11 8l3 3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TableIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="2" y="2.5" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.2h12M2 9.8h12M6.5 2.5v11" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function SwatchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect
        x="2.5"
        y="2.5"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M2.5 8h11" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function AddRowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="2" y="2.5" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 11v3.5M6.2 12.8H9.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AddColumnIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="2.5" y="2" width="7" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M12.5 8H16M14.2 6.2v3.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DeleteRowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="2" y="2.5" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 12.2h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function DeleteColumnIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="2.5" y="2" width="7" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12.2 6v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function DeleteTableIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="2" y="2.5" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.2h12M2 9.8h12M6.5 2.5v11" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M5.5 5.5l5 5m0-5-5 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MergeCellsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="2" y="2.5" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 8h12" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M5.5 5.5 8 8l-2.5 2.5M10.5 5.5 8 8l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SplitCellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="2" y="2.5" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 2.5v11" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M6.2 5.8 4 8l2.2 2.2M9.8 5.8 12 8l-2.2 2.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AlignLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M2.5 3.5h11M2.5 6.8h7M2.5 10.1h11M2.5 13.4h7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AlignCenterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M2.5 3.5h11M4.5 6.8h7M2.5 10.1h11M4.5 13.4h7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AlignRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M2.5 3.5h11M6.5 6.8h7M2.5 10.1h11M6.5 13.4h7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M6.8 9.2 9.2 6.8M6 4.2 7 3.1a2.4 2.4 0 0 1 3.4 3.4l-1 1M10 11.8l-1 1a2.4 2.4 0 0 1-3.4-3.4l1-1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
