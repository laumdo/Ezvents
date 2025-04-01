/*import express from 'express';
import multer from 'multer';
import{ viewDescuentos, agregarDescuento,eliminarDescuento,modificarDescuento} from './controllers.js';

const descuentosRouter=express.Router();

const storage=multer.diskStorage({
    destination: 'static/img/',
    filename: (req, file, cb)=>{
        cb(null,Date.now() + '-' +file.originalname);
    }
});

const upload=multer({storage});

descuentosRouter.post('/agregarDescuento', upload.single('imagen'),agregarDescuento);

descuentosRouter.get('/', viewDescuentos);

descuentosRouter.post('/eliminarDescuento', eliminarDescuento);

descuentosRouter.post('/modificarDescuento', modificarDescuento);

export default descuentosRouter;*/
import express from 'express';
import multer from 'multer';
import { viewDescuentos, agregarDescuento, eliminarDescuento, modificarDescuento } from './controllers.js';
import { autenticado } from '../middleware/auth.js';
import asyncHandler from 'express-async-handler';

const descuentosRouter = express.Router();

const storage = multer.diskStorage({
    destination: 'static/img/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

descuentosRouter.get('/', autenticado(), asyncHandler(viewDescuentos));

descuentosRouter.post('/agregarDescuento', 
    autenticado(), 
    upload.single('imagen'), 
    asyncHandler(agregarDescuento)
);

descuentosRouter.post('/eliminarDescuento', 
    autenticado(), 
    asyncHandler(eliminarDescuento)
);

descuentosRouter.post('/modificarDescuento', 
    autenticado(), 
    asyncHandler(modificarDescuento)
);

export default descuentosRouter;
