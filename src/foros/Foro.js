// foro/Foro.js
import { getConnection } from '../db.js';

export class Foro {
    static #getByEventoStmt = null;
    static #insertStmt = null;

    static initStatements() {
        const db = getConnection();
        if (this.#getByEventoStmt !== null) return;

        this.#getByEventoStmt = db.prepare('SELECT * FROM mensajes WHERE evento_id = @evento_id ORDER BY fecha DESC');
        this.#insertStmt = db.prepare(`
            INSERT INTO mensajes (usuario, contenido, fecha, evento_id) 
            VALUES (@usuario, @contenido, @fecha, @evento_id)
        `);
    }

    // Obtener los mensajes de un evento
    static getMensajesByEvento(eventoId) {
        const db = getConnection();
        return db.prepare('SELECT * FROM mensajes WHERE evento_id = ? ORDER BY fecha DESC').all(eventoId);
    }

    // Insertar un mensaje en el foro
    static insertMensaje(usuario, contenido, eventoId) {
        const fecha = new Date().toISOString();
        this.#insertStmt.run({
            usuario,
            contenido,
            fecha,
            evento_id: eventoId
        });
    }
}
