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
        setNotas(data.notas || []);
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

  const handleNotaChange = (index, campo, value) => {

    const updatedNotas = [...notas];
    

    if (!updatedNotas[index]) {
      updatedNotas[index] = {
        alumno_id: parseInt(seleccionarAlumno), 
        materia_id: materias[index].id,      
        nota1: null,  
        nota2: null,
        nota3: null,
      };
    }
    

    updatedNotas[index][campo] = value === "" ? null : parseFloat(value);
    
    setNotas(updatedNotas);
  };




  const handleGuardar = async () => {
    setLoading(true);

    try {
      for (const nota of notas) {
        await fetchAuth("http://localhost:3000/api/notas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nota),
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
      (n) => n !== null && n !== undefined
    );
    
    if (notasValid.length === 0) return null;
    
    return notasValid.reduce((sum, n) => sum + n, 0) / notasValid.length;
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
              <div className={styles.average}>
                Promedio General: {promedioGeneral.toFixed(2)}
              </div>
            )}
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Materia</th>
                <th>Código</th>
                <th>Nota 1</th>
                <th>Nota 2</th>
                <th>Nota 3</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {materias.map((materia, index) => {
                const nota = notas.find((n) => n.materia_id === materia.id);
                
                const promedio = nota ? calcularPromedio(nota) : null;

                return (
                  <tr key={materia.id}>
                    <td>{materia.nombre}</td>
                    <td>{materia.codigo}</td>
                    
                    <td>
                      <input
                        type="number"
                        step="0.1"  
                        min="0"
                        max="10"
                        className={styles.noteInput}
                        value={nota?.nota1 ?? ""}  
                        onChange={(e) =>
                          handleNotaChange(index, "nota1", e.target.value)
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
                          handleNotaChange(index, "nota2", e.target.value)
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
                          handleNotaChange(index, "nota3", e.target.value)
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
