function clsx(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function CurrentSubjects({ year, term, subjects }) {
  const MAX_GRADE = 10; // cambia a 10 si tus notas son sobre 10

  return (
    <section className="bg-[#202226] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-wide text-white/70">
          Materias PAO{year}-{term}
        </span>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {subjects.map((s) => {
          const state = String(s.state || "").toUpperCase();
          const isRP = state === "RP";

          const gradeNum = Number(s.grade);
          const hasGrade = Number.isFinite(gradeNum);

          const pct = hasGrade
            ? Math.max(0, Math.min(100, (gradeNum / MAX_GRADE) * 100))
            : 0;

          return (
            <article
              key={`${s.subject}-${s.enroll}`}
              className="rounded-2xl border border-white/10 bg-[#1a1b1e] p-5 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-white/60">Materia</p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    {s.subject}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* intento / enroll */}
                  <span className="h-7 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 flex items-center">
                    {s.enroll}
                  </span>

                  {/* estado */}
                  <span
                    className={clsx(
                      "h-7 rounded-full px-3 text-xs font-bold flex items-center",
                      isRP
                        ? "bg-rose-500/15 text-rose-200 border border-rose-400/20"
                        : "bg-emerald-500/15 text-emerald-200 border border-emerald-400/20"
                    )}
                  >
                    {state || "—"}
                  </span>
                </div>
              </div>

              {/* Promedio + progress */}
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Promedio</p>
                  <p className={clsx("text-sm font-bold", hasGrade ? "text-white" : "text-white/50")}>
                    {hasGrade ? gradeNum.toFixed(2) : "—"}
                    <span className="ml-1 text-xs text-white/60">/ {MAX_GRADE}</span>
                  </p>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={clsx("h-full rounded-full", isRP ? "bg-red-500/70" : "bg-emerald-300")}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[11px] text-white/50">
                  <span>0</span>
                  <span>{MAX_GRADE}</span>
                </div>
              </div>

              {/* Notas */}
              <div className="mt-4">
                <p className="text-sm font-semibold text-white">Notas</p>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <NoteChip label="Parcial 1" value={s.midterm1} />
                  <NoteChip label="Parcial 2" value={s.midterm2} />
                  <NoteChip label="Mejoramiento" value={s.midterm3} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function NoteChip({ label, value }) {
  const n = Number(value);
  const missing = !Number.isFinite(n);

  return (
    <div className="rounded-xl border border-white/10 bg-[#202226]/40 px-3 py-2">
      <p className="text-[11px] text-white/60">{label}</p>
      <p className={clsx("text-sm font-semibold", missing ? "text-white/40" : "text-white")}>
        {missing ? "—" : n.toFixed(2)}
      </p>
    </div>
  );
}
