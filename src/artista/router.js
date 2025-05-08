import express from "express";
import { param, body } from 'express-validator';
import { viewArtistas, viewArtista, agregarArtista, modificarArtista, eliminarArtista } from "./controllers.js";

const artistasRouter = express.Router();

artistasRouter.get("/", viewArtistas);
artistasRouter.get("/:id"
    , param('id', 'El id debe ser un número entero').isInt(),
    viewArtista
);

artistasRouter.post("/agregarArtista"
    , body('nombreArtistico', 'El nombre artistico no puede ser vacío').trim().notEmpty()
    , body('nombre', 'El nombre no puede ser vacío').trim().notEmpty()
    , body('nombre', 'El nombre no puede contener números').isAlpha()
    , body('biografia', 'La biografía no puede ser vacía').trim().notEmpty()
    , body('nacimiento', 'La fecha de nacimiento no puede ser vacía').trim().notEmpty()
    , body('genero', 'El género no puede ser vacío').trim().notEmpty()
    , body('canciones', 'Las canciones no pueden ser vacías').trim().notEmpty()
    , agregarArtista
);

artistasRouter.post("/modificarArtista"
    , body('id', 'El id no puede ser vacío').trim().notEmpty()
    , body('id', 'El id debe ser un número entero').isInt()
    , body("nombreArtistico").optional().trim()
    , body("nombre").optional().trim()
    , body("biografia").optional().trim()
    , body("nacimiento").optional().trim()
    , body("genero").optional().trim()
    , body("canciones").optional().trim()
    , modificarArtista
);

artistasRouter.post("/eliminarArtista"
    , body('id', 'El id no puede ser vacío').trim().notEmpty()
    , body('id', 'El id debe ser un número entero').isInt()
    , eliminarArtista
);

export default artistasRouter;