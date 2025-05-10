import { Evento } from "../eventos/Evento.js";
import { EventoArtista } from './EventoArtista.js';
import { Artista } from "../artista/Artista.js";
import { validationResult } from 'express-validator';
import { flashMessages } from '../middleware/flash.js';

export function viewCartelera(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const mensajes = errors.array().map(e => e.msg).join(', ');
        res.setFlash(`Error al ver los artistas del evento: ${mensajes}`);
        return res.redirect('/');
    }

    const id_evento = req.params.id_evento;
    
    const idsArtistas = EventoArtista.getArtistIdsByEvent(id_evento);

    const cartelera = Artista.getArtistasById(idsArtistas);

    res.render('pagina', {contenido: 'paginas/artistas', session: req.session, artistas: cartelera});
}

export function viewEventosDelArtista(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const mensajes = errors.array().map(e => e.msg).join(', ');
        res.setFlash(`Error al ver los eventos del artista: ${mensajes}`);
        return res.redirect('/');
    }

    const id_artista = req.params.id_artista;

    const idsEventos = EventoArtista.getEventsIdsByArtist(id_artista);

    const asistenciasMap = Evento.getEventosById(idsEventos);
    const asistencias = Object.values(asistenciasMap);//Paso el mapa a array
    
    res.render('pagina', {contenido: 'paginas/eventos', session: req.session, eventos: asistencias});
}

export function agregarArtistaAEvento(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const mensajes = errors.array().map(e => e.msg).join(', ');
        res.setFlash(`Error al agregar el artista al evento: ${mensajes}`);
        return res.redirect('/');
    }

    try{
        const id_artista = req.body.id_artista;
        const id_evento = req.body.id_evento;

        const datos = { idArtista: id_artista, idEvento: id_evento };
        const artistaEvento = new EventoArtista(datos);
        artistaEvento.persist();
        
        res.redirect(`/eventosArtistas/viewContratar/${id_evento}`);
    }catch(e){
        res.setFlash('Error al agregar el artista al evento');
        res.redirect('/');
    }
}

export function eliminarArtistaEvento(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const mensajes = errors.array().map(e => e.msg).join(', ');
        res.setFlash(`Error al eliminar al artista del evento: ${mensajes}`);
        return res.redirect('/');
    }

    try{
        const id_artista = req.body.id_artista;
        const id_evento = req.body.id_evento;
        
        EventoArtista.eliminarArtista(id_artista, id_evento);

        res.redirect(`/eventosArtistas/viewContratar/${id_evento}`);
    }catch(e){
        res.setFlash('Error al eliminar el artista del evento');
        res.redirect('/');
    }
}

export function viewContratar(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.setFlash('Error al ver contratar artistas');
        res.redirect('/');
    }

    const id_evento = req.params.id_evento;

    const artistas = Artista.getAll();
    const idsContratados = EventoArtista.getArtistIdsByEvent(id_evento);

    const artistasContratados = [];
    const artistasNoContratados = [];

    for (const artista of artistas) {
        if (idsContratados.includes(artista.id)) {
            artistasContratados.push(artista);
        } else {
            artistasNoContratados.push(artista);
        }
    }

    res.render('pagina', {
        contenido: 'paginas/contratar',
        session: req.session,
        idEvento: id_evento,
        artistas: artistasNoContratados,
        artistasContratados: artistasContratados
    });
}