import { MensajeForo } from './foro.js';

export function verForo(req, res) {
    const { id } = req.params;
    const mensajes = MensajeForo.obtenerMensajesPorEvento(id);
    res.render('pagina', { contenido: 'paginas/foro', session: req.session, mensajes, evento_id: id });
}

export function agregarMensaje(req, res) {
    const { id, mensaje } = req.body;
    const usuario = req.session.usuario || 'Anónimo';
    MensajeForo.agregarMensaje(id, usuario, mensaje);
    res.redirect(`/foro/${id}`);
}