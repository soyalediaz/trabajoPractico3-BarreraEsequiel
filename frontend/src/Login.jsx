import { useState, useEffect } from 'react';
import { useAuth } from './Auth';
import styles from './Login.module.css';
import { useNavigate, Link } from 'react-router-dom';

export const Login = () => {
    const { error, login, token } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            navigate('/alumnos');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/alumnos');
        }

        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Iniciar Sesión</h2>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="email">
                            Email
                        </label>

                        <input
                            type="email"
                            className={styles.input}
                            id="email"
                            value={email}
                            placeholder="Ingrese su email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="password">
                            Password
                        </label>

                        <input
                            type="password"
                            className={styles.input}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingrese su contraseña"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : 'Ingresar'}
                    </button>
                </form>

                <p className={styles.link}>
                    no tenés una cuenta?{' '}
                    <Link to="/registro" className={styles.link}>
                        Registrate
                    </Link>
                </p>
            </div>
        </div>
    );
};