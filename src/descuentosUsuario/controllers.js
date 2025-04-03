import { DescuentosUsuario } from "./DescuentosUsuario.js";
import { Usuario } from "../usuarios/Usuario.js";


export function obtenerDescuentosUsuario(req, res) {
    try {
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        const descuentos = DescuentosUsuario.getDescuentosByUsuario(usuario.id);
        
        return res.json({ success: true, descuentos });
    } catch (error) {
        return res.json({ success: false, message: "Error al obtener descuentos." });
    }
}
