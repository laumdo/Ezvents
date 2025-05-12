import { getConnection } from "../db.js";

export class DescuentosUsuario {
    static #insertStmt;
    static #updateStmt;
    static #getByUsuarioStmt;
    static #getByUsuarioDescuentoStmt;
    static #existsStmt;
    static #deleteStmt;


    static initStatements() {
        const db = getConnection();

        if (this.#insertStmt) return;

        this.#insertStmt = db.prepare(`
            INSERT INTO DescuentosUsuario (idUsuario, idDescuento, codigo)
            VALUES (@idUsuario, @idDescuento, @codigo)
        `);

        this.#updateStmt = db.prepare(`
            UPDATE DescuentosUsuario
            SET codigo = @codigo
            WHERE idUsuario = @idUsuario AND idDescuento = @idDescuento
        `);

        this.#getByUsuarioStmt = db.prepare(`
            SELECT * FROM DescuentosUsuario WHERE idUsuario = ?
        `);

        this.#getByUsuarioDescuentoStmt = db.prepare(`
            SELECT * FROM DescuentosUsuario 
            WHERE idUsuario = ? AND idDescuento = ?
        `);

        this.#existsStmt = db.prepare(`
            SELECT COUNT(*) as count FROM DescuentosUsuario 
            WHERE idUsuario = ? AND idDescuento = ?
        `);

        this.#deleteStmt = db.prepare(`
            DELETE FROM DescuentosUsuario 
            WHERE idUsuario = ? AND idDescuento = ?
    `);
    }

    static insert(idUsuario, idDescuento) {
        let result = null;
        try {
            const datos = {
                idUsuario,
                idDescuento,
                codigo: DescuentosUsuario.#generarCodigoUnico() // Se genera un código único
            };
    
            result = this.#insertStmt.run(datos);
            return { idUsuario, idDescuento, codigo: datos.codigo };
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') {
                throw new Error("El descuento ya ha sido canjeado por este usuario.");
            }
            throw new Error("No se ha registrado el descuento.", { cause: e });
        }
    }
    

    static obtenerPorUsuario(idUsuario) {
        const db = getConnection(); 
        const stmt = db.prepare(`
            SELECT d.id AS idDescuento, d.titulo, d.condiciones, d.imagen, d.interno, d.valor, du.codigo
            FROM DescuentosUsuario du
            JOIN Descuento d ON du.idDescuento = d.id
            WHERE du.idUsuario = ?
        `);
        return stmt.all(idUsuario);
    }

    /**
   * Elimina el canje del descuento para ese usuario.
   * @param {number} idUsuario 
   * @param {number} idDescuento 
   */
    static delete(idUsuario, idDescuento) {
        this.initStatements();               // asegurar que están los stmts
        const info = this.#deleteStmt.run(idUsuario, idDescuento);
        return info.changes > 0;             // true si borró algo
    }

    static obtenerPorUsuarioYDescuento(idUsuario, idDescuento) {
        return this.#getByUsuarioDescuentoStmt.all(idUsuario, idDescuento);
    }

    static existe(idUsuario, idDescuento) {
        const result = this.#existsStmt.get(idUsuario, idDescuento);
        return result.count > 0;
    }

    persist() {
        if (DescuentosUsuario.existe(this.idUsuario, this.idDescuento)) {
            this.updateStmt.run({
                idUsuario: this.idUsuario,
                idDescuento: this.idDescuento,
                codigo: this.codigo
            });
        } else {
            DescuentosUsuario.insert(this);
        }
    }

    static #generarCodigoUnico() {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    constructor(idUsuario, idDescuento, codigo = null) {
        this.idUsuario = idUsuario;
        this.idDescuento = idDescuento;
        this.codigo = codigo || DescuentosUsuario.#generarCodigoUnico();
    }
}
