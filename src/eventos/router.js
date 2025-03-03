import express from 'express';
import { viewEventos, viewEvento, comprarEntrada } from './controllers.js';

const eventosRouter = express.Router();

// Mostrar la lista de eventos
eventosRouter.get('/', viewEventos);

// Ver detalles de un evento específico
eventosRouter.get('/:id', viewEvento);

// Comprar una entrada para un evento
eventosRouter.post('/:id/comprar', comprarEntrada);

export default eventosRouter;
