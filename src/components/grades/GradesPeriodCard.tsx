import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GradeRecord } from "../../types/student";
import SectionCard from "../SectionCard";
import GradesTable from "./GradesTable";

interface GradePeriodOption {
  key: string;
  label: string;
}

interface GradesPeriodCardProps {
  grades: GradeRecord[];
  periodLabel: string;
  periodOptions: GradePeriodOption[];
  selectedPeriodKey: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSelectPeriod: (periodKey: string) => void;
}

function GradesPeriodCard({
  grades,
  periodLabel,
  periodOptions,
  selectedPeriodKey,
  canGoPrevious,
  canGoNext,
  isLoading,
  onPrevious,
  onNext,
  onSelectPeriod,
}: GradesPeriodCardProps) {
  return (
    <SectionCard
      title="Notas"
      className="h-full"
      bodyClassName="flex flex-col"
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold">{periodLabel}</h2>
      </div>

      <div>
        {isLoading ? (
          <p className="text-sm text-[var(--text-secondary)]">Cargando notas del período...</p>
        ) : grades.length > 0 ? (
          <GradesTable grades={grades} />
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            No hay información para este período.
          </p>
        )}
      </div>

      {periodOptions.length > 0 && (
        <div className="mt-4 flex items-start gap-2">
          <button
            type="button"
            className="shrink-0 rounded-lg border border-[var(--line-strong)] bg-[var(--bg-panel)] p-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading}
            aria-label="Período anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap justify-center gap-2">
              {periodOptions.map((period) => {
                const isActive = period.key === selectedPeriodKey;
                return (
                  <button
                    key={period.key}
                    type="button"
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                      isActive
                        ? "border-(--accent) bg-(--accent) text-white"
                        : "border-(--line-strong) bg-(--bg-panel) text-(--text-secondary) hover:border-(--accent) hover:text-(--text-primary)"
                    }`}
                    onClick={() => onSelectPeriod(period.key)}
                    disabled={isLoading && isActive}
                  >
                    {period.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="shrink-0 rounded-lg border border-[var(--line-strong)] bg-[var(--bg-panel)] p-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            aria-label="Período siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </SectionCard>
  );
}

export default GradesPeriodCard;
