import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import authRouter, { authConfig } from './auth.js';
import alumnosRouter from './alumnos.js';
import materiasRouter from './materias.js';
import notasRouter from './notas.js';


connectDB();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.use(cors());


authConfig();

app.get('/', (req, res) => {
    res.send('Api de Alumnos');
});

//rutas
app.use('/auth', authRouter);
app.use('/alumnos', alumnosRouter);
app.use('/materias', materiasRouter);
app.use('/notas', notasRouter);


app.use((err, res) => {
    console.error("error en el servidor", err);
    res.status(500).json({
        success: false,
        error: "error interno del servidor",
        message: err.message
    });
});

app.use((res) => {
    res.status(404).json({
        success: false,
        error: "ruta no encontrada",
        message: "la ruta no existe"
    });
});




app.listen(port, () => {
    console.log(`Activo el servidor en http://localhost:${port}`);
});