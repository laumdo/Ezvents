import express from "express";
import { canjearDescuento, obtenerDescuentosUsuario } from "./controllers.js";

const router = express.Router();

router.post("/canjear/:id", canjearDescuento);
router.get("/misDescuentos", obtenerDescuentosUsuario);

export default router;
