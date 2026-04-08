import type { StudentDashboardData } from "../types/student";
import { formatDateDDMMYYYY, toTitleCaseEs } from "../utils/format";
import SectionCard from "./SectionCard";

interface StudentOverviewProps {
  studentCode: string;
  data: StudentDashboardData | null;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "No disponible";
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    const hasLetters = /\p{L}/u.test(trimmed);
    const isUppercaseText =
      hasLetters && trimmed === trimmed.toLocaleUpperCase("es-EC");
    return isUppercaseText ? toTitleCaseEs(trimmed) : trimmed;
  }
  return String(value);
}

function StudentOverview({ studentCode, data }: StudentOverviewProps) {
  if (!data) {
    return (
      <SectionCard title="Información General">
        <p className="text-sm text-[var(--text-secondary)]">
          Selecciona un estudiante para mostrar su perfil académico.
        </p>
      </SectionCard>
    );
  }

  const displayName =
    data.generalInfo?.nombres && data.generalInfo?.apellidos
      ? `${data.generalInfo.nombres} ${data.generalInfo.apellidos}`
      : data.info?.nombrecompleto ?? "No disponible";

  return (
    <SectionCard title="Información General" subtitle={`Matrícula: ${studentCode}`}>
      <div className="flex flex-wrap gap-2">
        <div className="rounded-lg border border-[var(--line-soft)] bg-[var(--bg-panel-2)] px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            Estudiante
          </p>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {formatValue(displayName)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--line-soft)] bg-[var(--bg-panel-2)] px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Correo</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {formatValue(data.generalInfo?.correo ?? data.info?.email)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--line-soft)] bg-[var(--bg-panel-2)] px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Carrera</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {formatValue(data.generalInfo?.carrera ?? data.meshInfo?.nombrecarrera)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--line-soft)] bg-[var(--bg-panel-2)] px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            Promedio
          </p>
          <p className="text-sm font-medium text-[var(--accent-soft)]">
            {formatValue(data.generalInfo?.promediogeneral ?? data.info?.promediogeneral)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 rounded-xl border border-[var(--line-soft)] bg-[var(--bg-panel-2)] p-3">
        <div className="min-w-[160px] flex-1">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            Identificación
          </p>
          <p className="text-sm text-[var(--text-primary)]">
            {formatValue(data.generalInfo?.identificacion ?? data.info?.identificacion)}
          </p>
        </div>
        <div className="min-w-[120px] flex-1">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Usuario</p>
          <p className="text-sm text-[var(--text-primary)]">
            {formatValue(data.generalInfo?.usuario)}
          </p>
        </div>
        <div className="min-w-[220px] flex-[2]">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Facultad</p>
          <p className="text-sm text-[var(--text-primary)]">
            {formatValue(data.generalInfo?.facultad)}
          </p>
        </div>
        <div className="min-w-[140px] flex-1">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            Nacimiento
          </p>
          <p className="text-sm text-[var(--text-primary)]">
            {formatDateDDMMYYYY(data.generalInfo?.fechanacimiento)}
          </p>
        </div>
        <div className="min-w-[120px] flex-1">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            Ingreso
          </p>
          <p className="text-sm text-[var(--text-primary)]">
            {formatValue(data.careerInfo?.terminoingreso)}
          </p>
        </div>
        <div className="min-w-[110px] flex-1">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            Tomadas
          </p>
          <p className="text-sm text-[var(--text-primary)]">
            {formatValue(data.careerInfo?.materiastomadas)}
          </p>
        </div>
        <div className="min-w-[110px] flex-1">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            Aprobadas
          </p>
          <p className="text-sm text-[var(--text-primary)]">
            {formatValue(data.careerInfo?.materiasaprobadas)}
          </p>
        </div>
        <div className="min-w-[110px] flex-1">
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            Créditos mín.
          </p>
          <p className="text-sm text-[var(--text-primary)]">
            {formatValue(data.careerInfo?.creditosmin)}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

export default StudentOverview;
