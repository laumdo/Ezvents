import { Valoraciones } from './Valoracion.js';

export function añadirValoracion(req, res){
    const { id_evento, puntuacion, comentario, fecha } = req.body;
    const id_usuario = req.session.usuario.id;
    const nuevaValoracion = new Valoraciones(null, id_evento, id_usuario, puntuacion, comentario, fecha)
    nuevaValoracion.persist();
    res.redirect('/eventos/pasados');
}
