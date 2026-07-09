import type { StudentDashboardData } from "../types/student";
import { formatDateDDMMYYYY, toTitleCaseEs } from "../utils/format";
import SectionCard from "./SectionCard";

interface StudentOverviewProps {
  studentCode: string;
  data: StudentDashboardData | null;
  validatedEntryTerm?: string;
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

function StudentOverview({ studentCode, data, validatedEntryTerm }: StudentOverviewProps) {
  if (!data) {
    return (
      <SectionCard title="Info Estudiante" className="h-full" bodyClassName="flex h-full flex-col">
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

  const summaryItems = [
    { label: "Matrícula", value: studentCode },
    { label: "Identificación", value: data.generalInfo?.identificacion ?? data.info?.identificacion },
    { label: "Usuario", value: data.generalInfo?.usuario },
    { label: "Nacimiento", value: formatDateDDMMYYYY(data.generalInfo?.fechanacimiento) },
    { label: "Facultad", value: data.generalInfo?.facultad },
    { label: "Carrera", value: data.generalInfo?.carrera ?? data.meshInfo?.nombrecarrera },
    { label: "Ingreso", value: validatedEntryTerm ?? data.careerInfo?.terminoingreso },
    { label: "Promedio", value: data.generalInfo?.promediogeneral ?? data.info?.promediogeneral, accent: true },
  ];

  return (
    <SectionCard title="Info Estudiante" className="h-full" bodyClassName="flex h-full flex-col gap-4">
      <div>
        <h3 className="text-2xl font-semibold leading-tight text-[var(--text-primary)]">
          {formatValue(displayName)}
        </h3>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          {formatValue(data.generalInfo?.correo ?? data.info?.email)}
        </p>
      </div>

      <div className="grid gap-10 pt-4 sm:grid-cols-4">
        {summaryItems.map((item) => (
          <div key={item.label}>
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
              {item.label}
            </p>
            <p className={`mt-1 text-sm font-medium ${item.accent ? 'text-(--accent-soft)' : 'text-white'}`}>
              {formatValue(item.value)}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export default StudentOverview;
