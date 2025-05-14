import { Valoraciones } from './Valoracion.js';
import { Evento } from '../eventos/Evento.js';
import { Usuario } from '../usuarios/Usuario.js';
import { validationResult } from 'express-validator';

export function viewValoraciones(req, res){
    const { id_evento } = req.params;
    const evento = Evento.getEventoById(id_evento);
    const valoracion = Valoraciones.getValoracionByEvent(id_evento);
    let media = 0;
    if (valoracion.length > 0) {
        const suma = valoracion.reduce((acc, v) => acc + v.puntuacion, 0);
         media = (suma / valoracion.length).toFixed(1);
    }
    const valoraciones = valoracion.map(v => {
        const usuario = Usuario.getUsuarioById(v.id_usuario);
        return {
            ...v,
            nombre: usuario.nombre
        };
    });
    res.render('pagina', { 
        contenido: 'paginas/valoraciones', 
        session: req.session, valoraciones, evento, media });
}

export function anadirValoracion(req, res) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).render('pagina', {
            contenido: 'paginas/valorar',
            session: req.session,
            evento: Evento.getEventoById(req.body.id_evento),
            errores: errores.array()
        });
    }

    try {
        const { id_evento, puntuacion, comentario } = req.body;
        const id_usuario = req.session && req.session.usuario_id;

        const nuevaValoracion = new Valoraciones(
            null,
            parseInt(id_evento),
            id_usuario,
            parseInt(puntuacion),
            comentario,
            new Date()
        );

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