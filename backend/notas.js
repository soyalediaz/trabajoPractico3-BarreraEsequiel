import express from 'express';
import { db } from './db.js';
import { validarId, verificarValidaciones } from './validaciones.js';
import { verificarAutenticacion } from './auth.js';
import { body, param } from 'express-validator';

const router = express.Router();

router.get('/',
    verificarAutenticacion,
    param("alumnoId").isInt({ min:1 }),
    verificarValidaciones,
    async (req, res) => {
        const alumnoId = Number(req.params.alumnoId);

        try {
            const [rows] = await db.execute(
                `SELECT n.id, n.alumno_id, n.materia_id, n.nota1, n.nota2, n.nota3,
                        m.nombre as materia_nombre, m.codigo as materia_codigo,
                        a.nombre as alumno_nombre, a.apellido as alumno_apellido
                FROM notas n
                JOIN materias m ON n.materia_id = m.id
                JOIN alumnos a ON n.alumno_id = a.id
                WHERE n.alumno_id = ?`,
                [alumnoId]
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

        try {
            const [rows] = await db.execute(
                `SELECT n.id, n.alumno_id, n.materia_id, n.nota1, n.nota2, n.nota3,
                        m.nombre as materia_nombre, m.codigo as materia_codigo,
                        a.nombre as alumno_nombre, a.apellido as alumno_apellido
                FROM notas n
                JOIN materias m ON n.materia_id = m.id
                JOIN alumnos a ON n.alumno_id = a.id
                WHERE n.materia_id = ?`,
                [materiaId]
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
    body("nota1").isFloat({ min:0, max:10 }),
    body("nota2").isFloat({ min:0, max:10 }),
    body("nota3").isFloat({ min:0, max:10 }),
    verificarValidaciones,
    async (req, res) => {
        const { alumnoId, materiaId, nota1, nota2, nota3 } = req.body;

        try {
            const [existing] = await db.execute(
                "SELECT * FROM notas WHERE alumno_id = ? AND materia_id = ?",
                [alumnoId, materiaId]
            );

            if (existing.length > 0) {
                await db.execute(
                    "UPDATE notas SET nota1=?, nota2=?, nota3=? WHERE id = ?",
                    [nota1, nota2, nota3, existing[0].id]
                );
                res.json({success: true, message: "notas actualizadas correctamente"});
            } else {
                const [result] = await db.execute(
                    "INSERT INTO notas (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
                    [alumnoId, materiaId, nota1, nota2, nota3]
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