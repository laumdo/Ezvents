// foro/Foro.js
import { getConnection } from '../db.js';

export class Foro {
    static #getByEventoStmt = null;
    static #insertStmt = null;
    static #deleteStmt = null;

    static initStatements() {
        const db = getConnection();
        if (this.#getByEventoStmt !== null) return;

        this.#getByEventoStmt = db.prepare(`
            SELECT m.*, u.rol
            FROM mensajes m
            JOIN Usuarios u ON m.usuario = u.username
            WHERE m.evento_id = @evento_id
            ORDER BY m.fecha DESC
        `);

        this.#insertStmt = db.prepare(`
            INSERT INTO mensajes (usuario, contenido, fecha, evento_id, parent_id) 
            VALUES (@usuario, @contenido, @fecha, @evento_id, @parent_id)
        `);
        this.#deleteStmt = db.prepare('DELETE FROM mensajes WHERE id = ?');
       
    }

    // Obtener los mensajes de un evento
    static getMensajesByEvento(eventoId) {
        return this.#getByEventoStmt.all({ evento_id: eventoId });
    }

    // Insertar un mensaje en el foro
    static insertMensaje(usuario, contenido, eventoId, parentId = null) {
        const fecha = new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        this.#insertStmt.run({
            usuario,
            contenido,
            fecha,
            evento_id: eventoId,
            parent_id: parentId
        });
    }

    static borrarMensaje(mensajeId) {
        this.#deleteStmt.run(mensajeId);
    }
}
