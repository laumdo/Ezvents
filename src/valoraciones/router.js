import express from 'express';
import { añadirValoracion } from './controllers.js';

const valoracionesRouter = express.Router();


valoracionesRouter.post('/añadir', añadirValoracion);


export default valoracionesRouter;

