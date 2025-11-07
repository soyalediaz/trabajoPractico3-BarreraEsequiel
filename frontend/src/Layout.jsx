import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from './Auth';
import styles from './Layout.module.css';

export const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();


    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <Link to='/' className={styles.logo}>
                        Gestion de Alumnos
                    </Link>

                    {user ? (
                        <>
                            <ul className={styles.navLinks}>
                                <li>
                                    <Link
                                        to='/alumnos'
                                        className={`${styles.navLink} ${location.pathname === '/alumnos' ? styles.active : ''}`}
                                    >
                                        Alumnos
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        to='/materias'
                                        className={`${styles.navLink} ${location.pathname === '/materias' ? styles.active : ''}`}
                                    >
                                        Materias
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        to='/notas'
                                        className={`${styles.navLink} ${location.pathname === '/notas' ? styles.active : ''}`}
                                    >
                                        Notas
                                    </Link>
                                </li>
                            </ul>

                            <div className={styles.userInfo}>
                                <span>{user.nombre}</span>

                                <button className={styles.logoutButton} onClick={logout}>
                                    Salir
                                </button>
                            </div>
                        </>
                    ) : (
                        <ul className={styles.navLinks}>
                            <li>
                                <Link
                                    to='/login'
                                    className={`${styles.navLink} ${location.pathname === '/login' ? styles.active : ''}`}
                                >
                                    Iniciar sesión
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to='/registro'
                                    className={`${styles.navLink} ${location.pathname === '/registro' ? styles.active : ''}`}
                                >
                                    Registrarse
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.mainContent}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
