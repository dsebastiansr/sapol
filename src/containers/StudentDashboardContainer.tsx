import { useMemo, useState } from "react";
import SearchPanel from "../components/SearchPanel";
import SectionCard from "../components/SectionCard";
import StudentOverview from "../components/StudentOverview";
import ScheduleSection from "../components/ScheduleSection";
import CurrentGradesCard from "../components/grades/CurrentGradesCard";
import PastGradesCard from "../components/grades/PastGradesCard";
import { ApiError } from "../services/apiClient";
import {
  findPerson,
  findStudentCodeByEmail,
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
  "0": "PAE",
  "1": "PAO 1",
  "2": "PAO 2",
};

function formatAcademicTerm(year: string, term: string) {
  return `${year} · ${TERM_LABELS[term] ?? `Período ${term}`}`;
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

function parseEntranceYearFromStudentCode(studentCode: string | undefined): number | null {
  if (!studentCode) {
    return null;
  }
  const match = studentCode.match(/^\d{4}/);
  if (!match) {
    return null;
  }
  const year = Number(match[0]);
  return Number.isFinite(year) ? year : null;
}

async function detectLatestGrades(studentCode: string) {
  const currentYear = new Date().getFullYear();
  const terms = ["2", "1", "0"];

  const entranceYear = parseEntranceYearFromStudentCode(studentCode);
  const lowerBound =
    entranceYear && entranceYear <= currentYear
      ? entranceYear
      : currentYear - SEARCH_WINDOW_YEARS;

  for (let year = currentYear; year >= lowerBound; year -= 1) {
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
  const [latestGrades, setLatestGrades] = useState<GradeRecord[]>([]);
  const [latestLabel, setLatestLabel] = useState("Sin datos");
  const [pastGrades, setPastGrades] = useState<GradeRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedTerm, setSelectedTerm] = useState("2");
  const [scheduleRows, setScheduleRows] = useState<Record<string, unknown>[]>([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isLoadingPastGrades, setIsLoadingPastGrades] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const hasDashboardData = useMemo(
    () => selectedStudentCode.trim().length > 0 && dashboardData !== null,
    [selectedStudentCode, dashboardData],
  );
  const hasSchedule = scheduleRows.length > 0;
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const entranceYear = parseEntranceYearFromStudentCode(selectedStudentCode);
    const lowerBound = entranceYear && entranceYear <= currentYear ? entranceYear : currentYear;

    const years: string[] = [];
    for (let year = currentYear; year >= lowerBound; year -= 1) {
      years.push(year.toString());
    }

    if (!years.includes(selectedYear)) {
      years.push(selectedYear);
    }

    return years.sort((a, b) => Number(b) - Number(a));
  }, [selectedStudentCode, selectedYear]);

  const loadPastGrades = async (studentCode: string, year: string, term: string) => {
    setIsLoadingPastGrades(true);
    setErrorMessage("");
    try {
      const grades = await getGrades(studentCode, year, term);
      setPastGrades(grades);
    } catch (error) {
      if (error instanceof ApiError && error.message === "Not found") {
        setPastGrades([]);
        return;
      }
      setErrorMessage("No fue posible consultar las notas del período seleccionado.");
    } finally {
      setIsLoadingPastGrades(false);
    }
  };

  const loadCurrentSchedule = async (
    studentCode: string,
    currentGrades: GradeRecord[],
  ) => {
    const MAX_PAIRS = 8;
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

    const candidates = scheduleCandidates.slice(0, MAX_PAIRS);
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
    setInfoMessage("");
    setDashboardData(null);
    setLatestGrades([]);
    setPastGrades([]);
    setScheduleRows([]);

    try {
      const [infoResult, generalResult, careerResult, meshResult] =
        await Promise.allSettled([
          getStudentInfo(studentCode),
          getGeneralInfo(studentCode),
          getCareerInfo(studentCode),
          getMeshInfo(studentCode),
        ]);

      const info = infoResult.status === "fulfilled" ? infoResult.value : null;
      const generalInfo =
        generalResult.status === "fulfilled" ? generalResult.value : null;
      const careerInfo =
        careerResult.status === "fulfilled" ? careerResult.value : null;
      const meshInfo = meshResult.status === "fulfilled" ? meshResult.value : null;

      setDashboardData({
        info,
        generalInfo,
        careerInfo,
        meshInfo,
      });

      const latest = await detectLatestGrades(studentCode);
      setLatestGrades(latest.grades);
      setLatestLabel(formatAcademicTerm(latest.year, latest.term));
      await loadCurrentSchedule(studentCode, latest.grades);

      setSelectedYear(latest.year);
      setSelectedTerm(latest.term);
      await loadPastGrades(studentCode, latest.year, latest.term);
    } catch {
      setErrorMessage("No fue posible cargar el dashboard del estudiante.");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const handleSearchSubmit = async () => {
    setIsSearching(true);
    setErrorMessage("");
    setInfoMessage("");
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
        setInfoMessage("No se encontraron coincidencias con matrícula activa.");
      } else if (matches.length === 1) {
        const code = matches[0].codestudiante as string;
        setSelectedStudentCode(code);
        await loadStudentDashboard(code);
      } else {
        setInfoMessage(
          "Se encontraron múltiples coincidencias. Selecciona el estudiante correcto.",
        );
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

  const handlePastSearch = async () => {
    if (!selectedStudentCode) {
      setErrorMessage("Primero selecciona un estudiante.");
      return;
    }
    await loadPastGrades(selectedStudentCode, selectedYear, selectedTerm);
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 lg:px-8">
      <div className="flex w-full flex-col gap-5">
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

        {errorMessage && (
          <SectionCard title="Error">
            <p className="text-sm text-[var(--danger)]">{errorMessage}</p>
          </SectionCard>
        )}

        {infoMessage && (
          <SectionCard title="Estado">
            <p className="text-sm text-[var(--text-secondary)]">{infoMessage}</p>
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
            <div className="flex flex-col gap-4 xl:flex-row">
              <div className="min-w-0 flex-1">
                <CurrentGradesCard latestGrades={latestGrades} latestLabel={latestLabel} />
              </div>
              <div className="min-w-0 flex-1">
                <PastGradesCard
                  pastGrades={pastGrades}
                  yearOptions={yearOptions}
                  selectedYear={selectedYear}
                  selectedTerm={selectedTerm}
                  isLoadingPast={isLoadingPastGrades}
                  onYearChange={setSelectedYear}
                  onTermChange={setSelectedTerm}
                  onLoadPast={handlePastSearch}
                />
              </div>
            </div>

            {hasSchedule && <ScheduleSection scheduleRows={scheduleRows} />}
            <StudentOverview studentCode={selectedStudentCode} data={dashboardData} />
          </div>
        )}
      </div>
    </main>
  );
}

export default StudentDashboardContainer;
