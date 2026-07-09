import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import SearchPanel from "../components/SearchPanel";
import SectionCard from "../components/SectionCard";
import StudentOverview from "../components/StudentOverview";
import ScheduleSection from "../components/ScheduleSection";
import GradesPeriodCard from "../components/grades/GradesPeriodCard";
import { ApiError } from "../services/apiClient";
import {
  findPerson,
  findStudentCodeByEmail,
  getActualTerm,
  getCareerInfo,
  getGeneralInfo,
  getGrades,
  getMeshInfo,
  getRegisteredSubjects,
  getStudentInfo,
  getSubjectSchedule,
} from "../services/studentApi";
import type {
  GradeRecord,
  PersonMatch,
  RegisteredSubject,
  SearchMethod,
  StudentDashboardData,
} from "../types/student";

const SEARCH_WINDOW_YEARS = 8;
const TERM_LABELS: Record<string, string> = {
  "1": "1S",
  "2": "2S",
};

function formatAcademicTerm(year: string, term: string) {
  return `${year} · ${TERM_LABELS[term] ?? `Período ${term}`}`;
}

function formatAcademicTermTab(year: string, term: string) {
  return `${year} ${TERM_LABELS[term] ?? `Período ${term}`}`;
}

function getPreviousAcademicTerm(year: string, term: string) {
  if (term === "1") {
    return { year: (Number(year) - 1).toString(), term: "2" };
  }
  return { year, term: "1" };
}

function toGradesCacheKey(year: string, term: string) {
  return `${year}-${term}`;
}

function buildAcademicPeriods(latestYear: string, latestTerm: string, lowerBoundYear: number) {
  const periods: Array<{ year: string; term: string; key: string; label: string }> = [];
  let currentYear = latestYear;
  let currentTerm = latestTerm;
  const maxPeriods = Math.max(2, (Number(latestYear) - lowerBoundYear + 1) * 2);

  for (let index = 0; index < maxPeriods; index += 1) {
    if (Number(currentYear) < lowerBoundYear) {
      break;
    }

    periods.push({
      year: currentYear,
      term: currentTerm,
      key: toGradesCacheKey(currentYear, currentTerm),
      label: formatAcademicTermTab(currentYear, currentTerm),
    });

    const previous = getPreviousAcademicTerm(currentYear, currentTerm);
    currentYear = previous.year;
    currentTerm = previous.term;
  }

  return periods;
}

function compareAcademicPeriodsAsc(
  left: { year: string; term: string },
  right: { year: string; term: string },
) {
  if (left.year !== right.year) {
    return Number(left.year) - Number(right.year);
  }
  return Number(left.term) - Number(right.term);
}

function getEntryYearFromStudentCode(studentCode: string) {
  const rawYear = Number(studentCode.trim().slice(0, 4));
  return Number.isFinite(rawYear) && rawYear >= 2000 ? rawYear : new Date().getFullYear();
}

async function hasGradesForTerm(studentCode: string, year: string, term: string) {
  try {
    const grades = await getGrades(studentCode, year, term);
    return grades.length > 0;
  } catch (error) {
    if (error instanceof ApiError && error.message === "Not found") {
      return false;
    }
    throw error;
  }
}

async function validateEntryTerm(studentCode: string) {
  const entryYear = getEntryYearFromStudentCode(studentCode).toString();

  if (await hasGradesForTerm(studentCode, entryYear, "1")) {
    return { year: entryYear, term: "1" };
  }

  if (await hasGradesForTerm(studentCode, entryYear, "2")) {
    return { year: entryYear, term: "2" };
  }

  return { year: entryYear, term: "1" };
}

