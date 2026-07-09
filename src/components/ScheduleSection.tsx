import SectionCard from "./SectionCard";
import { toTitleCaseEs } from "../utils/format";

interface ScheduleSectionProps {
  scheduleRows: Record<string, unknown>[];
  currentTermLabel?: string;
  scheduleMessage?: string;
}

interface ScheduleEvent {
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
  subject: string;
  room: string;
  parallelCode: string;
  block: string;
  isPractical: boolean;
}

interface ScheduleEventGroup {
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
  subject: string;
  room: string;
  block: string;
  segments: ScheduleEvent[];
}

const DAY_ORDER = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
];

const SLOT_MINUTES = 30;
const EVENT_BG = "#23252b";
const EARLIEST_ACADEMIC_MINUTES = 7 * 60;
const HALF_DAY_MINUTES = 12 * 60;
const LATEST_ACADEMIC_MINUTES = 22 * 60;

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const safeHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const red = Number.parseInt(safeHex.slice(0, 2), 16);
  const green = Number.parseInt(safeHex.slice(2, 4), 16);
  const blue = Number.parseInt(safeHex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

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

function isPracticalParallel(parallelCode: string) {
  return /^\d{3,}$/.test(parallelCode.trim());
}

function parseNumericTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  if (Number.isInteger(value) && value <= 2359) {
    const hours = Math.floor(value / 100);
    const minutes = value % 100;
    if (hours <= 23 && minutes <= 59) {
      return hours * 60 + minutes;
    }
  }

  if (value <= 24) {
    return Math.round(value * 60);
  }

  if (value <= 24 * 60) {
    return Math.round(value);
  }

  if (value <= 24 * 60 * 60) {
    return Math.floor(value / 60);
  }

  return null;
}

function parseISO8601DurationToMinutes(value: string) {
  const durationMatch = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!durationMatch) {
    return null;
  }

  const hours = Number(durationMatch[1] ?? 0);
  const minutes = Number(durationMatch[2] ?? 0);
  const seconds = Number(durationMatch[3] ?? 0);
  return hours * 60 + minutes + Math.floor(seconds / 60);
}

function uniqueNumbers(values: Array<number | null>) {
  return Array.from(
    new Set(values.filter((value): value is number => value !== null && Number.isFinite(value))),
  );
}

function getCandidateMinutes(value: unknown) {
  if (typeof value === "number") {
    const candidates: number[] = [];
    const hhmm = parseNumericTime(value);
    if (hhmm !== null) {
      candidates.push(hhmm);
    }
    if (value <= 24 * 60) {
      candidates.push(Math.round(value));
    }
    if (value <= 24 * 60 * 60) {
      candidates.push(Math.floor(value / 60));
    }
    if (value <= 24) {
      candidates.push(Math.round(value * 60));
    }
    return uniqueNumbers(candidates);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    const hourMatch = trimmed.match(/^(\d{1,2}):(\d{2})/);
    if (hourMatch) {
      const hours = Number(hourMatch[1]);
      const minutes = Number(hourMatch[2]);
      if (hours <= 23 && minutes <= 59) {
        return [hours * 60 + minutes];
      }
    }

    const durationMinutes = parseISO8601DurationToMinutes(trimmed);
    if (durationMinutes !== null) {
      return [durationMinutes];
    }

    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return getCandidateMinutes(Number(trimmed));
    }
  }

  return [];
}

