import express from "express";
import { body } from "express-validator";
import { verificarValidaciones } from "./validaciones.js";
import { db } from "./db.js";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";

const router = express.Router();

export function authConfig() {

    const jwtOpciones = {

        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

        secretOrKey: process.env.JWT_SECRET
    };

    passport.use(new Strategy(jwtOpciones, async (payload, next) => {

        next(null, payload);
    
    }));
}

export const verificarAutenticacion = passport.authenticate("jwt", { session: false });

router.post(
    "/register", 
        body("email").isEmail().normalizeEmail(),
        body("nombre").isLength({ min: 2, max: 50}).trim(),
        body("password").isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 0,
            minNumbers: 1,
            minSymbols: 0,
        }),

        verificarValidaciones,

        async (req, res) => {
            const {email, nombre, password} = req.body;

            try {
                const hashedPassword = await bcrypt.hash(password, 12);

                await db.execute(
                    "INSERT INTO usuarios (email, nombre, password_hash) VALUES (?, ?, ?)",
                    [email, nombre, hashedPassword]
                );

                res.status(201).json({
                    success: true,
                    message: "Usuario registrado correctamente"
                });
            } catch (error) {

                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                        success: false,
                        error: "El email ya está registrado"
                    });

                }

                res.status(500).json({
                    success: false,
                    error: "Error al registrar usuario"
                });
            }
        }
    )

    router.post(
        "/login",
        body("email").isEmail().normalizeEmail(),
        body("password").notEmpty(),

        verificarValidaciones,

        async (req, res) => {
            const {email, password} = req.body;
            try {
                const [usuarios] = await db.execute(
                    "SELECT * FROM usuarios WHERE email = ?",
                    [email]
                );

                if (usuarios.length === 0) {
                    return res.status(401).json({
                        success: false,
                        error: "Email o contraseña incorrectos"});
                }

                const passwordComparada = await bcrypt.compare(
                    password,
                    usuarios[0].password_hash);

                if (!passwordComparada) {
                    return res.status(400).json({
                        success: false,
                        error: "Email o contraseña incorrectos"
                    });
                };

                const payload = { userId: usuarios[0].id };
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });

                res.json({
                    success: true,
                    token,
                    user: {
                        id: usuarios[0].id,
                        email: usuarios[0].email,
                        nombre: usuarios[0].nombre
                    },
                });
            } catch (error) {

                res.status(500).json({
                    success: false,
                    error: "Error al iniciar sesión"
                });
            }
        }
    )

    export default router;