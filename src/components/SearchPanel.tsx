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

  const sortedCandidates = [...candidates].sort((left, right) => {
    const leftCode = Number(left.codestudiante ?? 0);
    const rightCode = Number(right.codestudiante ?? 0);
    return rightCode - leftCode;
  });

  return (
    <SectionCard
      title="Búsqueda de Estudiantes"
      subtitle="Consulta por matrícula, correo institucional o nombre y apellido."
    >
      <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Método de búsqueda
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                method === "studentCode"
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--line-strong)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
              }`}
              type="button"
              onClick={() => onMethodChange("studentCode")}
            >
              Matrícula
            </button>
            <button
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                method === "email"
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--line-strong)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
              }`}
              type="button"
              onClick={() => onMethodChange("email")}
            >
              Correo
            </button>
            <button
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                method === "name"
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--line-strong)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
              }`}
              type="button"
              onClick={() => onMethodChange("name")}
            >
              Nombre
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid gap-3 sm:grid-cols-2">
            {method === "studentCode" && (
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                  Matrícula
                </span>
                <input
                  className="w-full rounded-xl border border-[var(--line-strong)] bg-[var(--bg-panel-2)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
                  value={studentCodeQuery}
                  onChange={(event) => onStudentCodeChange(event.target.value)}
                  placeholder="Ej. 202414389"
                />
              </label>
            )}

            {method === "email" && (
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                  Correo institucional
                </span>
                <input
                  className="w-full rounded-xl border border-[var(--line-strong)] bg-[var(--bg-panel-2)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
                  value={emailQuery}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="Ej. davisanc@espol.edu.ec"
                />
              </label>
            )}

            {method === "name" && (
              <>
                <label className="block space-y-1.5">
                  <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                    Nombre
                  </span>
                  <input
                    className="w-full rounded-xl border border-[var(--line-strong)] bg-[var(--bg-panel-2)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
                    value={nameQuery}
                    onChange={(event) => onNameChange(event.target.value)}
                    placeholder="Ej. David"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                    Apellido
                  </span>
                  <input
                    className="w-full rounded-xl border border-[var(--line-strong)] bg-[var(--bg-panel-2)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
                    value={lastNameQuery}
                    onChange={(event) => onLastNameChange(event.target.value)}
                    placeholder="Ej. Sánchez"
                  />
                </label>
              </>
            )}
          </div>

          <button
            className="w-full rounded-xl border border-[var(--accent)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto lg:min-w-[140px]"
            type="submit"
            disabled={isSearching}
          >
            {isSearching ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </form>

      {method === "name" && candidates.length > 0 && (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {candidates.length} coincidencia{candidates.length === 1 ? "" : "s"}
            </h3>
          </div>

          <div className="pretty-scroll max-h-80 space-y-3 overflow-auto pr-1">
            {sortedCandidates.map((candidate) => {
              const hasStudentCode =
                candidate.codestudiante !== null &&
                candidate.codestudiante.trim().length > 0;
              const key = `${candidate.numeroidentificacion ?? "id"}-${
                candidate.nombres
              }-${candidate.apellidos}`;

              return (
                <button
                  key={key}
                  type="button"
                  className="flex w-full flex-col gap-3 rounded-xl border border-[var(--line-soft)] bg-[var(--bg-panel-2)] px-4 py-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--bg-panel)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-row sm:items-center sm:justify-between"
                  disabled={!hasStudentCode}
                  onClick={() =>
                    hasStudentCode &&
                    onCandidateSelect(candidate.codestudiante as string)
                  }
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {toTitleCaseEs(candidate.nombres)} {toTitleCaseEs(candidate.apellidos)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[var(--line-strong)] bg-[var(--bg-panel)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)]">
                        {candidate.codestudiante || "No disponible"}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[var(--bg-panel)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition sm:min-w-[132px]">
                    Ver dashboard
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </SectionCard>
  );
}

export default SearchPanel;
