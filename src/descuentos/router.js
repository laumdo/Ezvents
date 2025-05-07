import express from 'express';
import multer from 'multer';
import { viewDescuentos, agregarDescuento, eliminarDescuento, modificarDescuento,canjearDescuento } from './controllers.js';
import { body } from 'express-validator';
import asyncHandler from 'express-async-handler';
import { autenticado, tieneRol } from '../middleware/auth.js';
import { RolesEnum } from '../usuarios/Usuario.js';

const descuentosRouter = express.Router();

const storage = multer.diskStorage({
    destination: 'static/img/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

descuentosRouter.get('/', autenticado(), asyncHandler(viewDescuentos));

descuentosRouter.post(
    '/agregarDescuento', 
    autenticado(), 
    tieneRol(RolesEnum.ADMIN),
    upload.single('imagen'),
    body('titulo', 'El título no puede estar vacío').trim().notEmpty(),
    body('titulo', 'El título debe tener como máximo 100 caracteres').isLength({ max: 50 }),
    body('condiciones', 'Las condiciones no pueden estar vacías').trim().notEmpty(),
    body('puntos', 'Los puntos tienen que ser un entero mayor o igual a 0').isInt({ min: 0 }),
    body('interno').optional().isIn(['on']),       // checkbox
    body('valor', 'El valor del descuento debe ser un número').optional({ checkFalsy: true }).isFloat({ min: 0 }),
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

descuentosRouter.post("/canjear/:id", canjearDescuento);


export default descuentosRouter;
