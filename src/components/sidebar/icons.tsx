export function FolderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M1.5 3.5A1 1 0 0 1 2.5 2.5h3.086a1 1 0 0 1 .707.293l1.121 1.121a1 1 0 0 0 .707.293H13.5a1 1 0 0 1 1 1v6.293a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M11.3 1.8a1.2 1.2 0 0 1 1.7 0l1.2 1.2a1.2 1.2 0 0 1 0 1.7l-8 8-3.4 1 1-3.4 8-8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9.8 3.3 12.7 6.2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function DocIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M4 1.5h5.5L12.5 4.5V14a0.5 0.5 0 0 1-0.5 0.5H4a0.5 0.5 0 0 1-0.5-0.5V2a0.5 0.5 0 0 1 0.5-0.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9.5 1.5V4.5H12.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
