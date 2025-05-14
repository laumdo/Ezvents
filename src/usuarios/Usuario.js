import { ErrorDatos } from "../db.js";
import { getConnection } from "../db.js"
import bcrypt from "bcryptjs";

export const RolesEnum = Object.freeze({
    USUARIO: 'U',
    ADMIN: 'A',
    EMPRESA: 'E'
});

export class Usuario {  
    static #getByUsernameStmt = null;
    static #getByIdStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;
    static #getEmpresasStmt = null;

    static initStatements(db) {
        if (this.#getByUsernameStmt !== null) return;

        this.#getByUsernameStmt = db.prepare('SELECT * FROM Usuarios WHERE username = @username');
        this.#getByIdStmt = db.prepare('SELECT * FROM Usuarios WHERE id = @id');
        this.#insertStmt = db.prepare('INSERT INTO Usuarios(username, password, nombre, email, apellidos, rol, puntos,fecha_nacimiento, fecha_ultimo_bonus) VALUES (@username, @password, @nombre, @email, @apellidos, @rol, @puntos,@fecha_nacimiento, @fecha_ultimo_bonus)');
        this.#updateStmt = db.prepare('UPDATE Usuarios SET username = @username, password = @password, email = @email, apellidos = @apellidos, rol = @rol, nombre = @nombre, puntos = @puntos, fecha_nacimiento = @fecha_nacimiento,fecha_ultimo_bonus=@fecha_ultimo_bonus WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Usuarios WHERE id = @id'); 
        this.#getEmpresasStmt = db.prepare('SELECT * FROM Usuarios WHERE rol = @rol');
    }

    static getUsuarioById(id){
        const usuario = this.#getByIdStmt.get({ id });
        if(usuario == undefined) throw new UsuarioNoEncontrado(id);
        const { password, rol, nombre, apellidos, email, username, puntos,fecha_nacimiento,fecha_ultimo_bonus } = usuario;

        return new Usuario(username, password, nombre, apellidos, email, rol, id, puntos,fecha_nacimiento,fecha_ultimo_bonus);
    }

    static getEmpresas(){
        return this.#getEmpresasStmt.all({ rol: 'E' });
    }

    static getUsuarioByUsername(username) {
        const usuario = this.#getByUsernameStmt.get({ username });
        if (usuario === undefined) throw new UsuarioNoEncontrado(username);

        const { password, rol, nombre, apellidos, email, id, puntos, fecha_nacimiento,fecha_ultimo_bonus } = usuario;

        return new Usuario(username, password, nombre, apellidos, email, rol, id, puntos, fecha_nacimiento,fecha_ultimo_bonus);
    }
    
    static existeUsername(username) {
        const row = this.#getByUsernameStmt.get({ username });
        return Boolean(row);
    }

    /**
   * Comprueba si ya existe un bonus de cumpleaños para hoy.
   */
  static hasBirthdayBonusToday(idUsuario) {
    const usuario = this.getUsuarioById(idUsuario);
    const hoy = new Date().toISOString().slice(0,10);
    return usuario.fecha_ultimo_bonus === hoy;
  }

  /**
   * Inserta un record de puntos para el usuario (por cumpleaños).
   */
  static addBirthdayBonus(idUsuario) {
    const usuario = this.getUsuarioById(idUsuario);
  const hoy = new Date().toISOString().slice(0,10);

  usuario.puntos = (usuario.puntos || 0) + 200;
  usuario.fecha_ultimo_bonus = hoy;    // ← AÑADE ESTA LÍNEA
  usuario.persist();
  return usuario;
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
            const fecha_nacimiento=usuario.fecha_nacimiento;
            const fecha_ultimo_bonus= usuario.fecha_ultimo_bonus;
            const datos = {username, password, nombre, apellidos, email, rol, puntos,fecha_nacimiento,fecha_ultimo_bonus};

            result = this.#insertStmt.run(datos);

            usuario.#id = result.lastInsertRowid;
        } catch(e) { 
            if (e.code && e.code.startsWith('SQLITE_CONSTRAINT')) {
                if (e.message.includes('Usuarios.username')) {
                    throw new UsuarioYaExiste(usuario.#username);
                }
                if (e.message.includes('Usuarios.email')) {
                    throw new EmailYaExiste(usuario.email);
                }
            }
            throw new ErrorDatos('No se ha insertado el usuario', { cause: e });
        }
        return usuario;
    }

    static #update(usuario) {
        console.log("update");
        const datos = {
            username: usuario.username,
            password: usuario.password,
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            email: usuario.email,
            rol: usuario.rol,
            puntos: usuario.puntos,
            fecha_nacimiento: usuario.fecha_nacimiento,
            fecha_ultimo_bonus: usuario.fecha_ultimo_bonus,
            id: Number.parseInt(usuario.#id)
        };
        
        try{
            const result = this.#updateStmt.run(datos);

            console.log("despues del stmt");
            if (result.changes === 0) throw new UsuarioNoEncontrado(usuario.#id);

            console.log("fin update");

            return usuario;
        }catch(e){
            console.error("Error en el update:", e);
            throw new ErrorDatos('No se ha podido actualizar el usuario', { cause: e });
        }
    }
      static getAvailablePoints(idUsuario) {
        const db = getConnection();
        const row = db.prepare(`
          SELECT COALESCE(SUM(puntos),0) AS total
          FROM PuntosUsuario
          WHERE idUsuario = ?
            AND fecha_obtencion >= datetime('now','-40 days')
        `).get(idUsuario);
        return row.total;
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
    fecha_nacimiento;
    fecha_ultimo_bonus;

    constructor(username, password, nombre, apellidos, email, rol = RolesEnum.USUARIO, id = null, puntos = 0,fecha_nacimiento,fecha_ultimo_bonus=null) {
        this.#username = username;
        this.#password = password;
        this.nombre = nombre;
        this.rol = rol;
        this.apellidos = apellidos;
        this.email = email;
        this.#id = id;
        this.puntos = puntos; // Inicializar con el valor pasado o 0
        this.fecha_nacimiento=fecha_nacimiento;
        this.fecha_ultimo_bonus=fecha_ultimo_bonus;
    }

    get id() {
        return this.#id;
    }

    set username(nuevoUsername) {
        this.#username = nuevoUsername;
    }

    set password(nuevoPassword) {
        this.#password = bcrypt.hashSync(nuevoPassword);
    }

    get username() {
        return this.#username;
    }

    get password() {
        return this.#password;
    }
    
    get age() {
        const [y,m,d] = this.fecha_nacimiento.split('-').map(Number);
        const dob = new Date(y,m-1,d);
        const diff = Date.now() - dob.getTime();
        return Math.floor(diff / (1000*60*60*24*365.25));
    }
    
      get isAdult() {
        return this.age >= 18;
      }

    persist() {
        console.log("persist");
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


export class EmailYaExiste extends Error {
    constructor(email, options) {
        super(`Email ya existe: ${email}`, options);
        this.name = 'EmailYaExiste';
    }
}
