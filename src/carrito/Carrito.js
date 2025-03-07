import { getConnection } from '../db.js';

export class Carrito {
    static #getByIdStmt = null;
    static #insertStmt = null;
    static #deleteStmt = null;
    static #getAllStmt = null;

    static initStatements() {
        const db = getConnection();

        if (this.#getByIdStmt !== null) return;

        this.#getByIdStmt = db.prepare('SELECT * FROM carrito WHERE id = @id');
        this.#insertStmt = db.prepare('INSERT INTO carrito (id_usuario, id_evento) VALUES (@id_usuario, @id_evento)');
        this.#deleteStmt = db.prepare('DELETE FROM carrito WHERE id = @id');
        this.#getAllStmt = db.prepare('SELECT * FROM carrito');
    }

    static getCarrito() {
        return this.#getAllStmt.all();
    }

    static agregarEvento(evento) {
        this.#insertStmt.run({ id_evento: evento.id, id_usuario: Usuario.id});
    }

    static eliminarEvento(id) {
        this.#deleteStmt.run({ id });
    }
}
