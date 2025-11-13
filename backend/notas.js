import express from 'express';
import { db } from './db.js';
import { validarId, verificarValidaciones } from './validaciones.js';
import { verificarAutenticacion } from './auth.js';
import { body, param } from 'express-validator';

const router = express.Router();

router.get('/alumno/:alumnoId',
    verificarAutenticacion,
    param("alumnoId").isInt({ min:1 }),
    verificarValidaciones,
    async (req, res) => {
        const alumnoId = Number(req.params.alumnoId);
        const userId = req.user.userId;

        try {
            const [rows] = await db.execute(
                `SELECT n.id, n.alumno_id, n.materia_id, n.nota1, n.nota2, n.nota3,
                        m.nombre as materia_nombre, m.codigo as materia_codigo,
                        a.nombre as alumno_nombre, a.apellido as alumno_apellido
                FROM notas n
                JOIN materias m ON n.materia_id = m.id
                JOIN alumnos a ON n.alumno_id = a.id
                WHERE n.alumno_id = ? AND a.usuario_id = ? AND m.usuario_id = ?`,
                [alumnoId, userId, userId]
            );

            res.json({success: true, notas: rows});
        } catch (error) {
            res.status(500).json({success: false, error: "no se pudo obtener las notas"})
        }
    }
);



router.get(
    "/materia/:materiaId",
    verificarAutenticacion,
    param("materiaId").isInt({ min:1 }),
    verificarValidaciones,
    async (req, res) => {
        const materiaId = Number(req.params.materiaId);
        const userId = req.user.userId;

        try {
            const [rows] = await db.execute(
                `SELECT n.id, n.alumno_id, n.materia_id, n.nota1, n.nota2, n.nota3,
                        m.nombre as materia_nombre, m.codigo as materia_codigo,
                        a.nombre as alumno_nombre, a.apellido as alumno_apellido
                FROM notas n
                JOIN materias m ON n.materia_id = m.id
                JOIN alumnos a ON n.alumno_id = a.id
                WHERE n.materia_id = ? AND a.usuario_id = ? AND m.usuario_id = ?`,
                [materiaId, userId, userId]
            );
        
            res.json({success: true, notas: rows});
        } catch (error) {
            res.status(500).json({success: false, error: "no se pudo obtener las notas"})
        }
    }
);


   // Agregar notas
router.post(
    '/',
    verificarAutenticacion,
    body("alumnoId").isInt({ min:1 }),
    body("materiaId").isInt({ min:1 }),
    body("nota1").optional().isFloat({ min:0, max:10 }),
    body("nota2").optional().isFloat({ min:0, max:10 }),
    body("nota3").optional().isFloat({ min:0, max:10 }),
    verificarValidaciones,
    async (req, res) => {
        const { alumnoId, materiaId, nota1, nota2, nota3 } = req.body;
        const userId = req.user.userId;

        try {
            const [alumno] = await db.execute(
                "SELECT id FROM alumnos WHERE id = ? AND usuario_id = ?",
                [alumnoId, userId]
            );
            const [materia] = await db.execute(
                "SELECT id FROM materias WHERE id = ? AND usuario_id = ?",
                [materiaId, userId]
            );

            if (alumno.length === 0 || materia.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Alumno o materia no encontrados"
                });
            }

            const [existing] = await db.execute(
                "SELECT * FROM notas WHERE alumno_id = ? AND materia_id = ?",
                [alumnoId, materiaId]
            );

            if (existing.length > 0) {
                await db.execute(
                    "UPDATE notas SET nota1=?, nota2=?, nota3=? WHERE id = ?",
                    [nota1 ?? null, nota2 ?? null, nota3 ?? null, existing[0].id]
                );
                res.json({success: true, message: "notas actualizadas correctamente"});
            } else {
                const [result] = await db.execute(
                    "INSERT INTO notas (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
                    [alumnoId, materiaId, nota1 ?? null, nota2 ?? null, nota3 ?? null]
                );
                res.status(201).json({
                    success: true,
                    message: "notas agregadas correctamente",
                    id: result.insertId});
            }
        } catch (error) {
            res.status(500).json({success: false, error: "no se pudo agregar las notas"})
        }
    }
);


router.put(
    "/:id", // Actualizar notas
    verificarAutenticacion,
    validarId,
    body("nota1").optional().isFloat({ min:0, max:10 }),
    body("nota2").optional().isFloat({ min:0, max:10 }),
    body("nota3").optional().isFloat({ min:0, max:10 }),
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const { nota1, nota2, nota3 } = req.body;

        try {
            const [result] = await db.execute(
                "UPDATE notas SET nota1=?, nota2=?, nota3=? WHERE id = ?",
                [nota1, nota2, nota3, id]
            );

            if (result.affectedRows === 0) {
                return res
                .status(404)
                .json({success: false, error: "notas no encontradas"});
            }

            res.json({success: true, message: "notas actualizadas correctamente"});
        } catch (error) {
            res.status(500).json({success: false, error: "error al actualizar las notas"})
        }
    }
);


export default router;