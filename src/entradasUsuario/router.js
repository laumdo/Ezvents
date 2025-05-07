import express from 'express';
import {viewEntradas, viewComprar, comprar} from './controller.js';
import { body } from 'express-validator';
import asyncHandler from 'express-async-handler';

const entradasRouter = express.Router();

entradasRouter.get('/viewEntradas', viewEntradas);

entradasRouter.get('/comprar', viewComprar);

entradasRouter.post('/comprar'
    , body('tarjeta', 'No puede ser vacio').trim().notEmpty()
    , body('tarjeta', 'Debe tener entre 13 y 18 dígitos').trim().matches(/^\d{13,18}$/)
    , body('expiracion', 'No puede ser vacio').trim().notEmpty()
    , body('expiracion', 'El formaato debe ser MM/YY').trim().matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    , body('cvc', 'No puede ser vacio').trim().notEmpty()
    , body('cvc', 'Debe contener exáctamente 3 dígitos').trim().matches(/^\d{3}$/)
    , asyncHandler(comprar));

export default entradasRouter;