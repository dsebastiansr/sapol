import { fetchJson } from "./apiClient";
import type {
  CareerInfo,
  GeneralStudentInfo,
  GradeRecord,
  MeshInfo,
  PersonMatch,
  RegisteredSubject,
  StudentInfo,
} from "../types/student";

export function findPerson(name: string, lastName: string) {
  return fetchJson<PersonMatch[]>("/api/person", {
    name,
    last_name: lastName,
  });
}

export async function findStudentCodeByEmail(emailOrUser: string) {
  const username = emailOrUser.includes("@")
    ? emailOrUser.split("@")[0]
    : emailOrUser;
  const response = await fetchJson<{ cod_estudiante?: string }>(
    "/api/student-code",
    {
      user: username,
    },
  );
  return response.cod_estudiante ?? "";
}

export function getStudentInfo(studentCode: string) {
  return fetchJson<StudentInfo>("/api/info", { student_code: studentCode });
}

export function getGeneralInfo(studentCode: string) {
  return fetchJson<GeneralStudentInfo>("/api/general-info", {
    student_code: studentCode,
  });
}

export function getCareerInfo(studentCode: string) {
  return fetchJson<CareerInfo>("/api/career-info", { student_code: studentCode });
}

export function getMeshInfo(studentCode: string) {
  return fetchJson<MeshInfo>("/api/mesh-info", { student_code: studentCode });
}

export async function getGrades(
  studentCode: string,
  year: string,
  term: string,
): Promise<GradeRecord[]> {
  return fetchJson<GradeRecord[]>("/api/grades", {
    student_code: studentCode,
    year,
    term,
  });
}

export async function getRegisteredSubjects(studentCode: string) {
  return fetchJson<RegisteredSubject[]>("/api/registered-subjects", {
    student_code: studentCode,
  });
}

export async function getSubjectSchedule(subjectCode: string, course: string) {
  return fetchJson<Record<string, unknown>[]>("/api/subject-schedule", {
    subject_code: subjectCode,
    course,
  });
}

export async function getActualTerm() {
  return fetchJson<{ nombre?: string; anio: string; termino: string }>("/api/actual-term", {});
}
