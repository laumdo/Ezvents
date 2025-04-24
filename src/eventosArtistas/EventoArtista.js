import { ErrorDatos } from "../db.js";
import { getConnection } from '../db.js';

export class EventoArtista {
    static #insertStmt = null;
    static #getAllArtistsStmt = null;
    static #getAllEventsStmt = null;

    static initStatements(){
        const db = getConnection();
        
        this.#insertStmt = db.prepare('INSERT INTO acudeA(idArtista, idEvento) VALUES (@id_artista, @id_evento)');
        this.#getAllArtistsStmt = db.prepare('SELECT * FROM acudeA WHERE idEvento = @id_evento');
        this.#getAllEventsStmt = db.prepare('SELECT * FROM acudeA WHERE idArtista = @id_artista');
    }

    static getArtistsByEvent(id_evento){
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


    #id;
    idArtista;
    idEvento;

    constructor(idArtista, idEvento){
        this.#id = null;
        this.idArtista = idArtista;
        this.idEvento = idEvento;
    }

    persist() {
        if (this.#id === null) return EventoArtista.#insert(this);
    }
}