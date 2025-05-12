import { Evento } from "../eventos/Evento.js";
import { EventoArtista } from './EventoArtista.js';
import { Artista } from "../artista/Artista.js";
import { flashMessages } from '../middleware/flash.js';

export function viewCartelera(req, res){
    const id_evento = req.query.id_evento;
    const artistas = EventoArtista.getArtistsByEvent(id_evento);

    const cartelera = [];

    for (const uno of artistas) {
        const artista = Artista.getArtistaById(uno.idArtista);
        if (artista) {
            cartelera.push(artista);
        }
    }

    res.render('pagina', {contenido: 'paginas/artistas', session: req.session, artistas: cartelera});
}

export function viewEventosDelArtista(req, res){
    const id_artista = req.query.id_artista;
    const eventos = EventoArtista.getEventsByArtist(id_artista);

    const asistencias = [];

    for (const evento of eventos) {
        const asiste = Evento.getEventoById(evento.idEvento);
        if (asiste) {
            asistencias.push(asiste);
        }
    }

    res.render('pagina', {contenido: 'paginas/eventos', session: req.session, eventos: asistencias});
}



export function agregarArtistaAEvento(req, res){
    try{
        const id_artista = req.body.id_artista;
        const id_evento = req.body.id_evento;

        console.log("Se mete en agregar artista evento, id_artista: ", id_artista);
        console.log("id_evento: ", id_evento);

        
        EventoArtista.agregarArtista(id_artista, id_evento);
        req.session.id_evento = id_evento;
        res.redirect('/eventosArtistas/viewContratar');
    }catch(e){
        res.render('pagina', { contenido: 'paginas/error', mensaje: e });
    }
}

export function eliminarArtistaEvento(req, res){
    try{
        const id_artista = req.body.id_artista;
        const id_evento = req.body.id_evento;
        
        EventoArtista.eliminarArtista(id_artista, id_evento);

        req.session.id_evento = id_evento;
        res.redirect('/eventosArtistas/viewContratar');
    }catch(e){
        res.render('pagina', { contenido: 'paginas/error', mensaje: e });
    }
}

export function viewContratar(req, res){
    const id_evento = req.session.id_evento;

    const artistas = Artista.getAll();
    const artistasNoContratados = [];
    const artistasContratados = [];

    for (const artista of artistas) {
        const contratado = EventoArtista.contratado(artista.id, id_evento);
        if (contratado) {
            artistasContratados.push(artista);
        }else{
            artistasNoContratados.push(artista)
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