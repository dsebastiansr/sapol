import type { GradeRecord } from "../../types/student";
import { toTitleCaseEs } from "../../utils/format";

interface GradesTableProps {
  grades: GradeRecord[];
}

function getStatusClasses(status: string | undefined) {
  if (status === "AP") {
    return "border border-[var(--status-pass-border)] bg-[var(--status-pass-bg)] text-[var(--status-pass-text)]";
  }
  if (status === "RP") {
    return "border border-[var(--status-fail-border)] bg-[var(--status-fail-bg)] text-[var(--status-fail-text)]";
  }
  return "border border-[var(--line-strong)] bg-[var(--bg-panel-2)] text-[var(--text-secondary)]";
}

function normalizeStatus(status: string | undefined) {
  const normalized = (status ?? "")
    .replace(/\u00a0/g, "")
    .replace(/&nbsp;/gi, "")
    .trim()
    .toUpperCase();
  return normalized.length > 0 ? normalized : "RP";
}

function GradesTable({ grades }: GradesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--line-soft)] bg-[var(--bg-panel)]">
      <table className="min-w-full text-sm">
        <thead className="bg-[var(--bg-panel-2)]">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">
              Materia
            </th>
            <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">
              Paralelo
            </th>
            <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">
              Parcial 1
            </th>
            <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">
              Parcial 2
            </th>
            <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">
              Mejoramiento
            </th>
            <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">
              Vez
            </th>
            <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">
              Promedio
            </th>
            <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => {
            const status = normalizeStatus(grade.estado);
            return (
              <tr key={`${grade.anio}-${grade.termino}-${grade.materia}-${grade.paralelo}`}>
                <td className="border-t border-[var(--line-soft)] px-3 py-2 text-[var(--text-primary)]">
                  {toTitleCaseEs(grade.materia)}
                </td>
                <td className="border-t border-[var(--line-soft)] px-3 py-2 text-[var(--text-secondary)]">
                  {grade.paralelo}
                </td>
                <td className="border-t border-[var(--line-soft)] px-3 py-2 text-[var(--text-secondary)]">
                  {grade.nota1 ?? "-"}
                </td>
                <td className="border-t border-[var(--line-soft)] px-3 py-2 text-[var(--text-secondary)]">
                  {grade.nota2 ?? "-"}
                </td>
                <td className="border-t border-[var(--line-soft)] px-3 py-2 text-[var(--text-secondary)]">
                  {grade.nota3 ?? "-"}
                </td>
                <td className="border-t border-[var(--line-soft)] px-3 py-2 text-[var(--text-secondary)]">
                  {grade.vez ?? "-"}
                </td>
                <td className="border-t border-[var(--line-soft)] px-3 py-2 text-[var(--text-secondary)]">
                  {grade.promedio?.toFixed(2) ?? "-"}
                </td>
                <td className="border-t border-[var(--line-soft)] px-3 py-2 text-[var(--text-secondary)]">
                  <span
                    className={`inline-flex min-w-14 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                      status,
                    )}`}
                  >
                    {status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default GradesTable;
