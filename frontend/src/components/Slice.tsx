const colors = {
  bg: "#FCFCFD",
  ink: "#0F172A",
  user: "#C62828", // listening pulse
  agent: "#B8860B", // speaking pulse
};

/* =====================  Brand mark  ===================== */
function Slice({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3 7c5.5-3.5 12.5-3.5 18 0l-9 13L3 7z" fill={colors.user} />
      <circle cx="9.6" cy="10" r="1.05" fill={colors.agent} />
      <circle cx="13.1" cy="12.2" r="1.05" fill={colors.agent} />
      <circle cx="11.8" cy="8.2" r="1.05" fill={colors.agent} />
    </svg>
  );
}

export default Slice;
