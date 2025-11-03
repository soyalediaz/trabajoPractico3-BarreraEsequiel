import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { body } from "express-validator";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import { Strategy, ExtractJwt } from "passport-jwt";

const router = express.Router();

export function authConfig() {
    const jwtOpciones = {

        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }

    passport.use(
        new Strategy(jwtOpciones, async (payload, done) => {
            next(null, payload);
        })

    );
}


export const verficarAutenticacion = passport.authenticate("jwt", {

    session: false
});

router.post(
    "/registro",
    body("email").isEmail().normalizeEmail(),
    body("nombre").isLength({ min: 2, max: 50 }).trim(),
    body("password").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0
    }),

    verificarValidaciones,

    async (req, res) => {
        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        await db.execute(
            "INSERT INTO usuarios (email, nombre, password) VALUES (?, ?, ?)",
            [email, nombre, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "Usuario registrado correctamente"
        });
    }
);
