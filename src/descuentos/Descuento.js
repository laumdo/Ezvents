import { ErrorDatos } from "../db.js";

export class Descuento {
    static #getAllStmt = null;
    static #getByIdStmt = null;
    static #insertStmt = null;
    static #deleteStmt = null;
    static #updateStmt = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;

        this.#getAllStmt = db.prepare('SELECT * FROM Descuentos');
        this.#getByIdStmt = db.prepare('SELECT * FROM Descuentos WHERE id = @id');
        this.#insertStmt = db.prepare('INSERT INTO Descuentos(titulo, condiciones, puntos, imagen) VALUES (@titulo, @condiciones, @puntos, @imagen)');
        this.#deleteStmt = db.prepare('DELETE FROM Descuentos WHERE id = @id'); 
    }

    static obtenerTodos() {
        return this.#getAllStmt.all();
    }

    static obtenerPorId(id) {
        const descuento = this.#getByIdStmt.get({ id });
        if (!descuento) throw new DescuentoNoEncontrado(id);

        return new Descuento(descuento.titulo, descuento.condiciones, descuento.puntos, descuento.imagen, descuento.id);
    }

    static #insert(descuento) {
        let result = null;
        try {
            const datos = {
                titulo: descuento.titulo,
                condiciones: descuento.condiciones,
                puntos: descuento.puntos,
                imagen: descuento.imagen
            };
            result = this.#insertStmt.run(datos);
            descuento.id = result.lastInsertRowid;
        } catch(e) {
            throw new ErrorDatos('No se ha insertado el descuento', { cause: e });
        }
        return descuento;
    }

    static #update(descuento) {
        const datos = {
            id: descuento.id,
            titulo: descuento.titulo,
            descripcion: descuento.descripcion,
            puntos: descuento.puntos,
            imagen: descuento.imagen
        };
    
        const result = this.#updateStmt.run(datos);
    
        if (result.changes === 0) {
            throw new DescuentoNoEncontrado(descuento.id);
        }
    
        return descuento;
    }

    
    static delete(id) {
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) throw new DescuentoNoEncontrado(id);
    }

    persist() {
        if (this.id === null) return Descuento.#insert(this);
    }

    id;
    titulo;
    condiciones;
    puntos;
    imagen;

    constructor(titulo, condiciones, puntos, imagen, id = null) {
        this.titulo = titulo;
        this.condiciones = condiciones;
        this.puntos = puntos;
        this.imagen = imagen;
        this.id = id;
    }
}

export class DescuentoNoEncontrado extends Error {
    constructor(id, options) {
        super(`Descuento no encontrado: ${id}`, options);
        this.name = 'DescuentoNoEncontrado';
    }
}