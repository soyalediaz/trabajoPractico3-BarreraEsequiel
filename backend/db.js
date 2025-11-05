import mysql from 'mysql2/promise';

export let db;

export async function connectDB() {
    try {
        db = await mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
        }); 
        console.log('Conectados a la base de datos');
    } catch (error) {
        console.error('Error al conectar a la base de datos', error);
        throw error;
    }
}