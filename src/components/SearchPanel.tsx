import type { FormEvent } from "react";
import type { PersonMatch, SearchMethod } from "../types/student";
import { toTitleCaseEs } from "../utils/format";
import SectionCard from "./SectionCard";

interface SearchPanelProps {
  method: SearchMethod;
  studentCodeQuery: string;
  emailQuery: string;
  nameQuery: string;
  lastNameQuery: string;
  candidates: PersonMatch[];
  isSearching: boolean;
  onMethodChange: (method: SearchMethod) => void;
  onStudentCodeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSearchSubmit: () => void;
  onCandidateSelect: (studentCode: string) => void;
}

function SearchPanel(props: SearchPanelProps) {
  const {
    method,
    studentCodeQuery,
    emailQuery,
    nameQuery,
    lastNameQuery,
    candidates,
    isSearching,
    onMethodChange,
    onStudentCodeChange,
    onEmailChange,
    onNameChange,
    onLastNameChange,
    onSearchSubmit,
    onCandidateSelect,
  } = props;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit();
  };

  return (
    <SectionCard
      title="Búsqueda de Estudiantes"
      subtitle="Consulta por matrícula, correo institucional o nombre y apellido."
    >
      <form className="flex w-full items-end gap-3 overflow-x-auto pb-1" onSubmit={handleSubmit}>
        <div className="inline-flex shrink-0 rounded-xl border border-[var(--line-strong)] bg-[var(--bg-panel-2)] p-1">
          <button
            className={`px-3 py-1.5 text-sm tracking-wide transition ${
              method === "studentCode"
                ? "rounded-lg bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            type="button"
            onClick={() => onMethodChange("studentCode")}
          >
            Matrícula
          </button>
          <button
            className={`px-3 py-1.5 text-sm tracking-wide transition ${
              method === "email"
                ? "rounded-lg bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            type="button"
            onClick={() => onMethodChange("email")}
          >
            Correo
          </button>
          <button
            className={`px-3 py-1.5 text-sm tracking-wide transition ${
              method === "name"
                ? "rounded-lg bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            type="button"
            onClick={() => onMethodChange("name")}
          >
            Nombre
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-end gap-2">
          {method === "studentCode" && (
            <label className="block w-[18ch] min-w-[18ch] space-y-1">
              <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                Matrícula
              </span>
              <input
                className="w-full rounded-xl border border-[var(--line-strong)] bg-[var(--bg-panel-2)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
                value={studentCodeQuery}
                onChange={(event) => onStudentCodeChange(event.target.value)}
                placeholder="Ej. 202414389"
              />
            </label>
          )}

          {method === "email" && (
            <label className="block w-[36ch] min-w-[30ch] space-y-1">
              <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                Correo institucional
              </span>
              <input
                className="w-full rounded-xl border border-[var(--line-strong)] bg-[var(--bg-panel-2)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
                value={emailQuery}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="Ej. davisanc@espol.edu.ec"
              />
            </label>
          )}

          {method === "name" && (
            <>
              <label className="block w-[20ch] min-w-[17ch] space-y-1">
                <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                  Nombre
                </span>
                <input
                  className="w-full rounded-xl border border-[var(--line-strong)] bg-[var(--bg-panel-2)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
                  value={nameQuery}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder="Ej. David"
                />
              </label>
              <label className="block w-[24ch] min-w-[19ch] space-y-1">
                <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                  Apellido
                </span>
                <input
                  className="w-full rounded-xl border border-[var(--line-strong)] bg-[var(--bg-panel-2)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
                  value={lastNameQuery}
                  onChange={(event) => onLastNameChange(event.target.value)}
                  placeholder="Ej. Sánchez"
                />
              </label>
            </>
          )}
        </div>

        <button
          className="shrink-0 rounded-xl border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSearching}
        >
          {isSearching ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {method === "name" && candidates.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-xl border border-[var(--line-soft)]">
          <h3 className="border-b border-[var(--line-soft)] bg-[var(--bg-panel-2)] px-4 py-2 text-sm uppercase tracking-wide text-[var(--text-secondary)]">
            Resultados de coincidencia
          </h3>
          <div className="max-h-64 overflow-auto">
            <table className="min-w-full divide-y divide-[var(--line-soft)] text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">Matrícula</th>
                <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">Nombres</th>
                <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">Apellidos</th>
                <th className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">Acción</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => {
                const hasStudentCode =
                  candidate.codestudiante !== null &&
                  candidate.codestudiante.trim().length > 0;
                const key = `${candidate.numeroidentificacion ?? "id"}-${
                  candidate.nombres
                }-${candidate.apellidos}`;
                return (
                  <tr key={key}>
                    <td className="border-t border-[var(--line-soft)] px-3 py-2 text-[var(--text-secondary)]">
                      {candidate.codestudiante || "Sin matrícula"}
                    </td>
                    <td className="border-t border-[var(--line-soft)] px-3 py-2 text-[var(--text-secondary)]">
                      {toTitleCaseEs(candidate.nombres)}
                    </td>
                    <td className="border-t border-[var(--line-soft)] px-3 py-2 text-[var(--text-secondary)]">
                      {toTitleCaseEs(candidate.apellidos)}
                    </td>
                    <td className="border-t border-[var(--line-soft)] px-3 py-2">
                      <button
                        type="button"
                        className="rounded-lg border border-[var(--line-strong)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!hasStudentCode}
                        onClick={() =>
                          hasStudentCode &&
                          onCandidateSelect(candidate.codestudiante as string)
                        }
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

export default SearchPanel;
