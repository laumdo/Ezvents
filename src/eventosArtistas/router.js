import express from 'express';
import { viewCartelera, viewEventosDelArtista, agregarArtistaAEvento } from './controllers.js';

const eventosArtistasRouter = express.Router();

eventosArtistasRouter.get('/cartelera', viewCartelera);
eventosArtistasRouter.post('/asistencias', viewEventosDelArtista);
eventosArtistasRouter.post('/agregar', agregarArtistaAEvento);


export default eventosArtistasRouter;