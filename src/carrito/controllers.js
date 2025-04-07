import { Carrito } from './Carrito.js';
import { Evento } from '../eventos/Evento.js';

export function verCarrito(req, res) {
    const usuario_id = req.session.usuario_id;
    const entradas = Carrito.getCarrito(usuario_id);

    const carrito = [];
    let precioTotal = 0;

    for (const entrada of entradas) {
        const evento = Evento.getEventoById(entrada.id_evento);
        if (evento) {
            carrito.push({
            id: evento.id,  // Asegúrate de que el id esté disponible
            nombre: evento.nombre,
            precio: evento.precio,
            cantidad: entrada.cantidad
            });
            precioTotal += (evento.precio * entrada.cantidad);
        }
    }

    res.render('pagina', { contenido: 'paginas/carrito', session: req.session, carrito, precioTotal });
}

export function agregarAlCarrito(req, res) {
    try {
        console.log("Contenido de req.session:", req.session);

        const id_evento = req.body.id_evento;
        const precio = req.body.precio;

        const id_usuario = req.session.usuario_id ? req.session.usuario_id : null;
        console.log("Usuario ID:", id_usuario); // 🛠 Verificar si el usuario está definido
        console.log("Evento ID:", id_evento); // 🛠 Verificar si el usuario está definido
    if (!id_usuario) {
        return res.render('pagina', { contenido: 'paginas/error', mensaje: 'Debes iniciar sesión para agregar al carrito' });
    }

    Carrito.agregarEvento(id_usuario, id_evento, precio);
    res.redirect('/');

    } catch (error) {
        console.log(error);
        res.render('pagina', { contenido: 'paginas/error', mensaje: 'Error al agregar evento al carrito' });
    }
}

export function eliminarDelCarrito(req, res) {
    try {
        const { id_evento } = req.body;
        console.log("id_evento recibido:", id_evento);
        const id_usuario = req.session.usuario_id ? req.session.usuario_id : null;

        Carrito.deleteByEvent(id_usuario, id_evento);

        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.status(500).render('pagina', { contenido: 'paginas/error', mensaje: 'Error al eliminar evento del carrito' });
    }
}

export function actualizarCantidadCarrito(req, res) {
    try {
        const id_usuario = req.session.usuario_id;
        const { id_evento, accion } = req.body;

        const carritoActual = Carrito.getCarrito(id_usuario);
        const item = carritoActual.find(e => e.id_evento == id_evento);

        if (!item) return res.redirect('/carrito');

        if (accion === 'sumar') {
            Carrito.actualizarCantidad(id_usuario, id_evento, 1);
        } else if (accion === 'restar' && item.cantidad > 1) {
            Carrito.actualizarCantidad(id_usuario, id_evento, 0);
        }


        res.redirect('/carrito');
    } catch (error) {
        console.error(error);
        res.render('pagina', { contenido: 'paginas/error', mensaje: 'Error al actualizar cantidad' });
    }
}
