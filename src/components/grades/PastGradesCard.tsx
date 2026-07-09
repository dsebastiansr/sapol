import type { GradeRecord } from "../../types/student";
import SectionCard from "../SectionCard";
import GradesTable from "./GradesTable";

interface PastGradesCardProps {
  pastGrades: GradeRecord[];
  yearOptions: string[];
  selectedYear: string;
  selectedTerm: string;
  isLoadingPast: boolean;
  onYearChange: (value: string) => void;
  onTermChange: (value: string) => void;
  onLoadPast: () => void;
}

function PastGradesCard({
  pastGrades,
  yearOptions,
  selectedYear,
  selectedTerm,
  isLoadingPast,
  onYearChange,
  onTermChange,
  onLoadPast,
}: PastGradesCardProps) {
  return (
    <SectionCard
      title="Notas de Períodos Pasados"
      className="h-full"
      bodyClassName="flex h-full flex-col"
      rightSlot={
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-[var(--line-strong)] bg-[var(--bg-panel-2)] px-2 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            value={selectedYear}
            onChange={(event) => onYearChange(event.target.value)}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-[var(--line-strong)] bg-[var(--bg-panel-2)] px-2 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            value={selectedTerm}
            onChange={(event) => onTermChange(event.target.value)}
          >
            <option value="0">PAE</option>
            <option value="1">PAO 1</option>
            <option value="2">PAO 2</option>
          </select>
          <button
            type="button"
            className="rounded-lg border border-[var(--line-strong)] bg-[var(--bg-panel)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onLoadPast}
            disabled={isLoadingPast}
          >
            {isLoadingPast ? "Cargando..." : "Consultar"}
          </button>
        </div>
      }
    >
      {pastGrades.length > 0 ? (
        <GradesTable grades={pastGrades} />
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">
          Sin resultados para el año y término seleccionados.
        </p>
      )}
    </SectionCard>
  );
}

export default PastGradesCard;
