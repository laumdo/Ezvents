import express from "express";
import { obtenerDescuentosUsuario } from "./controllers.js";

const router = express.Router();

router.get("/misDescuentos", obtenerDescuentosUsuario);

export default router;