function parsePossibleCourses(parallelValue: string | undefined) {
  if (!parallelValue) {
    return [];
  }
  return parallelValue
    .split(/[,\s/;]+/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function expandSchedulePairs(pairs: Array<{ subjectCode: string; course: string }>) {
  const expanded = new Map<string, { subjectCode: string; course: string }>();

  pairs.forEach((pair) => {
    const normalizedCourse = pair.course.trim();
    if (!normalizedCourse) {
      return;
    }

    expanded.set(`${pair.subjectCode}-${normalizedCourse}`, {
      subjectCode: pair.subjectCode,
      course: normalizedCourse,
    });

    // Practical parallels like 101/102/103 usually map to theoretical 1/2/3.
    if (/^\d{3,}$/.test(normalizedCourse)) {
      const theoreticalCourse = String(Number(normalizedCourse) % 100);
      if (theoreticalCourse !== "0") {
        expanded.set(`${pair.subjectCode}-${theoreticalCourse}`, {
          subjectCode: pair.subjectCode,
          course: theoreticalCourse,
        });
      }
    }
  });

  return Array.from(expanded.values());
}

function extractValueByCandidates(
  source: RegisteredSubject,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const rawValue = source[key];
    if (typeof rawValue === "string" && rawValue.trim().length > 0) {
      return rawValue.trim();
    }
    if (typeof rawValue === "number") {
      return rawValue.toString();
    }
  }
  return undefined;
}

function extractPairsFromRegisteredSubjects(subjects: RegisteredSubject[]) {
  const pairs = subjects.flatMap((subject) => {
    const subjectCode = extractValueByCandidates(subject, [
      "cod_materia_acad",
      "cod_materia",
      "subject_code",
    ]);
    const course = extractValueByCandidates(subject, [
      "paralelo",
      "paralelos",
      "course",
      "curso",
    ]);

    if (!subjectCode || !course) {
      return [];
    }

    return parsePossibleCourses(course).map((parallel) => ({
      subjectCode,
      course: parallel,
    }));
  });

  const uniquePairs = new Map<string, { subjectCode: string; course: string }>();
  pairs.forEach((pair) => {
    const key = `${pair.subjectCode}-${pair.course}`;
    uniquePairs.set(key, pair);
  });
  return Array.from(uniquePairs.values());
}

function extractPairsFromCurrentGrades(grades: GradeRecord[]) {
  const pairs = grades.flatMap((grade) => {
    const subjectCode = [
      grade.cod_materia_acad,
      grade.cod_materia,
      grade.subject_code,
    ].find((value) => typeof value === "string" && value.trim().length > 0) as
      | string
      | undefined;

    if (!subjectCode || !grade.paralelo) {
      return [];
    }

    return parsePossibleCourses(grade.paralelo).map((parallel) => ({
      subjectCode: subjectCode.trim(),
      course: parallel,
    }));
  });

  const uniquePairs = new Map<string, { subjectCode: string; course: string }>();
  pairs.forEach((pair) => {
    const key = `${pair.subjectCode}-${pair.course}`;
    uniquePairs.set(key, pair);
  });
  return Array.from(uniquePairs.values());
}

async function detectLatestGrades(studentCode: string) {
  const currentYear = new Date().getFullYear();
  const terms = ["2", "1"];

  for (let year = currentYear; year >= currentYear - SEARCH_WINDOW_YEARS; year -= 1) {
    for (const term of terms) {
      try {
        const grades = await getGrades(studentCode, year.toString(), term);
        if (grades.length > 0) {
          return { grades, year: year.toString(), term };
        }
      } catch (error) {
        if (error instanceof ApiError && error.message === "Not found") {
          continue;
        }
        throw error;
      }
    }
  }

  return { grades: [], year: currentYear.toString(), term: "2" };
}

function StudentDashboardContainer() {
  const [method, setMethod] = useState<SearchMethod>("studentCode");
  const [studentCodeQuery, setStudentCodeQuery] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [lastNameQuery, setLastNameQuery] = useState("");
  const [candidates, setCandidates] = useState<PersonMatch[]>([]);
  const [selectedStudentCode, setSelectedStudentCode] = useState("");

  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [validatedEntryYear, setValidatedEntryYear] = useState(new Date().getFullYear().toString());
  const [validatedEntryTerm, setValidatedEntryTerm] = useState("1");
  const [actualTermYear, setActualTermYear] = useState(new Date().getFullYear().toString());
  const [actualTermValue, setActualTermValue] = useState("1");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedTerm, setSelectedTerm] = useState("1");
  const [gradesByPeriod, setGradesByPeriod] = useState<Record<string, GradeRecord[]>>({});
  const [loadingGradesByPeriod, setLoadingGradesByPeriod] = useState<Record<string, boolean>>({});
  const [scheduleRows, setScheduleRows] = useState<Record<string, unknown>[]>([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasDashboardData = useMemo(
    () => selectedStudentCode.trim().length > 0 && dashboardData !== null,
    [selectedStudentCode, dashboardData],
  );
  const hasSchedule = scheduleRows.length > 0;
  const currentGradesKey = toGradesCacheKey(selectedYear, selectedTerm);
  const visibleGrades = gradesByPeriod[currentGradesKey] ?? [];
  const isLoadingVisibleGrades = loadingGradesByPeriod[currentGradesKey] ?? false;
  const allPeriodOptions = useMemo(
    () => buildAcademicPeriods(actualTermYear, actualTermValue, Number(validatedEntryYear)),
    [actualTermValue, actualTermYear, validatedEntryYear],
  );
  const periodOptions = useMemo(
    () =>
      allPeriodOptions
        .filter((period) => (gradesByPeriod[period.key] ?? []).length > 0)
        .slice()
        .sort(compareAcademicPeriodsAsc),
    [allPeriodOptions, gradesByPeriod],
  );
  const selectedPeriodIndex = periodOptions.findIndex((period) => period.key === currentGradesKey);
  const canGoPrevious = selectedPeriodIndex > 0;
  const canGoNext = selectedPeriodIndex >= 0 && selectedPeriodIndex < periodOptions.length - 1;

  const resetToSearch = () => {
    setSelectedStudentCode("");
    setDashboardData(null);
    setCandidates([]);
    setErrorMessage("");
    setGradesByPeriod({});
    setLoadingGradesByPeriod({});
    setScheduleRows([]);
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedTerm("1");
  };

  const loadGradesForPeriod = async (
    studentCode: string,
    year: string,
    term: string,
    options?: { silentNotFound?: boolean; prefetchOnly?: boolean },
  ) => {
    const cacheKey = toGradesCacheKey(year, term);
    if (loadingGradesByPeriod[cacheKey] || Object.prototype.hasOwnProperty.call(gradesByPeriod, cacheKey)) {
      return;
    }

    setLoadingGradesByPeriod((current) => ({ ...current, [cacheKey]: true }));
    if (!options?.prefetchOnly) {
      setErrorMessage("");
    }
    try {
      const grades = await getGrades(studentCode, year, term);
      setGradesByPeriod((current) => ({ ...current, [cacheKey]: grades }));
    } catch (error) {
      if (error instanceof ApiError && error.message === "Not found") {
        setGradesByPeriod((current) => ({ ...current, [cacheKey]: [] }));
        return;
      }
      if (!options?.prefetchOnly) {
        setErrorMessage("No fue posible consultar las notas del período seleccionado.");
      }
    } finally {
      setLoadingGradesByPeriod((current) => ({ ...current, [cacheKey]: false }));
    }
  };

  const loadCurrentSchedule = async (
    studentCode: string,
    currentGrades: GradeRecord[],
  ) => {
    let scheduleCandidates: Array<{ subjectCode: string; course: string }> = [];

    try {
      const registeredSubjects = await getRegisteredSubjects(studentCode);
      scheduleCandidates = extractPairsFromRegisteredSubjects(registeredSubjects);
    } catch {
      // Fall back to current grade data when registered subjects are unavailable.
    }

    if (scheduleCandidates.length === 0) {
      scheduleCandidates = extractPairsFromCurrentGrades(currentGrades);
    }

    if (scheduleCandidates.length === 0) {
      setScheduleRows([]);
      return;
    }

    const candidates = expandSchedulePairs(scheduleCandidates);
    const settled = await Promise.allSettled(
      candidates.map((candidate) =>
        getSubjectSchedule(candidate.subjectCode, candidate.course),
      ),
    );

    const rows = settled.flatMap((result, index) => {
      if (result.status !== "fulfilled") {
        return [];
      }
      return result.value.map((row) => ({
        ...row,
        __course: candidates[index].course,
      }));
    });

    setScheduleRows(rows);
  };

  const loadStudentDashboard = async (studentCode: string) => {
    setIsLoadingDashboard(true);
    setErrorMessage("");
    setDashboardData(null);
    setValidatedEntryYear(getEntryYearFromStudentCode(studentCode).toString());
    setValidatedEntryTerm(`${getEntryYearFromStudentCode(studentCode)}-1S`);
    setGradesByPeriod({});
    setLoadingGradesByPeriod({});
    setScheduleRows([]);

    try {
      const [infoResult, generalResult, careerResult, meshResult, actualTermResult, entryTermResult] =
        await Promise.allSettled([
          getStudentInfo(studentCode),
          getGeneralInfo(studentCode),
          getCareerInfo(studentCode),
          getMeshInfo(studentCode),
          getActualTerm(),
          validateEntryTerm(studentCode),
        ]);

      const info = infoResult.status === "fulfilled" ? infoResult.value : null;
      const generalInfo =
        generalResult.status === "fulfilled" ? generalResult.value : null;
      const careerInfo =
        careerResult.status === "fulfilled" ? careerResult.value : null;
      const meshInfo = meshResult.status === "fulfilled" ? meshResult.value : null;
      const actualTerm =
        actualTermResult.status === "fulfilled" ? actualTermResult.value : null;
      const entryTerm =
        entryTermResult.status === "fulfilled"
          ? entryTermResult.value
          : { year: getEntryYearFromStudentCode(studentCode).toString(), term: "1" };

      setDashboardData({
        info,
        generalInfo,
        careerInfo,
        meshInfo,
      });
      setValidatedEntryYear(entryTerm.year);
      setValidatedEntryTerm(`${entryTerm.year}-${TERM_LABELS[entryTerm.term] ?? entryTerm.term}`);
      const resolvedActualTermYear = actualTerm?.anio ?? entryTerm.year;
      const resolvedActualTermValue = actualTerm?.termino === "2S" ? "2" : "1";

      setActualTermYear(resolvedActualTermYear);
      setActualTermValue(resolvedActualTermValue);

      const latest = await detectLatestGrades(studentCode);
      setGradesByPeriod({
        [toGradesCacheKey(latest.year, latest.term)]: latest.grades,
      });
      await loadCurrentSchedule(studentCode, latest.grades);

      setSelectedYear(latest.year);
      setSelectedTerm(latest.term);

      const periodsToPreload = buildAcademicPeriods(
        resolvedActualTermYear,
        resolvedActualTermValue,
        Number(entryTerm.year),
      ).filter((period) => period.key !== toGradesCacheKey(latest.year, latest.term));

      void Promise.allSettled(
        periodsToPreload.map((period) =>
          loadGradesForPeriod(studentCode, period.year, period.term, {
            silentNotFound: true,
            prefetchOnly: true,
          }),
        ),
      );
    } catch {
      setErrorMessage("No fue posible cargar el dashboard del estudiante.");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const handleSearchSubmit = async () => {
    setIsSearching(true);
    setErrorMessage("");
    setCandidates([]);

    try {
      if (method === "studentCode") {
        const code = studentCodeQuery.trim();
        if (!code) {
          setErrorMessage("Ingresa una matrícula válida.");
          return;
        }
        setSelectedStudentCode(code);
        await loadStudentDashboard(code);
        return;
      }

      if (method === "email") {
        const email = emailQuery.trim().toLowerCase();
        if (!email) {
          setErrorMessage("Ingresa un correo institucional.");
          return;
        }
        const code = await findStudentCodeByEmail(email);
        if (!code) {
          setErrorMessage("No se encontró matrícula asociada a ese correo.");
          return;
        }
        setSelectedStudentCode(code);
        await loadStudentDashboard(code);
        return;
      }

      const name = nameQuery.trim().toUpperCase();
      const lastName = lastNameQuery.trim().toUpperCase();
      if (!name || !lastName) {
        setErrorMessage("Para búsqueda por nombre, ingresa al menos nombre y apellido.");
        return;
      }

      const results = await findPerson(name, lastName);
      const matches = results.filter(
        (result) =>
          result.codestudiante !== null && result.codestudiante.trim().length > 0,
      );
      setCandidates(matches);

      if (matches.length === 0) {
        setErrorMessage("No se encontraron coincidencias con matrícula activa.");
      } else if (matches.length === 1) {
        const code = matches[0].codestudiante as string;
        setSelectedStudentCode(code);
        await loadStudentDashboard(code);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(`Error de API: ${error.message}`);
      } else {
        setErrorMessage("Ocurrió un error al procesar la búsqueda.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCandidateSelect = async (studentCode: string) => {
    setSelectedStudentCode(studentCode);
    await loadStudentDashboard(studentCode);
  };

  const handlePreviousTerm = async () => {
    if (!selectedStudentCode || !canGoPrevious) {
      return;
    }

    const previous = periodOptions[selectedPeriodIndex - 1];
    const [year, term] = previous.key.split("-");
    if (!year || !term) {
      return;
    }

    setSelectedYear(year);
    setSelectedTerm(term);
    await loadGradesForPeriod(selectedStudentCode, year, term);
  };

  const handleNextTerm = async () => {
    if (!selectedStudentCode || !canGoNext) {
      return;
    }

    const next = periodOptions[selectedPeriodIndex + 1];
    const [year, term] = next.key.split("-");
    if (!year || !term) {
      return;
    }

    setSelectedYear(year);
    setSelectedTerm(term);
    await loadGradesForPeriod(selectedStudentCode, year, term);
  };

  const handleSelectPeriod = async (periodKey: string) => {
    if (!selectedStudentCode) {
      return;
    }

    const [year, term] = periodKey.split("-");
    if (!year || !term) {
      return;
    }

    setSelectedYear(year);
    setSelectedTerm(term);
    await loadGradesForPeriod(selectedStudentCode, year, term);
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 lg:px-8">
        {!hasDashboardData && !isLoadingDashboard && (
      <div className="flex min-h-[calc(100vh-3rem)] w-full items-center justify-center">
          <div className="w-full max-w-5xl">
            <SearchPanel
              method={method}
              studentCodeQuery={studentCodeQuery}
              emailQuery={emailQuery}
              nameQuery={nameQuery}
              lastNameQuery={lastNameQuery}
              candidates={candidates}
              isSearching={isSearching}
              onMethodChange={setMethod}
              onStudentCodeChange={setStudentCodeQuery}
              onEmailChange={setEmailQuery}
              onNameChange={setNameQuery}
              onLastNameChange={setLastNameQuery}
              onSearchSubmit={handleSearchSubmit}
              onCandidateSelect={handleCandidateSelect}
            />
          </div>
      </div>
        )}
      <div className="flex w-full flex-col gap-5">
        {errorMessage && (
          <SectionCard title="Error">
            <p className="text-sm text-[var(--danger)]">{errorMessage}</p>
          </SectionCard>
        )}

        {isLoadingDashboard && (
          <SectionCard title="Cargando Dashboard">
            <p className="text-sm text-[var(--text-secondary)]">
              Consultando información del estudiante en la API...
            </p>
          </SectionCard>
        )}

        {!isLoadingDashboard && hasDashboardData && (
          <div className="flex flex-col gap-4">
            <SectionCard
              title="Dashboard"
              rightSlot={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg-panel)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                  onClick={resetToSearch}
                >
                  <Plus className="h-4 w-4" />
                  Nueva busqueda
                </button>
              }
            >
              <p className="text-sm text-[var(--text-secondary)]">
                Viendo la información de la matrícula{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {selectedStudentCode}
                </span>
                .
              </p>
            </SectionCard>

            <div className="grid items-stretch gap-4 xl:grid-cols-2">
              <div className="min-w-0 h-full">
                <StudentOverview
                  studentCode={selectedStudentCode}
                  data={dashboardData}
                  validatedEntryTerm={validatedEntryTerm}
                />
              </div>
              <div className="min-w-0 h-full">
                <GradesPeriodCard
                  grades={visibleGrades}
                  periodLabel={formatAcademicTerm(selectedYear, selectedTerm)}
                  periodOptions={periodOptions}
                  selectedPeriodKey={currentGradesKey}
                  canGoPrevious={canGoPrevious}
                  canGoNext={canGoNext}
                  isLoading={isLoadingVisibleGrades}
                  onPrevious={handlePreviousTerm}
                  onNext={handleNextTerm}
                  onSelectPeriod={handleSelectPeriod}
                />
              </div>
            </div>

            {hasSchedule && (
              <ScheduleSection
                scheduleRows={scheduleRows}
                currentTermLabel={formatAcademicTermTab(actualTermYear, actualTermValue)}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default StudentDashboardContainer;
