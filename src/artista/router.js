import express from "express";
import { viewArtistas, viewArtista, agregarArtista, modificarArtista, eliminarArtista } from "./controllers.js";

const artistasRouter = express.Router();

//CAMBIAR MUCHAS COSAS DE EXPRESS VALIDATOR

artistasRouter.get("/", viewArtistas);
artistasRouter.get("/:id", viewArtista);
artistasRouter.post("/agregarArtista", agregarArtista);
artistasRouter.post("/modificarArtista", modificarArtista);
artistasRouter.post("/eliminarArtista", eliminarArtista);

export default artistasRouter;