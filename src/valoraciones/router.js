import express from 'express';
import { anadirValoracion, viewValoraciones, viewValorar } from './controllers.js';

const valoracionesRouter = express.Router();

valoracionesRouter.get('/valoraciones/:id_evento', viewValoraciones);
valoracionesRouter.post('/anadir', anadirValoracion);
valoracionesRouter.get('/valorar/:id_evento', viewValorar);


export default valoracionesRouter;

