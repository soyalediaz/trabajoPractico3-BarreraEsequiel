import express from "express";
import { body } from "express-validator";
import { db } from "./db.js";
import { verificarAutenticacion } from "./auth.js";
import { validarId, verificarValidaciones } from "./validaciones.js";


const router = express.Router();

// mostrar todos los alumnos
router.get("/", verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.user.userId;
        const[rows] = await db.execute(
            "SELECT * FROM alumnos WHERE usuario_id = ? ORDER BY apellido, nombre",
            [userId]
        );

        res.json({success: true, alumnos: rows});
    } catch (error) {
        
        res.status(500).json({success: false, error: "Error al obtener los alumnos"});
    }
});



router.get("/:id", verificarAutenticacion, validarId, verificarValidaciones, async (req, res) => {

    const id = Number(req.params.id);
    const userId = req.user.userId;

    try {
        const[rows] = await db.execute(
            "SELECT * FROM alumnos WHERE id = ? AND usuario_id = ?",
            [id, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({success: false, error: "Alumno no encontrado"});
        }

        res.json({success: true, alumno: rows[0]});

    } catch (error) {

        res.status(500).json({success: false, error: "Error al obtener el alumno"});
    }
});



router.post(
    "/",
    verificarAutenticacion,
    body("nombre").isLength({ min: 2, max: 50}).trim(),
    body("apellido").isLength({ min: 2, max: 50}).trim(),
    body("dni").isInt({ min: 10000000, max: 99999999}),

    verificarValidaciones,

    async (req, res) => {
        const {nombre, apellido, dni} = req.body;
        const userId = req.user.userId;

        try {
            const[result] = await db.execute(
                "INSERT INTO alumnos (nombre, apellido, dni, usuario_id) VALUES (?, ?, ?, ?)",
                [nombre, apellido, dni, userId]
            );

            res.status(201).json({
                success: true,
                alumno: {
                    id: result.insertId,
                    nombre,
                    apellido,
                    dni
                }
            });
        } catch (error) {

            if (error.code === "ER_DUP_ENTRY") {
                return res.status(400).json({
                    success: false,
                    error: "El DNI ya está registrado"
                });
            }

            res.status(500).json({
                success: false,
                error: "Error al crear el alumno"
            });
        }
    }
)



router.put(
    "/:id",

    verificarAutenticacion,
    validarId,

    body("nombre").isLength({ min: 2, max: 40}).trim(),
    body("apellido").isLength({ min: 2, max: 40}).trim(),
    body("dni").isInt({ min: 10000000, max: 99999999}),

    verificarValidaciones,

    async (req, res) => {
        const id = Number(req.params.id);
        const {nombre, apellido, dni} = req.body;
        const userId = req.user.userId;

        try {
            const [result] = await db.execute(
                "UPDATE alumnos SET nombre=?, apellido=?, dni=? WHERE id=? AND usuario_id=?",
                [nombre, apellido, dni, id, userId]
            )

            if (result.affectedRows === 0) {
                return res.status(404).json({success: false, error: "Alumno no encontrado"});
            }

            res.json({ success: true, message: "alumno actualizado correctamente"});
        } catch (error) {

            if (error.code === "ER_DUP_ENTRY") {
                return res.status(400).json({success: false, error: "El DNI ya está registrado"});
            }
            

            res.status(500).json({success: false, error: "Error al actualizar el alumno"});
        }
    }
)



router.delete(
    "/:id",
    verificarAutenticacion,
    validarId,
    async (req, res) => {
        const id = Number(req.params.id);
        const userId = req.user.userId;
        try {
            const [result] = await db.execute(
                "DELETE FROM alumnos WHERE id = ? AND usuario_id = ?",
                [id, userId]
            );
        
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Alumno no encontrado"
                });
            }
            


            res.json({
                success: true,
                message: "alumno eliminado correctamente"
            });



        } catch (error) {
            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(400).json({
                    success: false,
                    error: "El alumno ya tiene inscripciones "
                });
            }



            //error general
            res.status(500).json({success: false, error: "Error al eliminar el alumno"});
        }
    }
)

export default router;
