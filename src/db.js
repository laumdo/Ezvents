import { join, dirname } from "node:path";
import Database from 'better-sqlite3';

let db = null;

export function getConnection() {
    if (db !== null) return db;
    db = createConnection();
    crearTablaEventos();
    return db;
}

function createConnection() {
    const options = {
        verbose: console.log // Opcional y sólo recomendable durante desarrollo.
    };
    const db = new Database(join(dirname(import.meta.dirname), 'data', 'aw_sw.db'), options);
    db.pragma('journal_mode = WAL'); // Necesario para mejorar la durabilidad y el rendimiento
    return db;
}

export function closeConnection(db = getConnection()) {
    if (db === null) return;
    db.close();
}

export function checkConnection(db = getConnection()) {
    const checkStmt = db.prepare('SELECT 1+1 as suma');
    const suma = checkStmt.get().suma;
    if (suma == null || suma !== 2) throw Error(`La bbdd no funciona correctamente`);
}

export class ErrorDatos extends Error {
    /**
     * 
     * @param {string} message 
     * @param {ErrorOptions} [options]
     */
    constructor(message, options) {
        super(message, options);
        this.name = 'ErrorDatos';
    }
}
 // ???????????????
export function crearTablaEventos(){
    if(!db) return; //nos aseguramos de que la conexión a la BD está abierta
    db.exec(`
        CREATE TABLE IF NOT EXISTS eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            fecha TEXT NOT NULL,
            lugar TEXT NOT NULL,
            precio REAL NOT NULL,
            aforo_maximo INTEGER NOT NULL,
            entradas_vendidas INTEGER DEFAULT 0
        )
    `);
}