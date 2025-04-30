import { ErrorDatos } from "../db.js";
import { getConnection } from '../db.js';

export class EntradasUsuario {
    static #insertStmt = null;
    static #updateStmt = null;
    static #checkStmt = null;
    static #getAllStmt = null;

    static initStatements(){
        const db = getConnection();
        
        this.#insertStmt = db.prepare('INSERT INTO entradasUsuario(idUsuario, idEvento, cantidad, fecha_compra) VALUES (@id_usuario, @id_evento, @cantidad, @fecha_compra)');
        this.#updateStmt = db.prepare('UPDATE entradasUsuario SET cantidad = cantidad + @cantidad WHERE idUsuario = @id_usuario AND idEvento = @id_evento');
        this.#checkStmt = db.prepare('SELECT COUNT(*) as count FROM entradasUsuario WHERE idUsuario = @id_usuario AND idEvento = @id_evento');
        this.#getAllStmt = db.prepare('SELECT * FROM entradasUsuario WHERE idUsuario = @id_usuario');
    }

    static getEntradasByUsuario(id_usuario){
        return this.#getAllStmt.all({id_usuario});
    }

    static #insert(id_usuario, id_evento, cantidad,fecha_compra){
        let result = null;
        try{
            result = this.#insertStmt.run({id_usuario, id_evento, cantidad,fecha_compra});
        }catch(e){
            throw new ErrorDatos('No se ha podido proceder a la compra', { cause: e});
        }
        return result;
    }

    static #update(id_usuario, id_evento, cantidad,fecha_compra){
        const result = this.#updateStmt.run({id_usuario, id_evento, cantidad,fecha_compra});

        if(result.changer === 0) throw new ErrorDatos('Error');
        return result;
    }

    static compraEntrada(id_usuario, id_evento, cantidad,fecha_compra) {
        const existe = this.#checkStmt.get({ id_usuario, id_evento,fecha_compra });
        console.log('existe:', existe.count);
    
        if (existe.count === 0) {
            this.#insert(id_usuario, id_evento, cantidad,fecha_compra);
        } else {
            this.#update(id_usuario, id_evento, cantidad,fecha_compra);
        }
    }

    #id;
    idUsuario;
    idEvento;
    cantidad;
    fecha_compra;

    constructor(idUsuario, idEvento, cantidad,fecha_compra){
        this.#id = null;
        this.idUsuario = idUsuario;
        this.idEvento = idEvento;
        this.cantidad = cantidad;
        this.fecha_compra=fecha_compra;
    }

    persist() {
        if (this.#id === null) return EntradasUsuario.#insert(this);
        return EntradasUsuario.#update(this);
    }
}