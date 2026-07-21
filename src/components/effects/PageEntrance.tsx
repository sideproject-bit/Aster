// Fades and slides content in on mount via a plain CSS keyframe animation —
// deliberately not requestAnimationFrame-driven, since that never fires (and so
// never reveals the content) in a tab that starts out backgrounded/hidden.
// `.animate-entrance` disables itself under prefers-reduced-motion (see globals.css).
export function PageEntrance({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`animate-entrance ${className}`}>{children}</div>;
}
