import express from 'express';
import { param, body } from 'express-validator';
import { viewCartelera, viewEventosDelArtista, agregarArtistaAEvento, viewContratar, eliminarArtistaEvento} from './controllers.js';

const eventosArtistasRouter = express.Router();

eventosArtistasRouter.get('/cartelera/:id_evento',
    param('id_evento').isInt().withMessage('El id del evento debe ser un número entero'),
    viewCartelera
);

eventosArtistasRouter.get('/asistencias/:id_artista',
    param('id_artista').isInt().withMessage('El id del artista debe ser un número entero'),
    viewEventosDelArtista
);

eventosArtistasRouter.get('/viewContratar/:id_evento',
    param('id_evento').isInt().withMessage('El id del evento debe ser un número entero'),
    viewContratar
);

eventosArtistasRouter.post('/agregar', 
    body('id_artista').isInt().withMessage('El id del artista debe ser un número entero'),
    body('id_evento').isInt().withMessage('El id del evento debe ser un número entero'),
    agregarArtistaAEvento
);

eventosArtistasRouter.post('/eliminar',
    body('id_artista').isInt().withMessage('El id del artista debe ser un número entero'),
    body('id_evento').isInt().withMessage('El id del evento debe ser un número entero'),
    eliminarArtistaEvento
);


export default eventosArtistasRouter;