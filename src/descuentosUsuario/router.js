import express from "express";
import { obtenerDescuentosUsuario, verPerfil } from "./controllers.js";
import { autenticado } from '../middleware/auth.js';

const router = express.Router();

router.get('/perfil', autenticado(), verPerfil);
router.get("/misDescuentos", obtenerDescuentosUsuario);

export default router;

