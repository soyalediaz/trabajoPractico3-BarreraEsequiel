import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './Auth';
import styles from './Materias.module.css';

export const Materias = () => {
    const { fetchAuth } = useAuth();
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        codigo: '',
        anio: '',
    });
    const [showForm, setShowForm] = useState(false);

    const cargarMaterias = useCallback(async () => {
        try {
            const response = await fetchAuth('http://localhost:3000/api/materias');
            const data = await response.json();

            if (response.ok) {
                setMaterias(data.materias || []);
            } else {
                console.error('Error al cargar materias:', data.error);
            }
        } catch (error) {
            if (!error.message.includes('No se ha iniciado sesión')) {
                console.error('Error:', error);
            }
        }
    }, [fetchAuth]);

    useEffect(() => {
        cargarMaterias();
    }, [cargarMaterias]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (formData.id) {
                await fetchAuth(`http://localhost:3000/api/materias/${formData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: formData.nombre,
                        codigo: formData.codigo.toUpperCase(),
                        anio: parseInt(formData.anio, 10),
                    }),
                });
            } else {
                await fetchAuth('http://localhost:3000/api/materias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: formData.nombre,
                        codigo: formData.codigo.toUpperCase(),
                        anio: parseInt(formData.anio, 10),
                    }),
                });
            }

            setShowForm(false);
            setFormData({ id: null, nombre: '', codigo: '', anio: '' });
            await cargarMaterias();
        } catch (error) {
            console.error('Error al guardar materia:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (materia) => {
        setFormData({
            id: materia.id,
            nombre: materia.nombre,
            codigo: materia.codigo,
            anio: materia.anio.toString(),
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta materia?')) return;

        try {
            await fetchAuth(`http://localhost:3000/api/materias/${id}`, {
                method: 'DELETE',
            });
            await cargarMaterias();
        } catch (error) {
            console.error('Error al eliminar materia:', error);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setFormData({ id: null, nombre: '', codigo: '', anio: '' });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Materias</h2>
                {!showForm && (
                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => setShowForm(true)}
                    >
                        + Nueva Materia
                    </button>
                )}
            </div>

            {showForm && (
                <div className={styles.card}>
                    <h3>{formData.id ? 'Editar' : 'Nueva'} Materia</h3>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor='nombre'>
                                    Nombre
                                </label>
                                <input
                                    type='text'
                                    id='nombre'
                                    className={styles.input}
                                    value={formData.nombre}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nombre: e.target.value })
                                    }
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    disabled={loading}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor='codigo'>
                                    Código
                                </label>
                                <input
                                    type='text'
                                    id='codigo'
                                    className={styles.input}
                                    value={formData.codigo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, codigo: e.target.value })
                                    }
                                    required
                                    minLength={2}
                                    maxLength={20}
                                    disabled={loading}
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor='anio'>
                                    Año
                                </label>
                                <select
                                    id='anio'
                                    className={styles.input}
                                    value={formData.anio}
                                    onChange={(e) =>
                                        setFormData({ ...formData, anio: e.target.value })
                                    }
                                    required
                                    disabled={loading}
                                >
                                    <option value=''>Seleccionar...</option>
                                    <option value='1'>1° Año</option>
                                    <option value='2'>2° Año</option>
                                    <option value='3'>3° Año</option>
                                    <option value='4'>4° Año</option>
                                    <option value='5'>5° Año</option>
                                    <option value='6'>6° Año</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button
                                type='button'
                                className={styles.btn}
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type='submit'
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : formData.id ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Código</th>
                            <th>Año</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materias.length === 0 ? (
                            <tr>
                                <td colSpan='5' className={styles.empty}>
                                    No hay materias registradas
                                </td>
                            </tr>
                        ) : (
                            materias.map((materia) => (
                                <tr key={materia.id}>
                                    <td>{materia.id}</td>
                                    <td>{materia.nombre}</td>
                                    <td>{materia.codigo}</td>
                                    <td>{materia.anio}°</td>
                                    <td>
                                        <div className={styles.tableActions}>
                                            <button
                                                className={styles.btn}
                                                onClick={() => handleEdit(materia)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className={`${styles.btn} ${styles.btnDanger}`}
                                                onClick={() => handleDelete(materia.id)}
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

