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
