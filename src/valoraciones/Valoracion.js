
    import { getConnection } from '../db.js';

    export class Valoraciones {
        static #getValoracionByEventStmt = null;
        static #insertStmt = null;

        static initStatements() {
            const db = getConnection();

            if (this.#getValoracionByEventStmt !== null) return;

            this.#getValoracionByEventStmt = db.prepare('SELECT * FROM valoraciones WHERE id_evento = @id_evento');
            this.#insertStmt = db.prepare(`
                INSERT INTO valoraciones (id_evento, id_usuario, puntuacion, comentario, fecha) 
                VALUES (@id_evento, @id_usuario, @puntuacion, @comentario, @fecha)
            `);
        }
        
        static getValoracionByEvent(id_Evento) { 
            return this.#getValoracionByEventStmt.all({id_evento});
        }    

        
        
        static getAll() {
            const db = getConnection(); 
            return db.prepare('SELECT * FROM eventos').all();
        }
        

        static #insert(valoracion) {
            let result = null;
                const datos = {
                    id_evento: valoracion.id_evento,
                    id_usuario: valoracion.id_usuario,
                    puntuacion: valoracion.puntuacion,
                    comentario: valoracion.comentario,
                    fecha: valoracion.fecha
                };

                result = this.#insertStmt.run(datos);
                valoracion.#id = result.lastInsertRowid;
            return valoracion;
        }

        #id;
        id_evento;
        id_usuario;
        puntuacion;
        comentario;
        fecha;

        constructor(id = null, id_evento, id_usuario, puntuacion, comentario, fecha) {
            this.#id = id;
            this.id_evento = id_evento;
            this.id_usuario = id_usuario;
            this.puntuacion = puntuacion;
            this.comentario = comentario;
            this.fecha = fecha;
        }

        get id() {
            return this.#id;
        }

        persist() {
            return Valoracion.#insert(this);
        }
    }

    