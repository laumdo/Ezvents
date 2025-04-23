import { DescuentosUsuario } from "./DescuentosUsuario.js";
import { Usuario } from "../usuarios/Usuario.js";

export function verPerfil(req, res) {
    try {
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        const descuentos = DescuentosUsuario.obtenerPorUsuario(usuario.id);

        res.render('pagina', {
            contenido: 'paginas/datos',
            session: req.session,
            usuario: usuario,
            descuentosUsuario: descuentos 
        });
    } catch (error) {
        res.status(500).render('pagina', {
            contenido: 'paginas/error',
            mensaje: "Error al cargar perfil"
        });
    }
}


export function obtenerDescuentosUsuario(req, res) {
    try {
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        const descuentos = DescuentosUsuario.getDescuentosByUsuario(usuario.id);
        
        return res.json({ success: true, descuentos });
    } catch (error) {
        return res.json({ success: false, message: "Error al obtener descuentos." });
    }
}
