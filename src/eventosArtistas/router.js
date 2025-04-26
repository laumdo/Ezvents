import express from 'express';
import { viewCartelera, viewEventosDelArtista, agregarArtistaAEvento, eliminarArtistaEvento} from './controllers.js';

const eventosArtistasRouter = express.Router();

eventosArtistasRouter.get('/cartelera', viewCartelera);
eventosArtistasRouter.get('/asistencias', viewEventosDelArtista);
eventosArtistasRouter.post('/agregar', agregarArtistaAEvento);
eventosArtistasRouter.post('/eliminar', eliminarArtistaEvento);


export default eventosArtistasRouter;