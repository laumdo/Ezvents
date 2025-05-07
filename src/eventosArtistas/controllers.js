import { Evento } from "../eventos/Evento.js";
import { EventoArtista } from './EventoArtista.js';
import { Artista } from "../artista/Artista.js";
import { flashMessages } from '../middleware/flash.js';

export function viewCartelera(req, res){
    const id_evento = req.query.id_evento;
    console.log("id_evento: ", id_evento);
    const artistas = EventoArtista.getArtistsByEvent(id_evento);

    console.log("artistas: ", artistas);
    
    const idsArtistas = artistas.map(artista => artista.idArtista);

    const cartelera = Artista.getArtistasById(idsArtistas);
    console.log("cartelera: ", cartelera);

    res.render('pagina', {contenido: 'paginas/artistas', session: req.session, artistas: cartelera});
}

export function viewEventosDelArtista(req, res){
    const id_artista = req.query.id_artista;
    const eventos = EventoArtista.getEventsByArtist(id_artista);

    const idsEventos = eventos.map(evento => evento.idEvento);

    const asistenciasMap = Evento.getEventosById(idsEventos);
    const asistencias = Object.values(asistenciasMap);
    
    res.render('pagina', {contenido: 'paginas/eventos', session: req.session, eventos: asistencias});
}

export function agregarArtistaAEvento(req, res){
    try{
        const id_artista = req.body.id_artista;
        const id_evento = req.body.id_evento;

        const datos = { idArtista: id_artista, idEvento: id_evento };
        const artistaEvento = new EventoArtista(datos);
        artistaEvento.persist();
        
        res.redirect(`/eventosArtistas/viewContratar/${id_evento}`);
    }catch(e){
        res.render('pagina', { contenido: 'paginas/error', mensaje: e });
    }
}

export function eliminarArtistaEvento(req, res){
    try{
        const id_artista = req.body.id_artista;
        const id_evento = req.body.id_evento;
        
        EventoArtista.eliminarArtista(id_artista, id_evento);

        res.redirect(`/eventosArtistas/viewContratar/${id_evento}`);
    }catch(e){
        res.render('pagina', { contenido: 'paginas/error', mensaje: e });
    }
}

export function viewContratar(req, res){//Cambiar, hace N+1 con lo de contratado
    const id_evento = req.params.id_evento;

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