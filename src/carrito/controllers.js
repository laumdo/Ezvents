import { Carrito } from './Carrito.js';

export function verCarrito(req, res) {
    const carrito = Carrito.getCarrito();
    res.render('pagina', { contenido: 'paginas/carrito', session: req.session, carrito });
}

export function agregarAlCarrito(req, res) {
    try {
        const { id } = req.body.id.trim();

        Carrito.agregarEvento({ id });

        res.render('pagina', { contenido: '/', session: req.session })

    } catch (error) {
        res.render('pagina', { contenido: 'paginas/error', mensaje: 'Error al agregar evento al carrito' });
    }
}

export function eliminarDelCarrito(req, res) {
    try {
        const { id } = req.body;

        Carrito.eliminarEvento(id);

        res.render('pagina', { contenido: 'paginas/carrito', session: req.session, mensaje: 'Evento eliminado del carrito' });
    } catch (error) {
        res.status(500).render('pagina', { contenido: 'paginas/error', mensaje: 'Error al eliminar evento del carrito' });
    }
}
