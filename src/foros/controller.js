import { Foro } from './Foro.js';

export const mostrarForo = (req, res) => {
    const eventoId = req.params.id;  // Obtener el ID del evento
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
    const { mensaje, parent_id } = req.body;  // Solo se obtiene el contenido del mensaje
    const usuario = req.session.usuario;  // Usamos el usuario de la sesión
    const eventoId = req.body.id;
    const parentId = parent_id || null // si no es una respuesta, es nulo

    // Agregar el mensaje sin parent_id
    Foro.insertMensaje(usuario, mensaje, eventoId, parentId);

    // Redirigir al foro del evento
    res.redirect(`/foro/${eventoId}`);
};

