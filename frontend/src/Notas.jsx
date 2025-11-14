import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./Auth";
import styles from "./Notas.module.css";

export const Notas = () => {

const { fetchAuth } = useAuth();
const [alumnos, setAlumnos] = useState([]);
const [materias, setMaterias] = useState([]);
const [notas, setNotas] = useState([]);
const [seleccionarAlumno, setSeleccionarAlumno] = useState("");

const [loading, setLoading] = useState(false);

const cargarAlumnos = useCallback(async () => {
try {
const response = await fetchAuth("http://localhost:3000/api/alumnos");
const data = await response.json();

      if (response.ok) {
        setAlumnos(data.alumnos || []);
      }
    } catch (error) {
      if (!error.message.includes("no iniciaste sesión")) {
        console.error("Error:", error);
      }
    }

}, [fetchAuth]);

const cargarMaterias = useCallback(async () => {
try {
const response = await fetchAuth("http://localhost:3000/api/materias");
const data = await response.json();

      if (response.ok) {
        setMaterias(data.materias || []);
      }
    } catch (error) {
      if (!error.message.includes("no iniciaste sesión")) {
        console.error("Error:", error);
      }
    }

}, [fetchAuth]);

const cargarNotas = useCallback(async () => {
try {

      const response = await fetchAuth(
        `http://localhost:3000/api/notas/alumno/${seleccionarAlumno}`
      );
      const data = await response.json();

      if (response.ok) {
        // Convertir las notas de string a número
        const notasConvertidas = (data.notas || []).map((nota) => ({
          ...nota,
          nota1: nota.nota1 !== null ? parseFloat(nota.nota1) : null,
          nota2: nota.nota2 !== null ? parseFloat(nota.nota2) : null,
          nota3: nota.nota3 !== null ? parseFloat(nota.nota3) : null,
        }));
        setNotas(notasConvertidas);
      }
    } catch (error) {
      if (!error.message.includes("no iniciaste sesión")) {
        console.error("Error:", error);
      }
    }

}, [fetchAuth, seleccionarAlumno]);

useEffect(() => {
cargarAlumnos();
cargarMaterias();
}, [fetchAuth, cargarAlumnos, cargarMaterias]);

useEffect(() => {
if (seleccionarAlumno) {
cargarNotas();
} else {
setNotas([]);
}
}, [seleccionarAlumno, fetchAuth, cargarNotas]);

const handleNotaChange = (materiaId, campo, value) => {
setNotas((prevNotas) => {
const notaExistente = prevNotas.find((n) => n.materia_id === materiaId);

      if (notaExistente) {

        return prevNotas.map((n) =>
          n.materia_id === materiaId
            ? { ...n, [campo]: value === "" ? null : parseFloat(value) }
            : n
        );
      } else {

        return [
          ...prevNotas,
          {
            alumno_id: parseInt(seleccionarAlumno),
            materia_id: materiaId,
            nota1: campo === "nota1" ? (value === "" ? null : parseFloat(value)) : null,
            nota2: campo === "nota2" ? (value === "" ? null : parseFloat(value)) : null,
            nota3: campo === "nota3" ? (value === "" ? null : parseFloat(value)) : null,
          },
        ];
      }
    });

};

const handleGuardar = async () => {
setLoading(true);

    try {
      for (const nota of notas) {
        const notaParaBackend = {
          alumnoId: nota.alumno_id,
          materiaId: nota.materia_id,
          nota1: nota.nota1 !== null && nota.nota1 !== undefined ? nota.nota1 : null,
          nota2: nota.nota2 !== null && nota.nota2 !== undefined ? nota.nota2 : null,
          nota3: nota.nota3 !== null && nota.nota3 !== undefined ? nota.nota3 : null,
        };

        await fetchAuth("http://localhost:3000/api/notas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notaParaBackend),
        });
      }

      alert("Notas guardadas exitosamente");

      await cargarNotas();
    } catch (error) {
      console.error("Error al guardar notas:", error);
      alert("Error al guardar las notas");
    } finally {
      setLoading(false);
    }

};

const calcularPromedio = (nota) => {
const notasValid = [nota.nota1, nota.nota2, nota.nota3].filter(
(n) => n !== null && n !== undefined && !isNaN(n) && typeof n === 'number'
);

    if (notasValid.length === 0) return null;

    const suma = notasValid.reduce((sum, n) => sum + parseFloat(n), 0);
    const promedio = suma / notasValid.length;

    return isNaN(promedio) ? null : promedio;

};

const calcularPromedioGeneral = () => {
const promedios = notas
.map(calcularPromedio)
.filter((p) => p !== null);

    if (promedios.length === 0) return null;

    return promedios.reduce((sum, p) => sum + p, 0) / promedios.length;

};

const promedioGeneral = calcularPromedioGeneral();

return (
<div className={styles.container}>
<div className={styles.header}>
<h2 className={styles.title}>Notas</h2>

        <div className={styles.selectGroup}>
          <label className={styles.label} htmlFor="alumnoSelect">
            Seleccionar Alumno
          </label>
          <select
            id="alumnoSelect"
            className={styles.select}
            value={seleccionarAlumno}
            onChange={(e) => setSeleccionarAlumno(e.target.value)}
          >
            <option value="">Seleccionar</option>

            {alumnos.map((alumno) => (
              <option key={alumno.id} value={alumno.id}>
                {alumno.apellido}, {alumno.nombre} - DNI: {alumno.dni}
              </option>
            ))}
          </select>
        </div>
      </div>

      {seleccionarAlumno && materias.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Calificaciones</h3>

            {promedioGeneral !== null && (
              <div className={styles.promedio}>
                Promedio General: {promedioGeneral.toFixed(2)}
              </div>
            )}
          </div>

          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Materia</th>
                <th>Código</th>
                <th>Año</th>
                <th>Nota 1</th>
                <th>Nota 2</th>
                <th>Nota 3</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {materias
                .sort((a, b) => a.anio - b.anio)
                .map((materia) => {
                const nota = notas.find((n) => n.materia_id === materia.id);

                const promedio = nota ? calcularPromedio(nota) : null;

                return (
                  <tr key={materia.id}>
                    <td>{materia.nombre}</td>
                    <td>{materia.codigo}</td>
                    <td>{materia.anio}</td>

                    <td>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className={styles.noteInput}
                        value={nota?.nota1 ?? ""}
                        onChange={(e) =>
                          handleNotaChange(materia.id, "nota1", e.target.value)
                        }
                        disabled={loading}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className={styles.noteInput}
                        value={nota?.nota2 ?? ""}
                        onChange={(e) =>
                          handleNotaChange(materia.id, "nota2", e.target.value)
                        }
                        disabled={loading}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className={styles.noteInput}
                        value={nota?.nota3 ?? ""}
                        onChange={(e) =>
                          handleNotaChange(materia.id, "nota3", e.target.value)
                        }
                        disabled={loading}
                      />
                    </td>

                    <td className={styles.averageCell}>
                      {promedio !== null ? promedio.toFixed(2) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button
            className={styles.saveBtn}
            onClick={handleGuardar}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Notas"}
          </button>
        </div>
      )}

      {!seleccionarAlumno && (
        <div className={styles.card}>
          <p className={styles.empty}>Selecciona un alumno para ver y editar sus notas</p>
        </div>
      )}

      {seleccionarAlumno && materias.length === 0 && (
        <div className={styles.card}>
          <p className={styles.empty}>no hay materias registradas</p>
        </div>
      )}
    </div>

);
};
