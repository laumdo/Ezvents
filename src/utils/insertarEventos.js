import { getConnection } from '../db.js';

const db = getConnection();

db.prepare(`
    INSERT INTO eventos (nombre, descripcion, fecha, lugar, precio, aforo_maximo, imagen) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
    "Concierto de prueba", 
    "Un gran concierto de prueba para ver si todo funciona.",
    "2025-06-15", 
    "Madrid", 
    30.00, 
    500, 
    "concierto.jpg"
);

console.log("Evento insertado correctamente.");
