import { getConnection } from '../db.js';

export class MensajeForo {
    static #insertStmt = null;
    static #getByEventoStmt = null;

    static initStatements() {
        const db = getConnection();
        if (this.#insertStmt !== null) return;

        this.#insertStmt = db.prepare(`
            INSERT INTO mensajes_foro (evento_id, usuario, contenido, fecha) 
            VALUES (@evento_id, @usuario, @contenido, datetime('now'))
        `);

        this.#getByEventoStmt = db.prepare(`
            SELECT * FROM mensajes_foro WHERE evento_id = ? ORDER BY fecha DESC
        `);
    }

    static agregarMensaje(evento_id, usuario, contenido) {
        this.initStatements();
        this.#insertStmt.run({ evento_id, usuario, contenido });
    }

    static obtenerMensajesPorEvento(evento_id) {
        this.initStatements();
        return this.#getByEventoStmt.all(evento_id);
    }
}