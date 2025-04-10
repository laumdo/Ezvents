import express from 'express';
import { viewEventos, viewEvento, agregarEvento, eliminarEvento, modificarEvento,buscarEvento} from './controllers.js';


const eventosRouter = express.Router();

eventosRouter.get('/', viewEventos);

eventosRouter.get('/buscarEvento', buscarEvento);

eventosRouter.get('/agregarEvento', agregarEvento)


eventosRouter.get('/:id', viewEvento);


eventosRouter.post('/eliminarEvento', eliminarEvento);


eventosRouter.post('/modificarEvento', modificarEvento);




export default eventosRouter;
