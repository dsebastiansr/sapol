import { useState } from 'react';
import { generateStudentData } from './GetStudentInfo';
import { WeeklyScheduleTable } from './WeeklyScheduleTable';
import { StudentInfo } from './StudentInfo';
import { CurrentSubjects } from './CurrentSubjects';
import { InstagramButton } from './InstagramButton';

function App() {
  const [studentCode, setStudentCode] = useState();
  const [studentData, setStudentData] = useState();
  const [studentNames, setStudentNames] = useState();
  const [studentLastNames, setStudentLastNames] = useState();
  const [year, setYear] = useState();
  const [term, setTerm] = useState();

  const [error, setError] = useState('');

  const handleFetch = async () => {
    setError('');
    setStudentData(undefined);

    if (!year) {
      setError('Ingresar año!');
      return;
    }

    if (!term) {
      setError('Ingresar término!');
      return;
    }

    if (!studentNames && !studentLastNames && !studentCode) {
      setError('Ingresar Nombres o Matricula!');
      return;
    }

    try {
      const data = await generateStudentData(
        studentNames,
        studentLastNames,
        studentCode,
        year,
        term
      );
      setStudentData(data);
      if (!studentCode) {
        setStudentCode(data.personalInfo.studentCode);
        console.log(studentData);
      }
    } catch (e) {
      setError(e);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col gap-4 bg-black w-full p-12 max-md:p-4 antialiased">
      <div className="h-full w-full flex flex-col gap-3">

        <div className="p-4 bg-[#202226] rounded-2xl border border-white/10 flex flex-wrap items-center gap-3">
          <InstagramButton
            href="https://instagram.com/dsebastiansr24"
            handle="dsebastiansr24"
          />
          <p className='text-white/70'>Para poder sapear la nota de tu panita ingresa sus  <span className='underline underline-offset-2'>nombres</span> o su <span className='underline underline-offset-2'>matrícula</span> y obvio, el año y termino del semestre a sapear.<br/>Si la pagina se pone todo en blanco es porque ingresaste mal la data o no existe informacion de tu panita en ese año/termino. Algún dia arreglaré eso.</p>
        </div>

        <div className="p-4 bg-[#202226] rounded-2xl border border-white/10 flex flex-wrap items-end gap-4">


          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wide text-white/70">
              Nombres
            </span>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
              <input
                className="w-56 bg-transparent outline-none text-white/90 placeholder:text-white/30 text-base"
                type="text"
                value={studentNames}
                onChange={(e) => setStudentNames(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wide text-white/70">
              Apellidos
            </span>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
              <input
                className="w-56 bg-transparent outline-none text-white/90 placeholder:text-white/30 text-base"
                type="text"
                value={studentLastNames}
                onChange={(e) => setStudentLastNames(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wide text-white/70">
              Matrícula
            </span>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
              <input
                className="w-40 bg-transparent outline-none text-white/90 placeholder:text-white/30 text-base text-center tabular-nums"
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wide text-white/70">
              Año
            </span>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
              <input
                className="w-28 bg-transparent outline-none text-white/90 placeholder:text-white/30 text-base text-center tabular-nums"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wide text-white/70">
              Término
            </span>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
              <input
                className="w-28 bg-transparent outline-none text-white/90 placeholder:text-white/30 text-base text-center tabular-nums"
                type="number"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="group">
            <button
              onClick={handleFetch}
              className="
                h-11 px-8 rounded-2xl font-bold text-white cursor-pointer
                bg-[#1f74e6]
                border border-white/10
                transition-all duration-250
                hover:bg-[#2c84f7]
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2282ff]
                relative overflow-hidden
              "
            >
              <span className="relative z-10">Buscar</span>

            </button>
          </div>

          {error && (
            <div className="ml-auto rounded-2xl border border-red-400/20 bg-red-500/15 px-5 py-2 text-red-200 text-sm font-semibold">
              {error}
            </div>
          )}

 

        </div>

        {studentData && <StudentInfo studentData={studentData} />}
        {studentData && <CurrentSubjects year={year} term={term} subjects={studentData.grades} />}
        {studentData && (
          <WeeklyScheduleTable
            key={`${
              studentCode || studentData.personalInfo.studentCode
            }-${year}-${term}`}
            subjects={studentData.subjects}
          />
        )}
      </div>
    </div>
  );
}

export default App;
