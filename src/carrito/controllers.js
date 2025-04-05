import { Carrito } from './Carrito.js';

export function verCarrito(req, res) {
    const carrito = Carrito.getCarrito();
    res.render('pagina', { contenido: 'paginas/carrito', session: req.session, carrito });
}

export function agregarAlCarrito(req, res) {
    try {
        console.log("Contenido de req.session:", req.session);

        const id = req.body.id.trim();

        const id_usuario = req.session.usuario_id ? req.session.usuario_id : null;
        console.log("Usuario ID:", id_usuario); // 🛠 Verificar si el usuario está definido

    if (!id_usuario) {
        return res.render('pagina', { contenido: 'paginas/error', mensaje: 'Debes iniciar sesión para agregar al carrito' });
    }

    Carrito.agregarEvento(id_usuario, id);
    res.redirect('/');

    } catch (error) {
        console.log(error);
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
