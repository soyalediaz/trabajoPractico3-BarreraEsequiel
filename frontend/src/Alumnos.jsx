import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './Auth';
import styles from './Alumnos.module.css';

export const Alumnos = () => {
    const { fetchAuth } = useAuth();
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formulario, setFormulario] = useState({
        id: null,
        nombre: '',
        apellido: '',
        dni: '',
    });
    const [mostrarForm, setMostrarForm] = useState(false);

    const cargarAlumnos = useCallback(async () => {
        try {
            const response = await fetchAuth('http://localhost:3000/api/alumnos');
            const data = await response.json();

            if (response.ok) {
                setAlumnos(data.alumnos || []);
            } else {
                console.error('Error al cargar los alumnos:', data.error);
            }
        } catch (error) {
            if (!error.message.includes('No se ha iniciado la sesión')) {
                console.error('error:', error);
            }
        }
    }, [fetchAuth]);

    useEffect(() => {
        cargarAlumnos();
    }, [cargarAlumnos]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (formulario.id) {
                await fetchAuth(`http://localhost:3000/api/alumnos/${formulario.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: formulario.nombre,
                        apellido: formulario.apellido,
                        dni: parseInt(formulario.dni, 10),
                    }),
                });
            } else {
                await fetchAuth('http://localhost:3000/api/alumnos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: formulario.nombre,
                        apellido: formulario.apellido,
                        dni: parseInt(formulario.dni, 10),
                    }),
                });
            }

            setMostrarForm(false);
            setFormulario({ id: null, nombre: '', apellido: '', dni: '' });
            await cargarAlumnos();
        } catch (error) {
            console.error('Error al guardar alumno:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (alumno) => {
        setFormulario({
            id: alumno.id,
            nombre: alumno.nombre,
            apellido: alumno.apellido,
            dni: alumno.dni.toString(),
        });
        setMostrarForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estas seguro de eliminar este alumno?')) return;

        try {
            await fetchAuth(`http://localhost:3000/api/alumnos/${id}`, {
                method: 'DELETE',
            });
            await cargarAlumnos();
        } catch (error) {
            console.error('no se elimino el alumno', error);
        }
    };

    const handleCancel = () => {
        setMostrarForm(false);
        setFormulario({ id: null, nombre: '', apellido: '', dni: '' });
    };

    return (
        <div className={styles.contenedor}>
            <div className={styles.header}>
                <h2 className={styles.title}>Alumnos</h2>

                {!mostrarForm && (
                    <button
                        className={`${styles.boton} ${styles.botonPrimario}`}
                        onClick={() => setMostrarForm(true)}
                    >
                        nuevo Alumno
                    </button>
                )}
            </div>

            {mostrarForm && (
                <div className={styles.card}>
                    <h3>{formulario.id ? 'Editar' : 'Nuevo'} Alumno </h3>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formColumna}>
                            <div className={styles.formGrupo}>
                                <label className={styles.label} htmlFor='nombre'>
                                    Nombre
                                </label>

                                <input
                                    type='text'
                                    id='nombre'
                                    className={styles.input}
                                    value={formulario.nombre}
                                    onChange={(e) =>
                                        setFormulario({ ...formulario, nombre: e.target.value })
                                    }
                                    required
                                    minLength={2}
                                    maxLength={50}
                                    disabled={loading}
                                />
                            </div>

                            <div className={styles.formGrupo}>
                                <label htmlFor='apellido' className={styles.label}>
                                    Apellido
                                </label>

                                <input
                                    type='text'
                                    id='apellido'
                                    className={styles.input}
                                    value={formulario.apellido}
                                    onChange={(e) =>
                                        setFormulario({ ...formulario, apellido: e.target.value })
                                    }
                                    required
                                    minLength={2}
                                    maxLength={50}
                                    disabled={loading}
                                />
                            </div>

                            <div className={styles.formGrupo}>
                                <label htmlFor='dni' className={styles.label}>
                                    DNI
                                </label>

                                <input
                                    type='number'
                                    id='dni'
                                    className={styles.input}
                                    value={formulario.dni}
                                    onChange={(e) =>
                                        setFormulario({ ...formulario, dni: e.target.value })
                                    }
                                    required
                                    min={10000000}
                                    max={99999999}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className={styles.formAcciones}>
                            <button
                                type='button'
                                className={styles.boton}
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancelar
                            </button>

                            <button
                                type='submit'
                                className={`${styles.boton} ${styles.botonPrimario}`}
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : formulario.id ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.card}>
                <table className={styles.tabla}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>DNI</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {alumnos.length === 0 ? (
                            <tr>
                                <td colSpan='5' className={styles.empty}>
                                    No hay alumnos registrados
                                </td>
                            </tr>
                        ) : (
                            alumnos.map((alumno) => (
                                <tr key={alumno.id}>
                                    <td>{alumno.id}</td>
                                    <td>{alumno.nombre}</td>
                                    <td>{alumno.apellido}</td>
                                    <td>{alumno.dni}</td>
                                    <td>
                                        <div className={styles.tableActions}>
                                            <button
                                                className={styles.btn}
                                                onClick={() => handleEdit(alumno)}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                className={`${styles.btn} ${styles.btnDanger}`}
                                                onClick={() => handleDelete(alumno.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
