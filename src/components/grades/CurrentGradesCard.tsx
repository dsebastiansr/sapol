import type { GradeRecord } from "../../types/student";
import SectionCard from "../SectionCard";
import GradesTable from "./GradesTable";

interface CurrentGradesCardProps {
  latestGrades: GradeRecord[];
  latestLabel: string;
}

function CurrentGradesCard({ latestGrades, latestLabel }: CurrentGradesCardProps) {
  return (
    <SectionCard
      title="Notas Actuales"
      subtitle={`Último período detectado: ${latestLabel}`}
      className="h-full"
      bodyClassName="flex h-full flex-col"
    >
      {latestGrades.length > 0 ? (
        <GradesTable grades={latestGrades} />
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">
          No se encontraron notas para el período actual.
        </p>
      )}
    </SectionCard>
  );
}

export default CurrentGradesCard;
