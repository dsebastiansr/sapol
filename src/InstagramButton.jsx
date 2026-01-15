export function InstagramButton({ href, handle, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={[
        'group inline-flex items-center justify-center gap-2 w-fit max-md:w-full max-md:justify-start',
        'rounded-2xl border border-white/10 bg-[#202226] px-4 py-3',
        'text-sm font-semibold text-white',
        'transition-all duration-250',
        ' hover:border-white/20 hover:-translate-y-0.5',
        'active:translate-y-0 active:scale-[0.99]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2282ff]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E1F24]',
        className,
      ].join(' ')}
      aria-label="Abrir Instagram"
    >
      <span className="grid place-items-center rounded-xl border border-white/10 bg-white/5 p-2">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="text-white/90"
        >
          <path
            d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M17.3 6.7h.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <div className="flex flex-col leading-tight">
        <span className="text-white">Instagram</span>
        {handle ? (
          <span className="text-xs font-medium text-white/60 group-hover:text-white/70">
            @{handle}
          </span>
        ) : (
          <span className="text-xs font-medium text-white/60 group-hover:text-white/70">
            Abrir perfil
          </span>
        )}
      </div>

    </a>
  );
}
