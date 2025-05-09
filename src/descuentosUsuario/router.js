import express from "express";
import { obtenerDescuentosUsuario, verPerfil } from "./controllers.js";
import { autenticado } from '../middleware/auth.js';
import asyncHandler from "express-async-handler";

const router = express.Router();

router.get('/perfil',
    autenticado(), 
    asyncHandler(verPerfil)
);
router.get('/misDescuentos', obtenerDescuentosUsuario);

export default router;

