import { Evento } from "../eventos/Evento.js";
import { EventoArtista } from './EventoArtista.js';
import { flashMessages } from '../middleware/flash.js';

export function viewCartelera(req, res){
    const id_evento = req.body.id_evento;
    const artistas = EventoArtista.getEntradasByUsuario(id_evento);

    const cartelera = [];

    for (const uno of artistas) {
        const artista = Artista.getArtistaById(uno.idArtista);
        if (artista) {
            cartelera.push({
                id: artista.id,
                nombre: artista.nombre
            });
        }
    }

    res.render('pagina', {contenido: 'paginas/entradas', session: req.session, cartelera});
}

export function viewEventosDelArtista(req, res){
    const id_artista = req.body.id_artista;
    const eventos = EventoArtista.getEntradasByUsuario(id_artista);

    const asistencias = [];

    for (const evento of eventos) {
        const asiste = Evento.getEventById(evento.idEvento);
        if (asiste) {
            asistencias.push({
                id: asiste.id,
                nombre: asiste.nombre
            });
        }
    }

    res.render('pagina', {contenido: 'paginas/entradas', session: req.session, asistencias});
}



export function agregarArtistaAEvento(req, res){
    const id_artista = req.body.id_artista;
    const id_evento = req.body.id_evento;

    EventoArtista.añadirArtista(id_artista, id_evento);
    res.setFlash('Artista añadido al evento.');
    res.redirect('/');
}