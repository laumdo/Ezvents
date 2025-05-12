import express from 'express';
import multer from 'multer';
import {
  viewDescuentos,
  agregarDescuento,
  eliminarDescuento,
  modificarDescuento,
  canjearDescuento
} from './controllers.js';
import { autenticado } from '../middleware/auth.js';
import { body } from 'express-validator';
import asyncHandler from 'express-async-handler';

const descuentosRouter = express.Router();


const storage = multer.diskStorage({
  destination: 'static/img/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Rutas
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
  upload.single('imagen'), 
  asyncHandler(modificarDescuento)
);

descuentosRouter.post("/canjear/:id",
  asyncHandler(canjearDescuento)
);

export default descuentosRouter;
