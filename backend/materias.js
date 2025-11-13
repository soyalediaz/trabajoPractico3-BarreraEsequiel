import express from 'express';
import { db } from './db.js';
import { verificarAutenticacion } from './auth.js';
import { body } from 'express-validator';
import { validarId, verificarValidaciones } from './validaciones.js';

const router = express.Router();

router.get('/', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.user.userId;
        const [rows] = await db.execute(
            'SELECT * FROM materias WHERE usuario_id = ? ORDER BY anio, nombre',
            [userId]
        );
        res.json({success: true, materias: rows});
    } catch (error) {
        res.status(500).json({success: false, error: "error al obtener las materias"});
    }
});

// Obtener materia por ID

router.get(
    '/:id',
    verificarAutenticacion,
    validarId,
    async (req, res) => {
        const id = Number(req.params.id);
        const userId = req.user.userId;

        try {
            const [rows] = await db.execute(
                'SELECT * FROM materias WHERE id = ? AND usuario_id = ?',
                [id, userId]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "materia no encontrada"});
            }
            res.json({success: true, materia: rows[0]});
        } catch (error) {
            res.status(500).json({success: false, error: "error al obtener la materia"});
        }
    }
);





router.post(
    '/',
    verificarAutenticacion,
    body("nombre").isLength({ min: 3, max: 100 }).trim(),

    body("codigo").isAlphanumeric().isLength({ min: 2, max: 20 }).toUpperCase(),
    body("anio").isInt({ min: 1, max: 6 }),
    
    verificarValidaciones,
    async (req, res) => {
        const { nombre, codigo, anio } = req.body;
        const userId = req.user.userId;

        try {
            const [result] = await db.execute(
                "INSERT INTO materias (nombre, codigo, anio, usuario_id) VALUES (?, ?, ?, ?)",
                [nombre, codigo, anio, userId]
            );

            res.status(201).json({
                success: true,
                materia: { id: result.insertId, nombre, codigo, anio },
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res
                .status(400)
                .json({success: false, error: "materia ya existe"});
            }
            res.status(500).json({success: false, error: "error al agregar la materia"});
        }
    }
);





router.put(
    '/:id',
    verificarAutenticacion,
    validarId,
    body("nombre").isLength({ min: 3, max: 100 }).trim(),
    body("codigo").isAlphanumeric().isLength({ min: 2, max: 20 }).toUpperCase(),
    body("anio").isInt({ min: 1, max: 6 }),
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const { nombre, codigo, anio } = req.body;
        const userId = req.user.userId;

        try {
            const [result] = await db.execute(
                "UPDATE materias SET nombre=?, codigo=?, anio=? WHERE id=? AND usuario_id=?",
                [nombre, codigo, anio, id, userId]
            );

            if (result.affectedRows === 0) {
                return res
                .status(404)
                .json({success: false, error: "materia no encontrada"});
            }

            res.json({ 
                success: true,
                message: "materia actualizada correctamente"});
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res
                .status(400)
                .json({success: false, error: "materia ya existe"});
            }
            res.status(500).json({success: false, error: "error al actualizar la materia"});
        }
    }
);



router.delete(
    '/:id',
    verificarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const userId = req.user.userId;

        try {
            const [result] = await db.execute(
                "DELETE FROM materias WHERE id=? AND usuario_id=?",
                [id, userId]
            );

            if (result.affectedRows === 0) {
                return res
                .status(404)
                .json({success: false, message: "materia no encontrada"});
            }

            res.json({success: true, message: "materia eliminada correctamente"});
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res
                .status(400)
                .json({
                    success: false,
                    error: "materia en uso"});
                }
            res.status(500).json({success: false, error: "error al eliminar la materia"});
        }
    }
);






export default router;