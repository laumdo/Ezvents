import { Valoraciones } from './Valoracion.js';
import { Evento } from '../eventos/Evento.js';

export function viewValoraciones(req, res){
    const { id_evento } = req.params;
    const evento = Evento.getEventoById(id_evento);
    const valoraciones = Valoraciones.getValoracionByEvent(id_evento);
    let media = 0;
    if (valoraciones.length > 0) {
        const suma = valoraciones.reduce((acc, v) => acc + v.puntuacion, 0);
         media = (suma / valoraciones.length).toFixed(1);
    }
    res.render('pagina', { 
        contenido: 'paginas/valoraciones', 
        session: req.session, valoraciones, evento, media });
}

export function anadirValoracion(req, res){
    try {
        const { id_evento, puntuacion, comentario } = req.body;
        const id_usuario = req.session && req.session.usuario_id;
        const nuevaValoracion = new Valoraciones(null, id_evento, id_usuario, puntuacion, comentario, new Date());
        nuevaValoracion.persist();
        res.redirect('/eventos/pasados');
    } catch (err) {
        console.error("Error al añadir valoración:", err);
        res.status(500).send("Error interno al guardar valoración");
    }
}

export function viewValorar(req, res){
    const { id_evento } = req.params;
    const evento = Evento.getEventoById(id_evento);
    res.render('pagina', { 
        contenido: 'paginas/valorar', session: req.session, evento});
}