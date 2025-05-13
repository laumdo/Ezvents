
    import { getConnection } from '../db.js';

    export class Valoraciones {
        static #getValoracionByEventStmt = null;
        static #insertStmt = null;

        static initStatements() {
            const db = getConnection();

            this.#getValoracionByEventStmt = db.prepare('SELECT * FROM valoraciones WHERE id_evento = @id_evento');
            this.#insertStmt = db.prepare(`
                INSERT INTO valoraciones (id_evento, id_usuario, puntuacion, comentario) 
                VALUES (@id_evento, @id_usuario, @puntuacion, @comentario)
            `);
        }
        
        static getValoracionByEvent(id_evento) { 
            return this.#getValoracionByEventStmt.all({id_evento});
        }    

        
        
        static getAll() {
            const db = getConnection(); 
            return db.prepare('SELECT * FROM valoraciones').all();
        }
        

        static #insert(valoracion) {
            let result = null;
                const datos = {
                    id_evento: valoracion.id_evento,
                    id_usuario: valoracion.id_usuario,
                    puntuacion: valoracion.puntuacion,
                    comentario: valoracion.comentario
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

        constructor(id = null, id_evento, id_usuario, puntuacion, comentario) {
            this.#id = id;
            this.id_evento = id_evento;
            this.id_usuario = id_usuario;
            this.puntuacion = puntuacion;
            this.comentario = comentario;
        }

        get id() {
            return this.#id;
        }

        persist() {
            return Valoraciones.#insert(this);
        }
    }

    