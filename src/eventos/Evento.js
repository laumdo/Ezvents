    import bcrypt from "bcryptjs";
    import { getConnection } from '../db.js';

    export class Evento {
        static #getByIdStmt = null;
        static #getByIdEmpresaStmt = null;
        static #insertStmt = null;
        static #updateStmt = null;
        static #deleteStmt = null; 

        static initStatements() {
            const db = getConnection();

            if (this.#getByIdStmt !== null) return;

            this.#getByIdStmt = db.prepare('SELECT * FROM eventos WHERE id = @id');
            this.#getByIdEmpresaStmt = db.prepare('SELECT * FROM eventos WHERE idEmpresa = ?');
            this.#insertStmt = db.prepare(`
                INSERT INTO eventos (idEmpresa, nombre, descripcion, fecha, lugar, precio, aforo_maximo, entradas_vendidas, imagen) 
                VALUES (@idEmpresa, @nombre, @descripcion, @fecha, @lugar, @precio, @aforo_maximo, @entradas_vendidas, @imagen)
            `);
            this.#updateStmt = db.prepare(`
                UPDATE eventos SET nombre = @nombre, descripcion = @descripcion, fecha = @fecha, 
                lugar = @lugar, precio = @precio, aforo_maximo = @aforo_maximo, entradas_vendidas = @entradas_vendidas, imagen = @imagen 
                WHERE id = @id
            `);
            this.#deleteStmt = db.prepare('DELETE FROM eventos WHERE id = @id');
        }

        static getEventosById(entradas){
            if(entradas.length === 0) return {};

            const db = getConnection();

            const placeholders = entradas.map(() => '?').join(', ');
            const stmt = db.prepare(`SELECT * FROM eventos WHERE id IN (${placeholders})`);
            const rows = stmt.all(...entradas);

            const map ={};
            for(const row of rows){
                map[row.id] = new Evento(row);
            }

            return map;
        }

        static getEventosByIdEmpresa(idEmpresa) {
            try {
                const rows = this.#getByIdEmpresaStmt.all(idEmpresa);
                return rows.map(row => new Evento(row));
            } catch (error) {
                console.error("Error al obtener eventos por idEmpresa:", error);
                throw error;
            }
        }
        
        static getEventoById(idEvento) { 
            try {
                const evento = this.#getByIdStmt.get({ id: idEvento });
                if (evento === undefined) throw new EventoNoEncontrado(idEvento);
                
                return new Evento(evento);
            } catch (error) {
                console.error("Error al buscar evento:", error);
                throw error;
            }
        }    

        
        
        static getAll() {
            const db = getConnection(); 
            return db.prepare('SELECT * FROM eventos').all();
        }
        

        static #insert(evento) {
            let result = null;
            try {
                const datos = {
                    idEmpresa: evento.idEmpresa,
                    nombre: evento.nombre,
                    descripcion: evento.descripcion,
                    fecha: evento.fecha,
                    lugar: evento.lugar,
                    precio: evento.precio,
                    aforo_maximo: evento.aforo_maximo,
                    entradas_vendidas: evento.entradas_vendidas,
                    imagen: evento.imagen
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
            aforo_maximo: evento.aforo_maximo,
            entradas_vendidas: evento.entradas_vendidas,
            imagen: evento.imagen
        };

        const result = this.#updateStmt.run(datos);
        if (result.changes === 0) throw new EventoNoEncontrado(evento.#id);

        return evento;
    }

    static delete(id) {
        console.log("se mete el evento en delete con id: ", id);
        const db = getConnection();
        const deleteStmt = db.prepare('DELETE FROM eventos WHERE id = ?');
        const result = deleteStmt.run(id);
        
        if (result.changes === 0) throw new EventoNoEncontrado(id);
    }

        #id;
        idEmpresa;
        nombre;
        descripcion;
        fecha;
        lugar;
        precio;
        aforo_maximo;
        entradas_vendidas;
        imagen;

        constructor({ id = null, idEmpresa, nombre, descripcion, fecha, lugar, precio, aforo_maximo, entradas_vendidas = 0, imagen = 'default.png' }) {
            this.#id = id;
            this.idEmpresa = idEmpresa;
            this.nombre = nombre;
            this.descripcion = descripcion;
            this.fecha = fecha;
            this.lugar = lugar;
            this.precio = precio;
            this.aforo_maximo = aforo_maximo;
            this.entradas_vendidas = entradas_vendidas;
            this.imagen = imagen;
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