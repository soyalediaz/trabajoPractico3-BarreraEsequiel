import { useState } from 'react';
import { useAuth } from './Auth';
import styles from './Registro.module.css';
import { useNavigate, Link } from 'react-router-dom';

export const Registro = () => {
    const { error, register } = useAuth();

    const navigate = useNavigate();

    const [formRegistro, setFormRegistro] = useState({
        nombre: '',
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [validacionDeErrores, setValidacionDeErrores] = useState({});

    const validateForm = () => {
        const errors = {};

        if (formRegistro.nombre.length < 2) {
            errors.nombre = 'El nombre debe tener al menos 2 caracteres';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formRegistro.email)) {
            errors.email = 'El email no es valido';
        }

        if (formRegistro.password.length < 8) {
            errors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!/\d/.test(formRegistro.password)) {
            errors.password = 'La contraseña debe tener al menos un numero';
        }

        setValidacionDeErrores(errors);

        return Object.keys(errors).length === 0;
    };


    const handleChange = (e) => {

        setFormRegistro({...formRegistro, [e.target.name]: e.target.value});
        
        if (validacionDeErrores[e.target.name]) {
            setValidacionDeErrores({ ...validacionDeErrores, [e.target.name]: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        const result = await register(formRegistro.nombre, formRegistro.email, formRegistro.password);
        if (result.success) {
            navigate('/login');
        } 

        setLoading(false);
    };



    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Registro</h1>
                <p className={styles.description}>
                    Crea una cuenta para acceder a tu panel de control
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="nombre">
                            Nombre
                        </label>

                        <input
                            type="text"
                            className={styles.input}
                            id="nombre"
                            name="nombre"
                            value={formRegistro.nombre}
                            onChange={handleChange}
                            placeholder="Ingrese su nombre"
                            required
                            disabled={loading}
                        />

                        {validacionDeErrores.nombre && (
                            <div className={styles.error}>{validacionDeErrores.nombre}</div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="email">
                            Email
                        </label>

                        <input
                            type="email"
                            className={styles.input}
                            id="email"
                            name="email"
                            value={formRegistro.email}
                            onChange={handleChange}
                            placeholder="Ingrese su email"
                            required
                            disabled={loading}
                        />
                        {validacionDeErrores.email && (
                            <div className={styles.error}>{validacionDeErrores.email}</div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="password">
                            Password
                        </label>

                        <input
                            type="password"
                            className={styles.input}
                            id="password"
                            name="password"
                            value={formRegistro.password}
                            onChange={handleChange}
                            placeholder="Ingrese su contraseña"
                            required
                            disabled={loading}
                        />
                        {validacionDeErrores.password && (
                            <div className={styles.error}>{validacionDeErrores.password}</div>
                        )}
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : 'Registrarse'}
                    </button>
                </form>

                <p className={styles.link}>
                    Ya tienes una cuenta?{' '}
                    <Link to="/login" className={styles.link}>
                        Iniciar sesión
                    </Link>
                </p>
            </div>
        </div>
    );
};