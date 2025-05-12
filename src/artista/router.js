import express from "express";
import { param, body } from 'express-validator';
import { viewArtistas, viewArtista, agregarArtista, modificarArtista, eliminarArtista } from "./controllers.js";
import { autenticado, tieneRol } from "../middleware/auth.js";

const artistasRouter = express.Router();

artistasRouter.get("/", viewArtistas);
artistasRouter.get("/:id"
    , param('id', 'El id debe ser un número entero').isInt(),
    viewArtista
);

artistasRouter.post("/agregarArtista"
    , autenticado()
    , tieneRol()
    , body('nombreArtistico', 'El nombre artistico no puede ser vacío').trim().notEmpty()
    , body('nombre', 'El nombre no puede ser vacío').trim().notEmpty()
    , body('nombre', 'El nombre no puede contener números').matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    , body('biografia', 'La biografía no puede ser vacía').trim().notEmpty()
    , body('nacimiento', 'La fecha de nacimiento no puede ser vacía').trim().notEmpty()
    , body('nacimiento', 'La fecha de nacimiento no es válida').isDate()
    , body('genero', 'El género no puede ser vacío').trim().notEmpty()
    , body('genero', 'El género no puede contener números').isAlpha()
    , body('canciones', 'Las canciones no pueden ser vacías').trim().notEmpty()
    , agregarArtista
);

artistasRouter.post("/modificarArtista"
    , autenticado()
    , tieneRol()
    , body('id', 'El id no puede ser vacío').trim().notEmpty()
    , body('id', 'El id debe ser un número entero').isInt()
    , body('nombreArtistico').optional({ checkFalsy: true }).trim()
    , body('nombre', 'El nombre no puede contener números').optional({ checkFalsy: true }).trim().matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    , body('biografia').optional({ checkFalsy: true }).trim()
    , body('nacimiento').optional({ checkFalsy: true }).trim().isDate()
    , body('genero', 'El género no puede contener números').optional({ checkFalsy: true }).trim().isAlpha()
    , body('canciones').optional({ checkFalsy: true }).trim()
    , modificarArtista
);

artistasRouter.post("/eliminarArtista"
    , autenticado()
    , tieneRol()
    , body('id', 'El id no puede ser vacío').trim().notEmpty()
    , body('id', 'El id debe ser un número entero').isInt()
    , eliminarArtista
);

export default artistasRouter;