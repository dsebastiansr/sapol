import { motion, AnimatePresence } from "framer-motion";

const card = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

function InfoChip({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] text-white/60">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-white break-all">{value || "—"}</p>
    </div>
  );
}

export function StudentInfo({ studentData }) {
  const p = studentData?.personalInfo;

  return (
    <AnimatePresence mode="wait">
      {studentData && (
        <motion.section
          key={p?.studentCode ?? "student-info"}
          variants={card}
          initial="hidden"
          animate="show"
          exit="exit"
          className="rounded-2xl border border-white/10 bg-[#202226] p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-white/60">Estudiante</p>
              <h1 className="mt-1 text-3xl font-bold text-[#f4f4fd] capitalize">
                {p?.names} {p?.lastNames}
              </h1>
            </div>

            {/* Badge de matricula */}
            <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80">
              {p?.studentCode || "—"}
            </div>
          </div>

          {/* Grid info */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoChip label="Email" value={p?.email} />
            <InfoChip label="Carrera" value={p?.career} />
            <InfoChip label="Matrícula" value={String(p?.studentCode ?? "")} />
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
