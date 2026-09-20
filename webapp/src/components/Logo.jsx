export default function Logo({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex shrink-0 items-center gap-2.5 outline-none"
      aria-label="Dän-AI — на главную"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/15 ring-1 ring-gold-500/25 transition-all group-hover:ring-gold-400/50">
        <span className="absolute inset-0 rounded-xl bg-gold-400/20 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
        <svg viewBox="0 0 24 24" fill="none" className="relative h-5 w-5 text-gold-400">
          <path
            d="M12 21V10m0 0c0-3 1.9-6.2 5.2-7.2 0 3.6-2.1 6.4-5.2 7.2Zm0 0C12 7 10.1 3.8 6.8 2.8 6.8 6.4 8.9 9.2 12 10Zm0 4.5c-2 -1 -3.4-2.4-4-4m4 4c2-1 3.4-2.4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="font-display text-[15px] font-bold tracking-tight text-white">Dän-AI</span>
        <span className="hidden text-[13px] text-slate-500 min-[380px]:inline">агроскан</span>
      </span>
    </button>
  );
}
