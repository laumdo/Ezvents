import { matchedData, validationResult } from 'express-validator';
import { Foro } from './Foro.js';
import { render } from '../utils/render.js';

export function mostrarForo(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return render(req, res, 'paginas/error', {
            mensaje: 'ID del evento inválido',
            errores: result.mapped()
        });
    }

    const { id } = matchedData(req);
    const mensajes = Foro.getMensajesByEvento(id);

    render(req, res, 'paginas/foro', {
        session: req.session,
        mensajes,
        evento_id: id
    });
}

export function viewForoError(res, mensaje, errores = {}) {
    return render(null, res, 'paginas/error', {
        mensaje,
        errores
    });
}

export function agregarMensaje(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return viewForoError(res, 'Datos del mensaje no válidos', errores);
    }

    const { contenido, parent_id, idEvento } = matchedData(req);
    const usuario = req.session.usuario;


    const contenidoLimpio = contenido.trim();
    if (!contenidoLimpio) {
        return viewForoError(res, 'El contenido del mensaje no puede estar vacío');
    }

    Foro.insertMensaje(usuario, contenidoLimpio, idEvento, parent_id || null);
    res.redirect(`/foro/${idEvento}`);
}

export function eliminarMensaje(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return viewForoError(res, 'Datos inválidos para eliminar el mensaje', errores);
    }

    try {
        const { idMensaje, idEvento } = matchedData(req);
        Foro.borrarMensaje(idMensaje);
        res.redirect(`/foro/${idEvento}`);
    } catch (error) {
        return viewForoError(res, 'Error al eliminar el mensaje del foro');
    }
}
