import { getConnection } from '../db.js';
import { Usuario } from '../usuarios/Usuario.js';

export class Carrito {
    static #getByIdStmt = null;
    static #insertStmt = null;
    static #deleteStmt = null;
    static #getAllStmt = null;

    static initStatements() {
        const db = getConnection();

        if (this.#getByIdStmt !== null) return;

        this.#insertStmt = db.prepare('INSERT INTO carrito (id_usuario, id_evento) VALUES (@id_usuario, @id)');
        this.#deleteStmt = db.prepare('DELETE FROM carrito WHERE id_evento = @id_evento');
        this.#getAllStmt = db.prepare('SELECT * FROM carrito WHERE id_usuario = @id_usuario');
    }

    static getCarrito() {
        return this.#getAllStmt.all({ id_usuario: Usuario.id });
    }

    static agregarEvento(id) {
        this.#insertStmt.run({ id_usuario: Usuario.id, id });
    }

    static eliminarEvento(id) {
        this.#deleteStmt.run({ id });
    }
}
