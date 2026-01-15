const apiUrl = 'https://api-spider.onrender.com/api';

// Funcion para arreglar la mierda de API q hizo miguel
function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function postJson(path, body) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result || `Request failed (${response.status})`);
  return result;
}

async function fetchInfoByStudentCode(studentCode) {
  const data = await postJson('/general-info/', { student_code: studentCode })
  return {
    names: data.nombres,
    lastNames: data.apellidos,
    studentCode: data.matricula,
    email: data.correo,
    career: data.carrera,
    faculty: data.facultad,
    generalAverage: data.promediogeneral
  }
}

async function fetchGradesByStudentCode(studentCode, year, term) {
  const data = await postJson(
    '/grades/', {
      student_code: studentCode,
      year,
      term
    }
  )

  const parsedData = data.map(s => {
    return {
      subject: s.materia,
      course: s.paralelo,
      midterm1: s.nota1,
      midterm2: s.nota2,
      midterm3: s.nota3,
      state: s.estado,
      enroll: s.vez,
      grade: s.promedio
    }
  })

  return parsedData;
}

async function fetchRegisteredSubjects(studentCode) {
  const data = await postJson('/registered-subjects/', { student_code: studentCode })
  
  const parsedData = data.map(s => {
    return {
      name: s.nombre,
      code: s.cod_materia_acad,
      course: s.paralelo
    }
  })
  return parsedData
}

async function getSubjectSchedule(subjectCode, course) {
  return postJson('/subject-schedule/', { subject_code: subjectCode, course });
}

async function generateStudentSchedule(subjects) {
  const studentSchedule = await Promise.all(
    subjects.map(async (subject) => {
      const subjectScheduleRaw = await getSubjectSchedule(subject.code, subject.course);
      const subjectSchedule = toArray(subjectScheduleRaw)
      return {
        code: subject.code,
        course: subject.course,
        name: subject.name,
        schedule: subjectSchedule.map(s => ({
          block: s.bloque,
          classroom: s.aula,
          day: s.nombredia,
          startTime: s.horainicio,
          endTime: s.horafin,
        }))
      }
    }));

  return studentSchedule
}

async function getStudentCodeByFullName(names, lastNames) {
  const data = await postJson('/person/', { name: names.toUpperCase(), last_name:lastNames.toUpperCase() })
  return data[0].codestudiante
}

export async function generateStudentData(names, lastNames, studentCode, year, term) {

  if (!studentCode) {
    studentCode = await getStudentCodeByFullName(names, lastNames);
  }

  const studentInfo = await fetchInfoByStudentCode(studentCode);
  const studentGrades = await fetchGradesByStudentCode(studentCode, year, term);
  const registeredSubjects = await fetchRegisteredSubjects(studentCode);
  const generateSubjectsInfo = await generateStudentSchedule(registeredSubjects);

  const studentData = {
    personalInfo: studentInfo,
    grades: studentGrades,
    subjects: generateSubjectsInfo
  }

  return studentData
}