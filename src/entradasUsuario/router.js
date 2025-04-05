import express from 'express';
import {viewEntradas, viewComprar, comprar} from './controller.js';

const entradasRouter = express.Router();

entradasRouter.get('/viewEntradas', viewEntradas);

entradasRouter.get('/comprar', viewComprar);

entradasRouter.post('/comprar', comprar);

export default entradasRouter;