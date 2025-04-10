import { ErrorDatos } from "../db.js";
import bcrypt from "bcryptjs";

export const RolesEnum = Object.freeze({
    USUARIO: 'U',
    ADMIN: 'A',
    EMPRESA: 'E'
});

export class Usuario {
    static #getByUsernameStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#getByUsernameStmt !== null) return;

        this.#getByUsernameStmt = db.prepare('SELECT * FROM Usuarios WHERE username = @username');
        this.#insertStmt = db.prepare('INSERT INTO Usuarios(username, password, nombre, email, apellidos, rol, puntos) VALUES (@username, @password, @nombre, @email, @apellidos, @rol, @puntos)');
        this.#updateStmt = db.prepare('UPDATE Usuarios SET username = @username, password = @password, email = @email, apellidos = @apellidos, rol = @rol, nombre = @nombre, puntos = @puntos WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Usuarios WHERE id = @id'); 
    }

    static getUsuarioByUsername(username) {
        const usuario = this.#getByUsernameStmt.get({ username });
        if (usuario === undefined) throw new UsuarioNoEncontrado(username);

        const { password, rol, nombre, apellidos, email, id, puntos } = usuario;

        return new Usuario(username, password, nombre, apellidos, email, rol, id, puntos);
    }

    static #insert(usuario) {
        let result = null;
        try {
            const username = usuario.#username;
            const password = usuario.#password;
            const nombre = usuario.nombre;
            const rol = usuario.rol;
            const apellidos = usuario.apellidos;
            const email = usuario.email;
            const puntos = usuario.puntos || 0; // Agregamos los puntos
            const datos = {username, password, nombre, apellidos, email, rol, puntos};

            result = this.#insertStmt.run(datos);

            usuario.#id = result.lastInsertRowid;
        } catch(e) { 
            if (e.code === 'SQLITE_CONSTRAINT') {
                throw new UsuarioYaExiste(usuario.#username);
            }
            throw new ErrorDatos('No se ha insertado el usuario', { cause: e });
        }
        return usuario;
    }

    static #update(usuario) {
        const username = usuario.#username;
        const password = usuario.#password;
        const nombre = usuario.nombre;
        const rol = usuario.rol;
        const apellidos = usuario.apellidos;
        const email = usuario.email;
        const puntos = usuario.puntos; // Agregamos los puntos
        const datos = {username, password, nombre, apellidos, email, rol, puntos, id: usuario.#id};

        const result = this.#updateStmt.run(datos);
        if (result.changes === 0) throw new UsuarioNoEncontrado(username);

        return usuario;
    }

    static delete(id) {
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) throw new UsuarioNoEncontrado(id);
    }

    static async login(username, password) {
        let usuario = null;
        try {
            usuario = this.getUsuarioByUsername(username);
        } catch (e) {
            throw new UsuarioOPasswordNoValido(username, { cause: e });
        }

        const passwordMatch = await bcrypt.compare(password, usuario.#password);
        if ( ! passwordMatch ) throw new UsuarioOPasswordNoValido(username);

        return usuario;
    }
    
    #id;
    #username;
    #password;
    rol;
    nombre;
    apellidos;
    email;
    puntos; // Nuevo atributo puntos

    constructor(username, password, nombre, apellidos, email, rol = RolesEnum.USUARIO, id = null, puntos = 0) {
        this.#username = username;
        this.#password = password;
        this.nombre = nombre;
        this.rol = rol;
        this.apellidos = apellidos;
        this.email = email;
        this.#id = id;
        this.puntos = puntos; // Inicializar con el valor pasado o 0
    }

    get id() {
        return this.#id;
    }

    set password(nuevoPassword) {
        this.#password = bcrypt.hashSync(nuevoPassword);
    }

    get username() {
        return this.#username;
    }

    persist() {
        if (this.#id === null) return Usuario.#insert(this);
        return Usuario.#update(this);
    }
}

export class UsuarioNoEncontrado extends Error {
    constructor(username, options) {
        super(`Usuario no encontrado: ${username}`, options);
        this.name = 'UsuarioNoEncontrado';
    }
}

export class UsuarioOPasswordNoValido extends Error {
    constructor(username, options) {
        super(`Usuario o password no válido: ${username}`, options);
        this.name = 'UsuarioOPasswordNoValido';
    }
}

export class UsuarioYaExiste extends Error {
    constructor(username, options) {
        super(`Usuario ya existe: ${username}`, options);
        this.name = 'UsuarioYaExiste';
    }
}
