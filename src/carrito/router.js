import express from 'express';
import { verCarrito, agregarAlCarrito, eliminarDelCarrito } from '../controllers/CarritoController.js';

const carritoRouter = express.Router();

carritoRouter.get('/', verCarrito);
carritoRouter.post('/agregar', agregarAlCarrito);
carritoRouter.post('/eliminar', eliminarDelCarrito);
const express = require('express');
const router = express.Router();

// Ruta para agregar un evento al carrito
router.post('/agregar', (req, res) => {
    const eventoId = req.body.eventoId;  // Obtener el ID del evento enviado por el formulario
    if (!req.session.carrito) {
        req.session.carrito = []; // Si no existe el carrito, lo inicializamos
    }
    
    // Verificar si el evento ya está en el carrito
    if (!req.session.carrito.some(evento => evento.id === eventoId)) {
        req.session.carrito.push({ id: eventoId });
    }

    // Redirigir al carrito
    res.redirect('/eventos/carrito');
});

module.exports = router;


export default carritoRouter;
