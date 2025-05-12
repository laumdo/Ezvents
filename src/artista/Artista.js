import { getConnection } from "../db.js";

export class Artista{
    static #insertStmt = null
    static #updateStmt = null
    static #deleteStmt = null
    static #getByIdStmt = null
    static #getAllStmt = null

    static initStatements(){
        const db = getConnection();

        this.#insertStmt = db.prepare('INSERT INTO artista (nombreArtistico, nombre, biografia, nacimiento, genero, canciones, imagen) VALUES (@nombreArtistico, @nombre, @biografia, @nacimiento, @genero, @canciones, @imagen)');
        this.#updateStmt = db.prepare('UPDATE artista SET nombreArtistico = @nombreArtistico, nombre = @nombre, biografia = @biografia, nacimiento = @nacimiento, genero = @genero, canciones = @canciones, imagen = @imagen WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM artista WHERE id = @id');
        this.#getByIdStmt = db.prepare('SELECT * FROM artista WHERE id = @id');
        this.#getAllStmt = db.prepare('SELECT * FROM artista');
    }

    static getArtistasById(id_artistas){
        if(id_artistas.length === 0) return [];

        const db = getConnection();

        const placeholders = id_artistas.map(() => '?').join(', ');
        const stmt = db.prepare(`SELECT * FROM artista WHERE id IN (${placeholders})`);
        const rows = stmt.all(...id_artistas);

        return rows.map(row => new Artista(row));
    }

    static getArtistaById(idArtista){
        try{
            const artista = this.#getByIdStmt.get({id: idArtista});
            if(artista === undefined) throw new ErrorDatos('No se ha encontrado el artista', {id: idArtista});
            
            return new Artista(artista);
        }catch(e){
            throw new ErrorDatos('Error al buscar el artista', { cause: e});
        }
    }

    static getAll(){
        const rows = this.#getAllStmt.all();
        return rows.map(row => new Artista(row));
    }

    static #insert(artista){
        let result = null;
        try{
            const datos = { nombreArtistico: artista.nombreArtistico, nombre: artista.nombre, biografia: artista.biografia, nacimiento: artista.nacimiento, genero: artista.genero, canciones: artista.canciones, imagen: artista.imagen };
            result = this.#insertStmt.run(datos);
            artista.#id = result.lastInsertRowid;
        }catch(e){
            throw new ErrorDatos('No se ha podido insertar el artista', { cause: e});
        }
        
        return result.lastInsertRowid;
    }

    static #update(artista){
        const datos = { id: artista.#id, nombreArtistico: artista.nombreArtistico, nombre: artista.nombre, biografia: artista.biografia, nacimiento: artista.nacimiento, genero: artista.genero, canciones: artista.canciones, imagen: artista.imagen };
        
        const result = this.#updateStmt.run(datos);
        if(result.changes === 0) throw new ErrorDatos('Error al actualizar el artista');
        return result;
    }

    static delete(id){
        let result = this.#deleteStmt.run({id});

        if(result.changes === 0) throw new ErrorDatos('Error al eliminar el artista');
        return result;
    }

    #id;
    nombreArtistico;
    nombre;
    biografia;
    nacimiento;
    genero;
    canciones;
    imagen;

    constructor({id = null, nombreArtistico, nombre, biografia,nacimiento, genero, canciones, imagen = null}){
        this.#id = id;
        this.nombreArtistico = nombreArtistico;
        this.nombre = nombre;
        this.biografia = biografia;
        this.nacimiento = nacimiento;
        this.genero = genero;
        this.canciones = canciones;
        this.imagen = imagen;
    }

    get id(){
        return this.#id;
    }

    persist(){
        if(this.#id === null) return Artista.#insert(this);
        return Artista.#update(this);
    }
}

export class ArtistaNoEncontrado extends Error {
    constructor(id, options) {
        super(`Artista no encontrado: ${id}`, options);
        this.name = 'ArtistaNoEncontrado';
    }
}