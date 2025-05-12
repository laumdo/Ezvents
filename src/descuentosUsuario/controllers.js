import { DescuentosUsuario } from "./DescuentosUsuario.js";
import { Usuario } from "../usuarios/Usuario.js";

export function verPerfil(req, res) {
    try {
        const usuarioId = req.session.usuario_id;
        if (!usuarioId) {
            const err = new Error("Usuario no autenticado");
            err.statusCode = 401;
            throw err;
        }

        const usuario = Usuario.getById(usuarioId);
        const descuentos = DescuentosUsuario.obtenerPorUsuario(usuarioId);

        return render(req, res, 'paginas/datos', {
            session: req.session,
            usuario,
            descuentosUsuario: descuentos
        });

    } catch (error) {
        const status = error.statusCode || 500;
        return res
          .status(status)
          .render('pagina', {
            contenido: 'paginas/error',
            session: req.session,
            mensaje: error.message || "Error al cargar perfil"
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