import express from "express";
import passport from "passport";
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



