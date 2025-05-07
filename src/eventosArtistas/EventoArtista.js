import { ErrorDatos } from "../db.js";
import { getConnection } from '../db.js';

export class EventoArtista {
    static #insertStmt = null;
    static #deleteStmt = null;
    static #checkStmt = null;
    static #getAllArtistsStmt = null;
    static #getAllEventsStmt = null;
    static #getArtistIdsByEventStmt = null;

    static initStatements(){
        const db = getConnection();
        
        this.#insertStmt = db.prepare('INSERT INTO acudeA(idArtista, idEvento) VALUES (@id_artista, @id_evento)'); 
        this.#deleteStmt = db.prepare('DELETE FROM acudeA WHERE idArtista = @id_artista AND idEvento = @id_evento');
        this.#checkStmt = db.prepare('SELECT COUNT(*) as count FROM acudeA WHERE idArtista = @id_artista AND idEvento = @id_evento');
        this.#getAllArtistsStmt = db.prepare('SELECT * FROM acudeA WHERE idEvento = @id_evento');
        this.#getAllEventsStmt = db.prepare('SELECT * FROM acudeA WHERE idArtista = @id_artista');
        this.#getArtistIdsByEventStmt = db.prepare('SELECT idArtista FROM acudeA WHERE idEvento = @id_evento');
    }

    static getArtistIdsByEvent(id_evento) {
        const rows = this.#getArtistIdsByEventStmt.all({id_evento});
        return rows.map(row => row.idArtista);
    }

    static getArtistsByEvent(id_evento){
        const rows = this.#getAllArtistsStmt.all({id_evento});
        return rows.map(row => new EventoArtista(row));
    }

    static getEventsByArtist(id_artista){
        const rows = this.#getAllEventsStmt.all({id_artista});
        return rows.map(row => new EventoArtista(row));
    }

    static #insert(eventoArtista){
        console.log("se mete en insert de evento artista con id_artista: ", eventoArtista.idArtista);
        let result = null;
        try{
            result = this.#insertStmt.run({ id_artista: eventoArtista.idArtista, id_evento: eventoArtista.idEvento });
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

    constructor({idArtista, idEvento}){
        this.#id = null;
        this.idArtista = idArtista;
        this.idEvento = idEvento;
    }

    persist() {
        const existe = EventoArtista.#checkStmt.get({ id_artista: this.idArtista, id_evento: this.idEvento });
        if (this.#id === null && existe.count === 0) return EventoArtista.#insert(this);
    }
}