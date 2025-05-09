import { getConnection } from "../db.js";

export class Descuento {
    static #getByIdStmt = null;
    static #insertStmt = null;
    static #deleteStmt = null;
    static #updateStmt = null;
    static #getAllStmt=null;

    static initStatements() {
        const db = getConnection();

        if (this.#getByIdStmt !== null) return;
        
        this.#getByIdStmt = db.prepare('SELECT * FROM Descuento WHERE id = @id');
        this.#insertStmt = db.prepare('INSERT INTO Descuento(id, titulo, condiciones, puntos, imagen, interno, valor) VALUES (@id, @titulo, @condiciones, @puntos, @imagen, @interno, @valor)');
        this.#updateStmt = db.prepare(`UPDATE Descuento SET titulo=@titulo, condiciones=@condiciones, puntos=@puntos, imagen=@imagen, interno=@interno, valor=@valor WHERE id=@id`);
        this.#deleteStmt = db.prepare('DELETE FROM Descuento WHERE id = @id'); 
        this.#getAllStmt=db.prepare('SELECT * FROM Descuento');
    }

    static getAll() {
 
        return this.#getAllStmt.all().map(row => new Descuento(row));
    }

    static getDescuento(id) {
        const descuento = this.#getByIdStmt.get({ id });
        if (!descuento) throw new DescuentoNoEncontrado(id);
        return new Descuento(descuento.id, descuento.titulo, descuento.condiciones, descuento.puntos, descuento.imagen, descuento.interno, descuento.valor);
    }
    
    static getInternos() {

        return this.getAll().filter(d => d.interno);
    }

    static #insert(descuento) {
        let result = null;
        try {
            const datos = {
                id: descuento.id,
                titulo: descuento.titulo,
                condiciones: descuento.condiciones,
                puntos: descuento.puntos,
                imagen: descuento.imagen,
                interno: descuento.interno,
                valor: descuento.valor
            };
            result = this.#insertStmt.run(datos);
            descuento.id = result.lastInsertRowid;
        } catch(e) {
            if (e.code === 'SQLITE_CONSTRAINT') {
                throw new DescuentoYaExiste(descuento.titulo);
            }
            throw new ErrorDatos('No se ha insertado el descuento', { cause: e });
        }
        return descuento;
    }

    static #update(descuento) {
        const datos = {
            id: descuento.id,
            titulo: descuento.titulo,
            condiciones: descuento.condiciones,
            puntos: descuento.puntos,
            imagen: descuento.imagen,
            interno: descuento.interno,
            valor: descuento.valor
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
        return Descuento.#update(this);
    }

    constructor(id, titulo, condiciones, puntos, imagen='descuento.png',interno=false,valor=null) {
        this.id = id;
        this.titulo = titulo;
        this.condiciones = condiciones;
        this.puntos = puntos;
        this.imagen = imagen;
        this.interno =interno;
        this.valor=valor;
    }
}

export class DescuentoNoEncontrado extends Error {
    constructor(id, options) {
        super(`Descuento no encontrado: ${id}`, options);
        this.name = 'DescuentoNoEncontrado';
    }
}

export class DescuentoYaExiste extends Error {
    constructor(titulo, options) {
        super(`Descuento ya existe: ${titulo}`, options);
        this.name = 'DescuentoYaExiste';
    }
}
