export class Evento {
    static #getByIdStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;

    static initStatements(db) {
        if (this.#getByIdStmt !== null) return;

        // Preparar sentencias SQL para la base de datos
        this.#getByIdStmt = db.prepare('SELECT * FROM eventos WHERE id = @id');
        this.#insertStmt = db.prepare(`
            INSERT INTO eventos (nombre, descripcion, fecha, lugar, precio, aforo_maximo) 
            VALUES (@nombre, @descripcion, @fecha, @lugar, @precio, @aforo_maximo)
        `);
        this.#updateStmt = db.prepare(`
            UPDATE eventos SET nombre = @nombre, descripcion = @descripcion, fecha = @fecha, 
            lugar = @lugar, precio = @precio, aforo_maximo = @aforo_maximo 
            WHERE id = @id
        `);
    }

    static getEventoById(id) {
        const evento = this.#getByIdStmt.get({ id });
        if (evento === undefined) throw new EventoNoEncontrado(id);
        const {id, nombre, descripcion, fecha, lugar, precio, aforo_maximo, entradas_vendidas} = evento;
        return new Evento(id, nombre, descripcion, fecha, lugar, precio, aforo_maximo, entradas_vendidas);
    }

    static #insert(evento) {
        let result = null;
        try {
            const datos = {
                nombre: evento.nombre,
                descripcion: evento.descripcion,
                fecha: evento.fecha,
                lugar: evento.lugar,
                precio: evento.precio,
                aforo_maximo: evento.aforo_maximo
            };

            result = this.#insertStmt.run(datos);
            evento.#id = result.lastInsertRowid;
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') {
                throw new EventoYaExiste(evento.nombre);
            }
            throw new ErrorDatos('No se ha insertado el evento', { cause: e });
        }
        return evento;
    }

    static #update(evento) {
        const datos = {
            id: evento.#id,
            nombre: evento.nombre,
            descripcion: evento.descripcion,
            fecha: evento.fecha,
            lugar: evento.lugar,
            precio: evento.precio,
            aforo_maximo: evento.aforo_maximo
        };

        const result = this.#updateStmt.run(datos);
        if (result.changes === 0) throw new EventoNoEncontrado(evento.#id);

        return evento;
    }

    #id;
    nombre;
    descripcion;
    fecha;
    lugar;
    precio;
    aforo_maximo;
    entradas_vendidas;
    // id = null ??????????????????????
    constructor(id = null, nombre, descripcion, fecha, lugar, precio, aforo_maximo, entradas_vendidas = 0) {
        this.#id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.lugar = lugar;
        this.precio = precio;
        this.aforo_maximo = aforo_maximo;
        this.entradas_vendidas = entradas_vendidas;
    }

    get id() {
        return this.#id;
    }

    persist() {
        if (this.#id === null) return Evento.#insert(this);
        return Evento.#update(this);
    }
}

export class EventoNoEncontrado extends Error {
    constructor(id, options) {
        super(`Evento no encontrado: ${id}`, options);
        this.name = 'EventoNoEncontrado';
    }
}

export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = 'ErrorDatos';
    }
}

export class EventoYaExiste extends Error {
    /**
     * 
     * @param {string} username 
     * @param {ErrorOptions} [options]
     */
    constructor(username, options) {
        super(`Evento ya existe: ${username}`, options);
        this.name = 'EventoYaExiste';
    }
}