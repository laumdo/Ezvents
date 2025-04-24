import { getConnection } from "../db.js";

export class Artista{
    static #insertStmt = null
    static #updateStmt = null
    static #deleteStmt = null
    static #getByIdStmt = null
    static #getAllStmt = null

    static initStatements(){
        const db = getConnection();

        this.#insertStmt = db.prepare('INSERT INTO artista (nombreArtistico, nombre, biografia, imagen) VALUES (@nombreArtistico, @nombre, @biografia, @imagen)');
        this.#updateStmt = db.prepare('UPDATE artista SET nombreArtistico = @nombreArtistico, nombre = @nombre, biografia = @biografia, imagen = @imagen WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM artista WHERE id = @id');
        this.#getByIdStmt = db.prepare('SELECT * FROM artista WHERE id = @id');
        this.#getAllStmt = db.prepare('SELECT * FROM artista');
    }

    static #insert(artista){
        console.log("Se mete en el insert de artista");
        let result = null;
        try{
            const datos = { nombreArtistico: artista.nombreArtistico, nombre: artista.nombre, biografia: artista.biografia, imagen: artista.imagen };
             result = this.#insertStmt.run(datos);
             artista.#id = result.lastInsertRowid; // Asignar el ID al objeto artista
        }catch(e){
            throw new ErrorDatos('No se ha podido insertar el artista', { cause: e});
        }
        
        return result.lastInsertRowid;//Ver si quiero poner esto o mejor modificar la bd
    }

    static #update(artista){
        console.log("Se mete en el update de artista");
        const datos = { id: artista.#id, nombreArtistico: artista.nombreArtistico, nombre: artista.nombre, biografia: artista.biografia, imagen: artista.imagen };
        
        const result = this.#updateStmt.run(datos);
        if(result.changes === 0) throw new ErrorDatos('Error al actualizar el artista');
        return result;
    }

    static delete(id){
        let result = this.#deleteStmt.run({id});

        if(result.changes === 0) throw new ErrorDatos('Error al eliminar el artista');
        return result;
    }

    static getArtistaById(idArtista){
        try{
            const artista = this.#getByIdStmt.get({id: idArtista});
            if(artista === undefined) throw new ErrorDatos('No se ha encontrado el artista', {id: idArtista});
            
            const { nombreArtistico, nombre, biografia, imagen } = artista;
            return new Artista(idArtista, nombreArtistico, nombre, biografia, imagen);
        }catch(e){
            throw new ErrorDatos('Error al buscar el artista', { cause: e});
        }
    }

    static getAll(){
        try{
            const artistas = this.#getAllStmt.all();
            return artistas;
        }catch(e){
            throw new ErrorDatos('Error al buscar los artistas', { cause: e});
        }
    }

    #id;
    nombreArtistico;
    nombre;
    biografia;
    imagen;

    constructor(id = null, nombreArtistico, nombre, biografia, imagen = null){
        this.#id = id;
        this.nombreArtistico = nombreArtistico;
        this.nombre = nombre;
        this.biografia = biografia;
        this.imagen = imagen;
    }

    get id(){
        return this.#id;
    }

    persist(){
        console.log("Se mete en el persist de artista");
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