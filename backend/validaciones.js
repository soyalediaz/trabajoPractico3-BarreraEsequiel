import { param, ResultadosValidaciones } from "express-validator";

export const validarId = param("id").inInt({ min:1 })

export const verificarValidaciones = (req, res, next) => {
    const validacion = ResultadosValidaciones(req);
    if (!validacion.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validación fallida",
            errors: validacion.array()
            });
        }
        next();
    }
