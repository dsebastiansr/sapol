import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const DAYS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

function parseIsoDurationToMinutes(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?$/i.exec(String(iso).trim());
  if (!m) return null;
  const h = m[1] ? Number(m[1]) : 0;
  const mins = m[2] ? Number(m[2]) : 0;
  return h * 60 + mins;
}

function minutesToLabel(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function floorToStep(min, step) {
  return Math.floor(min / step) * step;
}
function ceilToStep(min, step) {
  return Math.ceil(min / step) * step;
}

// Animaciones
const tableWrap = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

const eventsLayer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
};

const eventCard = {
  hidden: { opacity: 0, y: 6, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

export function WeeklyScheduleTable({ subjects }) {
  const STEP = 30; // 30 min por fila
  const ROW_PX = 60; // altura de fila
  const PADDING = 60; // (no usado, lo dejo por si luego quieres extender)

  const { events, startMin, endMin, totalRows, hourLabels } = useMemo(() => {
    const evts = (subjects ?? [])
      .flatMap((subj) =>
        (subj.schedule ?? []).map((s) => {
          const startMin = parseIsoDurationToMinutes(s.startTime);
          const endMin = parseIsoDurationToMinutes(s.endTime);

          return {
            key: `${subj.code}-${subj.course}-${s.day}-${s.startTime}-${s.endTime}`,
            code: subj.code,
            name: subj.name,
            parallel: subj.course,
            day: s.day,
            classroom: s.classroom,
            block: s.block,
            startMin,
            endMin,
          };
        })
      )
      .filter(
        (e) =>
          e.startMin != null &&
          e.endMin != null &&
          e.endMin > e.startMin &&
          DAYS.includes(e.day)
      );

    if (evts.length === 0) {
      const start = 9 * 60;
      const end = 13 * 60;
      const rows = Math.ceil((end - start) / STEP);
      return {
        events: [],
        startMin: start,
        endMin: end,
        totalRows: rows,
        hourLabels: [start, start + 60, start + 120, start + 180, end],
      };
    }

    const minStart = Math.min(...evts.map((e) => e.startMin));
    const maxEnd = Math.max(...evts.map((e) => e.endMin));

    const start = floorToStep(Math.max(0, minStart), STEP);
    const end = ceilToStep(maxEnd, STEP);
    const rows = Math.ceil((end - start) / STEP);

    const labels = [];
    const firstHour = floorToStep(start, 60);
    for (let t = firstHour; t <= end; t += 60) {
      if (t >= start && t <= end) labels.push(t);
    }

    return {
      events: evts,
      startMin: start,
      endMin: end,
      totalRows: rows,
      hourLabels: labels,
    };
  }, [subjects]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#202226] p-4 sm:p-6 flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs tracking-wide text-white/70">Horario Actual</span>
        <span className="text-xs tracking-wide text-white/60">
          {minutesToLabel(startMin)}–{minutesToLabel(endMin)}
        </span>
      </div>

      <motion.div
        variants={tableWrap}
        initial="hidden"
        animate="show"
        className="rounded-2xl border border-white/10 bg-[#1a1b1e] text-white overflow-hidden"
      >
        {/* ✅ MOBILE (stack por día) */}
        <div className="lg:hidden p-3 sm:p-4 flex flex-col gap-3">
          {DAYS.map((day) => {
            const dayEvents = events
              .filter((e) => e.day === day)
              .sort((a, b) => a.startMin - b.startMin);

            return (
              <div
                key={day}
                className="rounded-2xl border border-white/10 bg-[#202226] p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </h3>
                  <span className="text-xs text-white/50">
                    {dayEvents.length} clase{dayEvents.length === 1 ? '' : 's'}
                  </span>
                </div>

                {dayEvents.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/50">
                    Sin clases
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {dayEvents.map((e) => (
                      <div
                        key={e.key}
                        className="rounded-xl border border-white/10 bg-[#1a1b1e] p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-tight truncate">
                              {e.name}
                            </p>
                            <p className="text-xs text-white/70 truncate">
                              {e.code} · Paralelo {e.parallel}
                            </p>
                          </div>
                          <p className="text-xs text-white/60 whitespace-nowrap">
                            {minutesToLabel(e.startMin)}–{minutesToLabel(e.endMin)}
                          </p>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/70">
                          <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/10">
                            {e.classroom}
                          </span>
                          <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/10">
                            {e.block}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ✅ DESKTOP (grilla semanal) */}
        <div className="hidden lg:block p-6">
          {/* Header días */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            {DAYS.map((d) => (
              <div
                key={d}
                className="rounded-lg text-center bg-white/5 border border-white/10 px-3 py-2 text-sm font-semibold"
              >
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </div>
            ))}
          </div>

          {/* Scroll horizontal si te queda apretado */}
          <div className="overflow-x-auto">
            <div className="max-[1200px]">
              <div className="grid grid-cols-5 gap-2">
                {DAYS.map((day) => (
                  <div key={day} className="relative rounded-xl overflow-hidden">
                    {/* Base grid */}
                    <div
                      className="grid"
                      style={{ gridTemplateRows: `repeat(${totalRows}, ${ROW_PX}px)` }}
                    >
                      {Array.from({ length: totalRows }).map((_, i) => (
                        <div key={i} className="" />
                      ))}
                    </div>

                    {/* Eventos */}
                    <motion.div
                      variants={eventsLayer}
                      initial="hidden"
                      animate="show"
                      className="absolute inset-0 grid"
                      style={{ gridTemplateRows: `repeat(${totalRows}, ${ROW_PX}px)` }}
                    >
                      {events
                        .filter((e) => e.day === day)
                        .map((e) => {
                          const rowStart =
                            Math.floor((e.startMin - startMin) / STEP) + 1;
                          const rowSpan = Math.max(
                            1,
                            Math.ceil((e.endMin - e.startMin) / STEP)
                          );

                          return (
                            <motion.div
                              key={e.key}
                              variants={eventCard}
                              className="
                                my-1 rounded-lg border border-white/10 bg-[#202226]
                                p-3 xl:p-4 text-sm flex flex-col justify-between
                                will-change-transform min-w-0
                              "
                              style={{ gridRow: `${rowStart} / span ${rowSpan}` }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold leading-tight truncate">
                                    {e.name}
                                  </p>
                                  <p className="text-white/70 truncate">
                                    Paralelo {e.parallel}
                                  </p>
                                </div>
                                <p className="text-white/60 whitespace-nowrap text-xs">
                                  {minutesToLabel(e.startMin)}–{minutesToLabel(e.endMin)}
                                </p>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2 text-white/70 text-xs">
                                <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/10">
                                  {e.classroom}
                                </span>
                                <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/10">
                                  {e.block}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* (Opcional) si quieres mostrar horas al lado luego, aquí puedes reactivar tu columna */}
          {/* hourLabels está calculado arriba */}
        </div>
      </motion.div>
    </div>
  );
}
