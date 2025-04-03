import { DescuentosUsuario } from "./DescuentosUsuario.js";
import { Descuento } from "../descuentos/Descuento.js";
import { Usuario } from "../usuarios/Usuario.js";
import crypto from "crypto";

export function canjearDescuento(req, res) {
    try {
        const descuento = Descuento.getDescuento(req.params.id);
        const usuario = Usuario.getUsuarioByUsername(req.session.username);

        if (!descuento) {
            return res.json({ success: false, message: "Descuento no encontrado." });
        }

        if (usuario.puntos < descuento.puntos) {
            return res.json({ success: false, message: "No tienes suficientes puntos." });
        }

        // Generar un código único
        const codigo = crypto.randomBytes(6).toString("hex").toUpperCase();

        // Registrar el canje en la base de datos
        DescuentosUsuario.canjearDescuento(usuario.id, descuento.id, codigo);

        // Restar los puntos al usuario
        usuario.puntos -= descuento.puntos;
        usuario.persist();

        return res.json({ success: true, message: `¡Descuento canjeado! Código: ${codigo}` });
    } catch (error) {
        console.error("Error al canjear descuento:", error);
        return res.json({ success: false, message: "Error al procesar el canjeo." });
    }
}

export function obtenerDescuentosUsuario(req, res) {
    try {
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        const descuentos = DescuentosUsuario.getDescuentosByUsuario(usuario.id);
        
        return res.json({ success: true, descuentos });
    } catch (error) {
        console.error("Error al obtener los descuentos del usuario:", error);
        return res.json({ success: false, message: "Error al obtener descuentos." });
    }
}