function formatMinutes(minutes: number) {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(safeMinutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (safeMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

function normalizeAcademicTimeRange(startMinutes: number, endMinutes: number) {
  let normalizedStart = startMinutes;
  let normalizedEnd = endMinutes;

  // Some schedule endpoints return afternoon hours as 130/300 instead of 1330/1500.
  // If both times fall before the academic day starts, interpret them as PM.
  if (
    normalizedStart < EARLIEST_ACADEMIC_MINUTES &&
    normalizedEnd <= EARLIEST_ACADEMIC_MINUTES
  ) {
    normalizedStart += HALF_DAY_MINUTES;
    normalizedEnd += HALF_DAY_MINUTES;
  }

  // Defensive fallback for ranges that still end before they start after normalization.
  if (normalizedEnd <= normalizedStart && normalizedEnd + HALF_DAY_MINUTES > normalizedStart) {
    normalizedEnd += HALF_DAY_MINUTES;
  }

  return {
    startMinutes: normalizedStart,
    endMinutes: normalizedEnd,
  };
}

function scoreAcademicRange(startMinutes: number, endMinutes: number) {
  const duration = endMinutes - startMinutes;
  if (duration <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  let score = 0;

  if (startMinutes < EARLIEST_ACADEMIC_MINUTES) {
    score += 30;
  }
  if (endMinutes > LATEST_ACADEMIC_MINUTES) {
    score += 30;
  }
  if (startMinutes % SLOT_MINUTES !== 0) {
    score += 10;
  }
  if (endMinutes % SLOT_MINUTES !== 0) {
    score += 10;
  }
  if (duration < SLOT_MINUTES) {
    score += 50;
  }
  if (duration > 4 * 60) {
    score += 15;
  }

  return score;
}

function resolveTimeRange(startRaw: unknown, endRaw: unknown) {
  const startCandidates = getCandidateMinutes(startRaw);
  const endCandidates = getCandidateMinutes(endRaw);

  let bestRange: { startMinutes: number; endMinutes: number; score: number } | null = null;

  for (const startCandidate of startCandidates) {
    for (const endCandidate of endCandidates) {
      const normalizedRange = normalizeAcademicTimeRange(startCandidate, endCandidate);
      const score = scoreAcademicRange(
        normalizedRange.startMinutes,
        normalizedRange.endMinutes,
      );

      if (!Number.isFinite(score)) {
        continue;
      }

      if (
        bestRange === null ||
        score < bestRange.score ||
        (score === bestRange.score &&
          normalizedRange.startMinutes < bestRange.startMinutes)
      ) {
        bestRange = {
          startMinutes: normalizedRange.startMinutes,
          endMinutes: normalizedRange.endMinutes,
          score,
        };
      }
    }
  }

  return bestRange;
}

function normalizeEvents(rows: Record<string, unknown>[]) {
  const events: ScheduleEvent[] = [];

  for (const row of rows) {
    const dayRaw =
      (row.nombredia as string | undefined) ??
      (row.dia as string | undefined) ??
      (row.day as string | undefined);
    const resolvedRange = resolveTimeRange(
      row.horainicio ?? row.hora_inicio ?? row.start_time,
      row.horafin ?? row.hora_fin ?? row.end_time,
    );

    if (!dayRaw || resolvedRange === null) {
      continue;
    }

    const day = normalizeText(dayRaw);
    const dayIndex = DAY_ORDER.indexOf(day);
    if (dayIndex === -1) {
      continue;
    }

    const subject =
      ((row.nombre as string | undefined) ??
        (row.materia as string | undefined) ??
        "Materia").trim();

    events.push({
      dayIndex,
      startMinutes: resolvedRange.startMinutes,
      endMinutes: resolvedRange.endMinutes,
      subject: formatSubjectName(subject),
      room: ((row.aula as string | undefined) ?? "-").trim(),
      parallelCode:
        ((row.__course as string | undefined) ??
          (row.paralelo as string | undefined) ??
          "-").trim(),
      block: ((row.bloque as string | undefined) ?? "-").trim(),
      isPractical: isPracticalParallel(
        ((row.__course as string | undefined) ??
          (row.paralelo as string | undefined) ??
          "-").trim(),
      ),
    });
  }

  return events.sort(
    (a, b) =>
      a.dayIndex - b.dayIndex ||
      a.startMinutes - b.startMinutes ||
      a.endMinutes - b.endMinutes,
  );
}

function groupContiguousEvents(events: ScheduleEvent[]) {
  const groups: ScheduleEventGroup[] = [];

  for (const event of events) {
    const previousGroup = groups.at(-1);
    const canMerge =
      previousGroup !== undefined &&
      previousGroup.dayIndex === event.dayIndex &&
      previousGroup.subject === event.subject &&
      previousGroup.room === event.room &&
      previousGroup.block === event.block &&
      previousGroup.endMinutes === event.startMinutes;

    if (canMerge && previousGroup) {
      previousGroup.endMinutes = event.endMinutes;
      previousGroup.segments.push(event);
      continue;
    }

    groups.push({
      dayIndex: event.dayIndex,
      startMinutes: event.startMinutes,
      endMinutes: event.endMinutes,
      subject: event.subject,
      room: event.room,
      block: event.block,
      segments: [event],
    });
  }

  return groups;
}

function roundDownToSlot(minutes: number) {
  return Math.floor(minutes / SLOT_MINUTES) * SLOT_MINUTES;
}

function roundUpToSlot(minutes: number) {
  return Math.ceil(minutes / SLOT_MINUTES) * SLOT_MINUTES;
}

function ScheduleSection({
  scheduleRows,
  currentTermLabel,
  scheduleMessage = "No hay horario disponible.",
}: ScheduleSectionProps) {
  const title = currentTermLabel ? `Horario - ${currentTermLabel}` : "Horario";
  const events = normalizeEvents(scheduleRows);
  const eventGroups = groupContiguousEvents(events);

  if (eventGroups.length === 0) {
    return (
      <SectionCard title={title}>
        <p className="text-sm text-[var(--text-secondary)]">{scheduleMessage}</p>
      </SectionCard>
    );
  }

  const gridStart = roundDownToSlot(
    Math.min(...eventGroups.map((event) => event.startMinutes)),
  );
  const rawGridEnd = roundUpToSlot(
    Math.max(...eventGroups.map((event) => event.endMinutes)),
  );
  const gridEnd = rawGridEnd > gridStart ? rawGridEnd : gridStart + SLOT_MINUTES;
  const totalSlots = Math.ceil((gridEnd - gridStart) / SLOT_MINUTES);
  const slotMarks = Array.from({ length: totalSlots }, (_, index) => gridStart + index * SLOT_MINUTES);
  const finalTimeMark = gridStart + totalSlots * SLOT_MINUTES;

  return (
    <SectionCard title={title}>
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[900px] p-3 pb-6"
          style={{
            gridTemplateColumns: `56px repeat(${DAY_ORDER.length}, 1fr)`,
            gridTemplateRows: `auto repeat(${totalSlots}, 35px)`,
          }}
        >
          <div className="sticky left-0 z-20" />
          {DAY_ORDER.map((day) => (
            <div key={day} className="border-zinc-800 bg-zinc-900/90 px-2 py-2.5 text-center">
              <span className="text-zinc-300 text-[10px] font-semibold uppercase tracking-wide">
                {toTitleCaseEs(day).slice(0, 3)}
              </span>
            </div>
          ))}

          {slotMarks.map((minuteMark, index) => {
            const rowStart = index + 2;
            const isHalfHour = minuteMark % 60 !== 0;

            return (
              <div key={minuteMark} className="contents">
                <div
                  className={`pr-3 -translate-y-1 text-right ${
                    isHalfHour
                      ? "text-[9px] text-zinc-600"
                      : "text-zinc-500 text-[10px] font-medium"
                  }`}
                  style={{ gridRow: `${rowStart} / span 1`, gridColumn: 1 }}
                >
                  {formatMinutes(minuteMark)}
                </div>

                {DAY_ORDER.map((day, dayIndex) => (
                  <div
                    key={`${day}-${minuteMark}`}
                    className={`border-l border-t border-zinc-800/90 ${
                      dayIndex === DAY_ORDER.length - 1 ? "border-r" : ""
                    } ${
                      index === totalSlots - 1 ? "border-b" : ""
                    }`}
                    style={{ gridRow: `${rowStart} / span 1`, gridColumn: dayIndex + 2 }}
                  />
                ))}
              </div>
            );
          })}

          <div
            className="pr-3 translate-y-1 text-right text-zinc-500 text-[10px] font-medium"
            style={{ gridRow: `${totalSlots + 1} / span 1`, gridColumn: 1, alignSelf: "end" }}
          >
            {formatMinutes(finalTimeMark)}
          </div>

          {eventGroups.map((eventGroup, index) => {
            const startSlot = Math.floor((roundDownToSlot(eventGroup.startMinutes) - gridStart) / SLOT_MINUTES);
            const endSlot = Math.ceil((roundUpToSlot(eventGroup.endMinutes) - gridStart) / SLOT_MINUTES);
            const rowSpan = endSlot - startSlot;

            if (rowSpan <= 0) {
              return null;
            }

            const sortedSegments = [...eventGroup.segments].sort(
              (a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes,
            );

            return (
              <div
                key={`${eventGroup.dayIndex}-${eventGroup.subject}-${eventGroup.block}-${eventGroup.room}-${index.toString()}`}
                className="z-10 mx-0.5 my-0.5 flex flex-col gap-1.5 rounded-lg border p-2.5"
                style={{
                  gridColumn: eventGroup.dayIndex + 2,
                  gridRow: `${startSlot + 2} / span ${rowSpan}`,
                  backgroundColor: EVENT_BG,
                  borderColor: hexToRgba("#ffffff", 0.08),
                  boxShadow: `inset 0 0 0 1px ${hexToRgba("#000000", 0.16)}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-zinc-100 text-[12px] font-semibold leading-tight">
                    {eventGroup.subject}
                  </p>
                  <div className="flex flex-wrap justify-end gap-1">
                    {sortedSegments.map((segment) => (
                      <span
                        key={`${segment.parallelCode}-${segment.startMinutes}-${segment.endMinutes}`}
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase border ${
                          segment.isPractical
                            ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                            : "border-blue-500/30 bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        P{segment.parallelCode}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {eventGroup.block !== "-" && (
                    <span
                      className="rounded-full border px-1.5 py-0.5 text-[9px] font-medium text-zinc-100"
                      style={{
                        borderColor: hexToRgba("#ffffff", 0.16),
                        backgroundColor: hexToRgba("#ffffff", 0.06),
                      }}
                    >
                      {eventGroup.block}
                    </span>
                  )}
                  {eventGroup.room !== "-" && (
                    <span
                      className="rounded-full border px-1.5 py-0.5 text-[9px] font-medium text-zinc-100"
                      style={{
                        borderColor: hexToRgba("#ffffff", 0.16),
                        backgroundColor: hexToRgba("#ffffff", 0.12),
                      }}
                    >
                      {eventGroup.room}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

export default ScheduleSection;
