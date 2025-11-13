import styles from './App.module.css';

export function App() {
    return (
        <article className={styles.article}>
            <h1 className={styles.title}>Gestion de Alumnos</h1>
            <p className={styles.subtitle}>Alumnos, materias y notas</p>
            <div className={styles.data}>
                <ul>
                    <li><b>Trabajo Practico 3 - Ejercicio 1</b></li>
                    <li>Barrera Esequiel Alejandro</li>
                </ul>
            </div>
        </article>
    );
}