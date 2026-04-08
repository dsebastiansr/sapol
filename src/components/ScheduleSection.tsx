import SectionCard from "./SectionCard";
import { toTitleCaseEs } from "../utils/format";

interface ScheduleSectionProps {
  scheduleRows: Record<string, unknown>[];
  scheduleMessage?: string;
}

interface ScheduleEvent {
  day: string;
  startMinutes: number;
  endMinutes: number;
  subject: string;
  room: string;
  parallelCode: string;
  block: string;
}

const DAY_ORDER = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
}

function formatSubjectName(subjectName: string) {
  return toTitleCaseEs(subjectName);
}

function toMinutes(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 1000) {
      return Math.floor(value / 60);
    }
    return value * 60;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      const numeric = Number(trimmed);
      if (numeric > 1000) {
        return Math.floor(numeric / 60);
      }
      return numeric * 60;
    }
    const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = Number(match[1]);
      const minutes = Number(match[2]);
      return hours * 60 + minutes;
    }
  }

  return null;
}

function formatMinutes(minutes: number) {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(safeMinutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (safeMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

function normalizeEvents(rows: Record<string, unknown>[]) {
  const events: ScheduleEvent[] = [];

  for (const row of rows) {
    const dayRaw =
      (row.nombredia as string | undefined) ??
      (row.dia as string | undefined) ??
      (row.day as string | undefined);
    const startMinutes = toMinutes(row.horainicio ?? row.hora_inicio ?? row.start_time);
    const endMinutes = toMinutes(row.horafin ?? row.hora_fin ?? row.end_time);

    if (!dayRaw || startMinutes === null || endMinutes === null) {
      continue;
    }

    const day = normalizeText(dayRaw);
    if (!DAY_ORDER.includes(day)) {
      continue;
    }

    const subject =
      ((row.nombre as string | undefined) ??
        (row.materia as string | undefined) ??
        "Materia").trim();

    events.push({
      day,
      startMinutes,
      endMinutes,
      subject: formatSubjectName(subject),
      room: ((row.aula as string | undefined) ?? "-").trim(),
      parallelCode:
        ((row.__course as string | undefined) ??
          (row.paralelo as string | undefined) ??
          "-").trim(),
      block: ((row.bloque as string | undefined) ?? "-").trim(),
    });
  }

  return events.sort(
    (a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes,
  );
}

function ScheduleSection({
  scheduleRows,
  scheduleMessage = "No hay horario disponible.",
}: ScheduleSectionProps) {
  const events = normalizeEvents(scheduleRows);
  const activeDays = DAY_ORDER;
  const timeSlots = Array.from(
    new Set(events.map((event) => `${event.startMinutes}-${event.endMinutes}`)),
  )
    .map((slot) => {
      const [startRaw, endRaw] = slot.split("-");
      const start = Number(startRaw);
      const end = Number(endRaw);
      return { slot, start, end };
    })
    .sort((a, b) => a.start - b.start);

  return (
    <SectionCard
      title="Horario Actual"
      subtitle="Solo se muestra horario con materias actualmente registradas."
    >
      {events.length > 0 && timeSlots.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-[var(--line-soft)]">
          <div
            className="grid min-w-[900px] bg-[var(--bg-panel-2)]"
            style={{
              gridTemplateColumns: `170px repeat(${activeDays.length}, minmax(180px, 1fr))`,
            }}
          >
            <div className="border-b border-r border-[var(--line-soft)] px-3 py-3 text-sm font-medium text-[var(--text-secondary)]">
              Hora
            </div>
            {activeDays.map((day) => (
              <div
                key={day}
                className="border-b border-r border-[var(--line-soft)] px-3 py-3 text-sm font-medium text-[var(--text-secondary)]"
              >
                {toTitleCaseEs(day)}
              </div>
            ))}

            {timeSlots.map((slot) => (
              <div key={slot.slot} className="contents">
                <div className="border-b border-r border-[var(--line-soft)] px-3 py-4 text-sm text-[var(--text-secondary)]">
                  {`${formatMinutes(slot.start)} - ${formatMinutes(slot.end)}`}
                </div>
                {activeDays.map((day) => {
                  const slotEvents = events.filter(
                    (event) =>
                      event.day === day &&
                      event.startMinutes === slot.start &&
                      event.endMinutes === slot.end,
                  );
                  return (
                    <div
                      key={`${slot.slot}-${day}`}
                      className="border-b border-r border-[var(--line-soft)] p-2"
                    >
                      {slotEvents.length === 0 ? (
                        <div className="h-full min-h-20 rounded-lg border border-dashed border-[var(--line-soft)]" />
                      ) : (
                        <div className="space-y-2">
                          {slotEvents.map((event, index) => (
                            <article
                              key={`${event.parallelCode}-${event.block}-${index.toString()}`}
                              className="rounded-lg border border-[var(--line-strong)] bg-[var(--bg-panel)] px-3 py-2"
                            >
                              <p className="text-sm font-semibold text-[var(--text-primary)]">
                                {event.subject}
                              </p>
                              <p className="text-sm text-[var(--text-secondary)]">
                                Paralelo {event.parallelCode} · Bloque {event.block}
                              </p>
                              <p className="text-sm text-[var(--accent-soft)]">
                                Aula {event.room}
                              </p>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">{scheduleMessage}</p>
      )}
    </SectionCard>
  );
}

export default ScheduleSection;
