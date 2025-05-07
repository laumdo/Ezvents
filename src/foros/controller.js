import { matchedData, validationResult } from 'express-validator';
import { Foro } from './Foro.js';
import { render } from '../utils/render.js';

export const mostrarForo = (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return render(req, res, 'paginas/error', {
            mensaje: 'ID del evento inválido',
            errores: errores.mapped()
        });
    }

    const eventoId = parseInt(req.params.id, 10);
    const mensajes = Foro.getMensajesByEvento(eventoId);

    return render(req, res, 'paginas/foro', {
        mensajes,
        evento_id: eventoId,
        session: req.session
    });
};

export const agregarMensaje = (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        const datos = matchedData(req, { includeOptionals: true });
        return render(req, res, 'paginas/error', {
            mensaje: 'Datos del mensaje no válidos',
            errores: errores.mapped(),
            datos
        });
    }

    const { contenido, parent_id, idEvento } = matchedData(req, { includeOptionals: true });
    const usuario = req.session.usuario;

    if (!usuario) {
        return res.redirect('/usuarios/login');
    }

    const contenidoLimpio = contenido.trim();
    if (!contenidoLimpio) {
        return render(req, res, 'paginas/error', {
            mensaje: 'El contenido del mensaje no puede estar vacío.'
        });
    }

    const parentId = parent_id ? parseInt(parent_id, 10) : null;

    Foro.insertMensaje(usuario, contenidoLimpio, idEvento, parentId);

    return res.redirect(`/foro/${idEvento}`);
};

export const eliminarMensaje = (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return render(req, res, 'paginas/error', {
            mensaje: 'Datos inválidos para eliminar el mensaje',
            errores: errores.mapped()
        });
    }

    try {
        const { idMensaje, idEvento } = matchedData(req);
        Foro.borrarMensaje(idMensaje);
        return res.redirect(`/foro/${idEvento}`);
    } catch (error) {
        return render(req, res, 'paginas/error', {
            mensaje: 'Error al eliminar el mensaje del foro'
        });
    }
};
