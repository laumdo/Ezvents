import { getConnection } from '../db.js';

export class Evento {
  static #getAllStmt = null;
  static #getByIdStmt = null;
  static #insertStmt = null;
  static #searchStmt = null;
  static #updateStmt = null;
  static #deleteStmt = null;

  /**
   * Prepara las sentencias SQL una sola vez.
   */
  static initStatements() {
    const db = getConnection();
    if (this.#getByIdStmt) return;

    this.#getAllStmt = db.prepare('SELECT * FROM eventos');
    this.#getByIdStmt = db.prepare('SELECT * FROM eventos WHERE id = @id');
    this.#searchStmt   = db.prepare('SELECT * FROM eventos WHERE LOWER(nombre) LIKE LOWER(?)');
    this.#insertStmt = db.prepare(
      `INSERT INTO eventos (
        idEmpresa, nombre, descripcion, fecha, lugar,
        precio, aforo_maximo, entradas_vendidas, imagen, edad_minima
      ) VALUES (
        @idEmpresa, @nombre, @descripcion, @fecha, @lugar,
        @precio, @aforo_maximo, @entradas_vendidas, @imagen, @edad_minima
      )`
    );
    this.#updateStmt = db.prepare(
      `UPDATE eventos SET
        nombre           = @nombre,
        descripcion      = @descripcion,
        fecha            = @fecha,
        lugar            = @lugar,
        precio           = @precio,
        aforo_maximo     = @aforo_maximo,
        entradas_vendidas= @entradas_vendidas,
        imagen           = @imagen,
        edad_minima      = @edad_minima
      WHERE id = @id`
    );
    this.#deleteStmt = db.prepare('DELETE FROM eventos WHERE id = ?');
  }
           
  #id;
  idEmpresa;
  nombre;
  descripcion;
  fecha;
  lugar;
  precio;
  aforo_maximo;
  entradas_vendidas;
  imagen;
  edad_minima;

  /**
   * Recibe un objeto con campos de la tabla.
   */
  constructor({
    id,
    idEmpresa,
    nombre,
    descripcion,
    fecha,
    lugar,
    precio,
    aforo_maximo,
    entradas_vendidas = 0,
    imagen = 'default.png',
    edad_minima = 0
  }) {
    this.#id               = id;
    this.idEmpresa         = idEmpresa;
    this.nombre            = nombre;
    this.descripcion       = descripcion;
    this.fecha             = fecha;
    this.lugar             = lugar;
    this.precio            = precio;
    this.aforo_maximo      = aforo_maximo;
    this.entradas_vendidas = entradas_vendidas;
    this.imagen            = imagen;
    this.edad_minima       = edad_minima;
  }

        static #insert(evento) {
            let result = null;
            try {
                const datos = {
                    nombre: evento.nombre,
                    descripcion: evento.descripcion,
                    fecha: evento.fecha,
                    hora: evento.hora,
                    lugar: evento.lugar,
                    precio: evento.precio,
                    aforo_maximo: evento.aforo_maximo,
                    entradas_vendidas: evento.entradas_vendidas,
                    imagen: evento.imagen
                };

                result = this.#insertStmt.run(datos);
                evento.#id = result.lastInsertRowid;
            } catch (e) {
                if (e.code === 'SQLITE_CONSTRAINT') {
                    throw new EventoYaExiste(evento.nombre);
                }
                throw new ErrorDatos('No se ha insertado el evento', { cause: e });
            }
            return evento;
        }

    static #update(evento) {
        const datos = {
            id: evento.#id,
            nombre: evento.nombre,
            descripcion: evento.descripcion,
            fecha: evento.fecha,
            hora: evento.hora,
            lugar: evento.lugar,
            precio: evento.precio,
            aforo_maximo: evento.aforo_maximo,
            entradas_vendidas: evento.entradas_vendidas,
            imagen: evento.imagen
        };

        const result = this.#updateStmt.run(datos);
        if (result.changes === 0) throw new EventoNoEncontrado(evento.#id);

        return evento;
    }
    /** Sólo lectura pública del ID */
  get id() {
    return this.#id;
  }

  /** Inserta o actualiza según corresponda */
  persist() {
    if (this.#id === null) {
      const result = Evento.#insertStmt.run({
        idEmpresa:         this.idEmpresa,
        nombre:            this.nombre,
        descripcion:       this.descripcion,
        fecha:             this.fecha,
        lugar:             this.lugar,
        precio:            this.precio,
        aforo_maximo:      this.aforo_maximo,
        entradas_vendidas: this.entradas_vendidas,
        imagen:            this.imagen,
        edad_minima:       this.edad_minima
      });
      this.#id = result.lastInsertRowid;
    } else {
      Evento.#updateStmt.run({
        id:                this.#id,
        nombre:            this.nombre,
        descripcion:       this.descripcion,
        fecha:             this.fecha,
        lugar:             this.lugar,
        precio:            this.precio,
        aforo_maximo:      this.aforo_maximo,
        entradas_vendidas: this.entradas_vendidas,
        imagen:            this.imagen,
        edad_minima:       this.edad_minima
      });
    }
    return this;
  }

  /** Elimina un evento por ID */
  static delete(id) {
    const result = this.#deleteStmt.run(id);
    if (result.changes === 0) {
      throw new EventoNoEncontrado(id);
    }
  }

  /** Devuelve todas las filas como instancias de Evento */
  static getAll() {
    return this.#getAllStmt.all();//.map(row => new Evento(row));
  }

  /** Recupera un evento o lanza si no existe */
  static getEventoById(id) {
    const row = this.#getByIdStmt.get({ id });
    if (!row) {
      throw new EventoNoEncontrado(id);
    }
    return new Evento(row);
  }

  static getEventosById(entradas) {
    if (entradas.length === 0) return {};

    const db = getConnection();

    const placeholders = entradas.map(() => "?").join(", ");
    const stmt = db.prepare(
      `SELECT * FROM eventos WHERE id IN (${placeholders})`
    );
    const rows = stmt.all(...entradas);

    const map = {};
    for (const row of rows) {
      map[row.id] = new Evento(row);
    }

    return map;
  }

  /** Busca eventos cuyo nombre contenga el texto (insensible a mayúsculas) */
  static searchByName(texto) {
    const like = `%${texto}%`;
    return this.#searchStmt
      .all(like)
      .map(row => new Evento(row));
  }
}

export class EventoNoEncontrado extends Error {
  constructor(id) {
    super(`Evento no encontrado: ${id}`);
    this.name = 'EventoNoEncontrado';
  }
}
