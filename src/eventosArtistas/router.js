import express from 'express';
import { param, body } from 'express-validator';
import { viewCartelera, viewEventosDelArtista, agregarArtistaAEvento, viewContratar, eliminarArtistaEvento} from './controllers.js';
import { autenticado } from '../middleware/auth.js';

const eventosArtistasRouter = express.Router();//PONER ROL EMPRESA O ADMIN

eventosArtistasRouter.get('/cartelera/:id_evento'
    , param('id_evento', 'El id del evento debe ser un número entero').isInt()
    , viewCartelera
);

eventosArtistasRouter.get('/asistencias/:id_artista'
    , param('id_artista', 'El id del artista debe ser un número entero').isInt()
    , viewEventosDelArtista
);

eventosArtistasRouter.get('/viewContratar/:id_evento'
    , autenticado()
    , param('id_evento', 'El id del evento debe ser un número entero').isInt()
    , viewContratar
);

eventosArtistasRouter.post('/agregar'
    , autenticado()
    , body('id_artista', 'El id del artista debe ser un número entero').isInt()
    , body('id_evento', 'El id del evento debe ser un número entero').isInt()
    , agregarArtistaAEvento
);

eventosArtistasRouter.post('/eliminar'
    , autenticado()
    , body('id_artista', 'El id del artista debe ser un número entero').isInt()
    , body('id_evento', 'El id del evento debe ser un número entero').isInt()
    , eliminarArtistaEvento
);


export default eventosArtistasRouter;