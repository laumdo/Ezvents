import { join, dirname } from "node:path";
import Database from 'better-sqlite3';
import { logger } from './logger.js';

let db = null;
//const db = new Database('data.db');

export function getConnection() {
    if (db !== null) return db;
    db = createConnection();
    return db;
}

function createConnection() {

    const options = {
        verbose: (sql) => {
            logger.debug(sql);
        }
    };
    const db = new Database(join(dirname(import.meta.dirname), 'data', 'aw_sw.db'), options);
    db.pragma('journal_mode = WAL'); // Necesario para mejorar la durabilidad y el rendimiento
    db.exec(`
             CREATE TABLE IF NOT EXISTS PuntosUsuario (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                idUsuario      INTEGER NOT NULL REFERENCES Usuarios(id),
                puntos         INTEGER NOT NULL,
                fecha_obtencion DATETIME NOT NULL DEFAULT (datetime('now'))
              );
            `);
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
