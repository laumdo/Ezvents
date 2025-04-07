import { getConnection } from '../db.js';
import { Usuario } from '../usuarios/Usuario.js';

export class Carrito {
    static #getByIdStmt = null;
    static #insertStmt = null;
    static #deleteStmt = null;
    static #getAllStmt = null;
    static #updateCantidadStmt = null;
    static #checkStmt = null;
    static #deleteByEventStmt = null;
    

    static initStatements() {
        const db = getConnection();

        if (this.#getByIdStmt !== null) return;

        this.#insertStmt = db.prepare('INSERT INTO carrito (id_usuario, id_evento, precio) VALUES (@id_usuario, @id_evento, @precio)');
        this.#deleteStmt = db.prepare('DELETE FROM carrito WHERE id = @id');
        this.#deleteByEventStmt = db.prepare('DELETE FROM carrito WHERE id_usuario = @id_usuario AND id_evento = @id_evento');
        this.#getAllStmt = db.prepare('SELECT * FROM carrito WHERE id_usuario = @id_usuario');
        this.#checkStmt = db.prepare('SELECT COUNT(*) as count FROM carrito WHERE id_usuario = @id_usuario AND id_evento = @id_evento');
        this.#updateCantidadStmt = db.prepare('UPDATE carrito SET cantidad = cantidad + 1 WHERE id_usuario = @id_usuario AND id_evento = @id_evento');
    }

    static getCarrito(id_usuario) {
        return this.#getAllStmt.all({ id_usuario});
    }

    static agregarEvento(id_usuario, id_evento, precio) {
        const existe = this.#checkStmt.get({id_usuario, id_evento});
        console.log("Agregando evento al carrito -> Usuario:", id_usuario, "Evento:", id_evento);
        if(existe.count === 0){
            this.#insertStmt.run({ id_usuario, id_evento, precio });
        }else{
            this.#updateCantidadStmt.run({ id_usuario, id_evento });
        }

    }

    static deleteById(id) {
        this.#deleteStmt.run({ id });
    }

    static deleteByEvent(id_usuario, id_evento) {
        this.#deleteByEventStmt.run({ id_usuario, id_evento });
    }

    static actualizarCantidad(id_usuario, id_evento) {
        this.initStatements();
        this.#updateCantidadStmt.run({ id_usuario, id_evento});
    }
}
