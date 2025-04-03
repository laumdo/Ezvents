import { getConnection } from "../db.js";

export class DescuentosUsuario {
    static #insertStmt = null;
    static #getByUsuarioStmt = null;
    static #getByUsuarioDescuentoStmt = null;

    static initStatements() {
        const db = getConnection();

        if (this.#insertStmt !== null) return;

        this.#insertStmt = db.prepare(`
            INSERT INTO DescuentosUsuario (idUsuario, idDescuento, codigo)
            VALUES (@idUsuario, @idDescuento, @codigo)
        `);

        this.#getByUsuarioStmt = db.prepare(`
            SELECT * FROM DescuentosUsuario WHERE idUsuario = @idUsuario
        `);
        this.#getByUsuarioDescuentoStmt = db.prepare(`
            SELECT * FROM DescuentosUsuario 
            WHERE idUsuario = @idUsuario AND idDescuento = @idDescuento
        `);
    }

    static canjearDescuento(idUsuario, idDescuento, codigo) {
        const db = getConnection();
        this.initStatements(db);
        
        try {
            this.#insertStmt.run({ idUsuario, idDescuento, codigo });
        } catch (error) {
            throw new Error("Error al registrar el canje: " + error.message);
        }
    }

    static getDescuentosByUsuario(idUsuario) {
        const db = getConnection();
        this.initStatements(db);
        return this.#getByUsuarioStmt.all({ idUsuario });
    }

    static getDescuentoUsuario(idUsuario, idDescuento) {
        const db = getConnection();
        this.initStatements(db);
        return this.#getByUsuarioDescuentoStmt.get({ idUsuario, idDescuento });
    }
}
