import { ErrorDatos } from "../db.js";
import { getConnection } from '../db.js';
import { Evento } from "../eventos/Evento.js";

export class EntradasUsuario {
    static #insertStmt = null;
    static #updateStmt = null;

    static initStatements(){
        const db = getConnection();
        
        this.#insertStmt = db.prepare('INSERT INTO entradasUsuario(idUsuario, idEvento, cantidad) VALUES (@id_usuario, @id_evento, @cantidad)');
        this.#updateStmt = db.prepare('UPDATE entradasUsuario SET cantidad = cantidad + 1 WHERE idUsuario = @id_usuario AND idEvento = @id_evento');
    }

    static getEntradasByUsuario(id_usuario){
        const db = getConnection();
        return db.prepare('SELECT * FROM entradasUsuario WHERE idUsuario = @id_usuario').all({id_usuario});
    }

    static #insert(id_usuario, id_evento){
        let result = null;
        try{
            const datos = {idUsuario: id_usuario, idEvento: id_evento, cantidad: 1};
            result = this.#insertStmt.run(datos);
        }catch(e){
            throw new ErrorDatos('No se ha podido proceder a la compra', { cause: e});
        }
        //return?
    }

    static #update(idUsuario, idEvento){
        const datos = { idUsuario, idEvento};
        const result = this.#updateStmt.run(datos);

        if(result.changer === 0) throw new ErrorDatos('Error');
    }

    agregarEntrada(id_usuario, id_evento){
        const db = getConnection();

        const existe = db.prepare("SELECT COUNT(*) as count FROM EntradasUsuario WHERE idUsuario = @id_usuario AND idEvento = @id_evento");

        if(existe.count == 0) return EntradasUsuario.#insert(id_usuario, id_evento);
        return EntradasUsuario.#update(id_usuario, id_evento);
    }

    #idUsuario;
    #idEvento;
    cantidad;

    constructor(idUsuario, idEvento){
        this.#idUsuario = idUsuario;
        this.#idEvento = idEvento;
        this.cantidad = 1;
    }
}