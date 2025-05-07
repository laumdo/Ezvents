import { escapeXML } from 'ejs';
import { Foro } from './Foro.js';
import { validationResult } from 'express-validator';


export const mostrarForo = (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).render('pagina', {
            contenido: 'paginas/error',
            mensaje: 'ID del evento inválido',
            errores: errores.array()
        });
    }

    const eventoId = parseInt(req.params.id, 10);
    const mensajes = Foro.getMensajesByEvento(eventoId);

    const params = {
        contenido: 'paginas/foro',
        session: req.session,
        mensajes,
        evento_id: eventoId
    };

    res.render('pagina', params);
};

export const agregarMensaje = (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).render('pagina', {
            contenido: 'paginas/error',
            mensaje: 'Datos del mensaje no válidos',
            errores: errores.array()
        });
    }

    const { contenido, parent_id, idEvento } = req.body;
    const usuario = req.session.usuario;

    if (!usuario) {
        return res.redirect('/usuarios/login');
    }

    const parentId = parent_id || null;

    Foro.insertMensaje(usuario, contenido, idEvento, parentId);

    res.redirect(`/foro/${idEvento}`);
};


export const eliminarMensaje = (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).render('pagina', {
            contenido: 'paginas/error',
            mensaje: 'Datos inválidos para eliminar el mensaje',
            errores: errores.array()
        });
    }

    try {
        const { idMensaje, idEvento } = req.body;
        Foro.borrarMensaje(idMensaje);
        res.redirect(`/foro/${idEvento}`);
    } catch (error) {
        res.status(500).render('pagina', {
            contenido: 'paginas/error',
            mensaje: 'Error al eliminar el mensaje del foro'
        });
    }
};

