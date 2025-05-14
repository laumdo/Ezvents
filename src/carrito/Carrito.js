import { getConnection } from '../db.js';
import { Usuario } from '../usuarios/Usuario.js';

export class Carrito {
    static #getByIdStmt = null;
    static #insertStmt = null;
    static #deleteStmt = null;
    static #getAllStmt = null;
    static #updateCantidadStmt = null;
    static #restaCantidadStmt = null;
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
        this.#restaCantidadStmt = db.prepare('UPDATE carrito SET cantidad = cantidad - 1 WHERE id_usuario = @id_usuario AND id_evento = @id_evento');

    }

    static getCarrito(id_usuario) {
        return this.#getAllStmt.all({ id_usuario});
    }

    static agregarEvento(id_usuario, id_evento, precio) {
        const existe = this.#checkStmt.get({id_usuario, id_evento});
        if(existe.count === 0){
            this.#insert(id_usuario, id_evento, precio);
        }else{
            this.#updateCantidadStmt.run({ id_usuario, id_evento });
        }

    }

    static #insert(id_usuario, id_evento, precio){
            let result = null;
            try{
                result = this.#insertStmt.run({id_usuario, id_evento, precio});
            }catch(e){
                throw new ErrorDatos('No se ha podido añadir el evento al carrito', { cause: e});
            }
            return result;
    }
    static #update(carrito){
        const datos = { id_usuario: carrito.id_usuario, id_evento: carrito.id_evento };
        
        const result = this.#updateCantidadStmt.run(datos);
        if(result.changes === 0) throw new ErrorDatos('Error al actualizar el carrito');
        return result;
    }

    #id;
    id_usuario;
    id_evento;
    precio;
    cantidad;

    constructor(id = null, id_usuario, id_evento, precio, cantidad = 0){
        this.#id = id;
        this.id_usuario = id_usuario;
        this.id_evento = id_evento;
        this.precio = precio;
        this.cantidad = cantidad;
    }

    persist(){
            if(this.#id === null) return Carrito.#insert(this);
            return Carrito.#update(this);
    }

    static deleteById(id) {
        this.#deleteStmt.run({ id });
    }

    static deleteByEvent(id_usuario, id_evento) {
        this.#deleteByEventStmt.run({ id_usuario, id_evento });
    }

    static sumarCantidad(id_usuario, id_evento) {
        this.#updateCantidadStmt.run({ id_usuario, id_evento});
    }

    static restarCantidad(id_usuario, id_evento) {
        this.#restaCantidadStmt.run({ id_usuario, id_evento});
    }
}
