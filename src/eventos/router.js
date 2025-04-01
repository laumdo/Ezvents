import express from 'express';
//import multer from 'multer';
import { viewEventos, viewEvento, agregarEvento, eliminarEvento, modificarEvento,buscarEvento/*, comprarEntrada */} from './controllers.js';


const eventosRouter = express.Router();

/*const storage = multer.diskStorage({
    destination: 'static/img/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); 
    }
}); 

const upload = multer({ storage });*/

//eventosRouter.post('/agregarEvento', upload.single('imagen'), agregarEvento);

eventosRouter.get('/', viewEventos);

eventosRouter.get('/buscarEvento', buscarEvento);


eventosRouter.get('/:id', viewEvento);


eventosRouter.post('/eliminarEvento', eliminarEvento);


eventosRouter.post('/modificarEvento', modificarEvento);




export default eventosRouter;
