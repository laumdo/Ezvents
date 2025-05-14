import express from 'express';
import { param, body } from 'express-validator';
import { viewCartelera, viewEventosDelArtista, agregarArtistaAEvento, viewContratar, eliminarArtistaEvento, terminar} from './controllers.js';
import { autenticado, tieneAdminEmpresa } from '../middleware/auth.js';

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
    , tieneAdminEmpresa()
    , param('id_evento', 'El id del evento debe ser un número entero').isInt()
    , viewContratar
);

eventosArtistasRouter.post('/agregar'
    , autenticado()
    , tieneAdminEmpresa()
    , body('id_artista', 'El id del artista debe ser un número entero').isInt()
    , body('id_evento', 'El id del evento debe ser un número entero').isInt()
    , agregarArtistaAEvento
);

eventosArtistasRouter.post('/eliminar'
    , autenticado()
    , tieneAdminEmpresa()
    , body('id_artista', 'El id del artista debe ser un número entero').isInt()
    , body('id_evento', 'El id del evento debe ser un número entero').isInt()
    , eliminarArtistaEvento
);

eventosArtistasRouter.post('/terminar'
    , autenticado()
    , tieneAdminEmpresa()
    , terminar
);


export default eventosArtistasRouter;