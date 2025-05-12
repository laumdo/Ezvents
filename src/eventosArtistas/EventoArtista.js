import { ErrorDatos } from "../db.js";
import { getConnection } from '../db.js';

export class EventoArtista {
    static #insertStmt = null;
    static #deleteStmt = null;
    static #checkStmt = null;
    static #getAllArtistsStmt = null;
    static #getAllEventsStmt = null;

    static initStatements(){
        const db = getConnection();
        
        this.#insertStmt = db.prepare('INSERT INTO acudeA(idArtista, idEvento) VALUES (@id_artista, @id_evento)'); 
        this.#deleteStmt = db.prepare('DELETE FROM acudeA WHERE idArtista = @id_artista AND idEvento = @id_evento');
        this.#checkStmt = db.prepare('SELECT COUNT(*) as count FROM acudeA WHERE idArtista = @id_artista AND idEvento = @id_evento');
        this.#getAllArtistsStmt = db.prepare('SELECT * FROM acudeA WHERE idEvento = @id_evento');
        this.#getAllEventsStmt = db.prepare('SELECT * FROM acudeA WHERE idArtista = @id_artista');
    }

    static getArtistsByEvent(id_evento){//cambiar?
        return this.#getAllArtistsStmt.all({id_evento});
    }

    static getEventsByArtist(id_artista){
        return this.#getAllEventsStmt.all({id_artista});
    }

    static #insert(id_artista, id_evento){
        let result = null;
        try{
            result = this.#insertStmt.run({id_artista, id_evento});
        }catch(e){
            throw new ErrorDatos('No se ha podido añadir el artista al evento', { cause: e});
        }
        return result;
    }

    static #delete(id_artista, id_evento){
        let result = null;
        try{
            result = this.#deleteStmt.run({id_artista, id_evento});
        }catch(e){
            throw new ErrorDatos('No se ha podido eliminar el artista al evento', { cause: e});
        }
        return result;
    }

    static contratado(id_artista, id_evento){
        const existe = this.#checkStmt.get({ id_artista, id_evento });
    
        if (existe.count === 0) {
            return false;
        }else{
            return true;
        }
    }

    static agregarArtista(id_artista, id_evento) {//QUITAR ESTO Y USAR EL PERSIST
        const existe = this.#checkStmt.get({ id_artista, id_evento });
    
        if (existe.count === 0) {
            this.#insert(id_artista, id_evento);
        }else{
            throw new ErrorDatos('El artista ya está en el cartel del evento', { cause: e});
        }
    }

    static eliminarArtista(id_artista, id_evento){
        const existe = this.#checkStmt.get({ id_artista, id_evento });

        if (existe.count === 1) {
            this.#delete(id_artista, id_evento);
        }else{
            throw new ErrorDatos('El artista no está contratado para este evento', { cause: e});
        }
    }


    #id;
    idArtista;
    idEvento;

    constructor(idArtista, idEvento){
        this.#id = null;
        this.idArtista = idArtista;
        this.idEvento = idEvento;
    }

    persist() {//PREGUNTAR SI AQUI PUEDO PONER LO DE CHECK
        if (this.#id === null) return EventoArtista.#insert(this);
    }
}