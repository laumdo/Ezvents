import express from 'express';
import { viewCartelera, viewEventosDelArtista, agregarArtistaAEvento, viewContratar, eliminarArtistaEvento} from './controllers.js';

const eventosArtistasRouter = express.Router();

eventosArtistasRouter.get('/cartelera/:id_evento', viewCartelera);
eventosArtistasRouter.get('/asistencias/:id_artista', viewEventosDelArtista);
eventosArtistasRouter.get('/viewContratar/:id_evento', viewContratar);
eventosArtistasRouter.post('/agregar', agregarArtistaAEvento);
eventosArtistasRouter.post('/eliminar', eliminarArtistaEvento);


export default eventosArtistasRouter;