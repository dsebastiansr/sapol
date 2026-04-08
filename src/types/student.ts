export type SearchMethod = "studentCode" | "name" | "email";

export interface PersonMatch {
  codestudiante: string | null;
  numeroidentificacion: string | null;
  nombres: string;
  apellidos: string;
}

export interface StudentInfo {
  cod_estudiante: string;
  identificacion: string;
  nombrecompleto: string;
  email: string;
  promediogeneral?: number;
  [key: string]: unknown;
}

export interface GeneralStudentInfo {
  usuario?: string;
  matricula?: string;
  identificacion?: string;
  nombres?: string;
  apellidos?: string;
  correo?: string;
  carrera?: string;
  facultad?: string;
  foto?: string;
  promediogeneral?: number;
  [key: string]: unknown;
}

export interface CareerInfo {
  creditosmin?: number;
  creditosreg?: number;
  terminoingreso?: string;
  materiastomadas?: number;
  materiasaprobadas?: number;
  cod_estudiante?: string;
  [key: string]: unknown;
}

export interface MeshInfo {
  idcarrera?: number;
  codcarrera?: string;
  nombrecarrera?: string;
  idmalla?: number;
  version?: number;
  url?: string;
  [key: string]: unknown;
}

export interface GradeRecord {
  anio: string;
  termino: string;
  materia: string;
  paralelo: string;
  nota1?: number;
  nota2?: number;
  nota3?: number;
  promedio?: number;
  vez?: number;
  estado?: string;
  [key: string]: unknown;
}

export interface RegisteredSubject {
  [key: string]: unknown;
}

export interface StudentDashboardData {
  info: StudentInfo | null;
  generalInfo: GeneralStudentInfo | null;
  careerInfo: CareerInfo | null;
  meshInfo: MeshInfo | null;
}
