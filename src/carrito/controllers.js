import { Carrito } from './Carrito.js';
import { Evento } from '../eventos/Evento.js';
import { matchedData, validationResult } from 'express-validator';
import { DescuentosUsuario } from '../descuentosUsuario/DescuentosUsuario.js';

export async function verCarrito(req, res) {
    const usuario    = Usuario.getUsuarioByUsername(req.session.username);
    const usuario_id = usuario.id;
    const entradas = Carrito.getCarrito(id_usuario);
    const id = entradas.map(e => e.id_evento);
    const eventos = Evento.getEventoById(id);

    const carrito = [];
    let precioTotal = 0;

    for (const entrada of entradas) {
        const evento = eventos.find(ev => ev.id === entrada.id_evento);
        if (evento) {
            const cantidad = entrada.cantidad;
            const subtotal = evento.precio * cantidad;
            carrito.push({
                id: evento.id,
                nombre: evento.nombre,
                precio: evento.precio,
                cantidad,
                imagen: evento.imagen
            });
            precioTotal += subtotal;
        }
    }

    precioTotal = Math.round(precioTotal * 100) / 100;

    const todosDescuentos=DescuentosUsuario.obtenerPorUsuario(usuario_id);

    const descuentosInternos=todosDescuentos.filter(c=>c.interno===1);
    const cuponAplicado    = req.session.appliedCoupon||null;
    let descuentoAplicado = 0;
    if(cuponAplicado){
        descuentoAplicado=precioTotal*cuponAplicado.valor;
    }

    res.render('pagina', { 
        contenido: 'paginas/carrito', 
        session: req.session, 
        carrito, 
        precioTotal,
        descuentosInternos,
        cuponAplicado,
        descuentoAplicado
     });
}

export function agregarAlCarrito(req, res) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'Datos no válidos' });
    }

    const { id_evento, precio } = matchedData(req);

    const id_usuario = req.session.usuario_id;
    if (!id_usuario) {
        res.redirect("../usuarios/login");
    }

    try {
        Carrito.agregarEvento(id_usuario, id_evento, precio);
        res.setFlash('Evento añadido al carrito.');
        res.redirect('/');
    } catch (error) {
        res.status(500).render('pagina', { contenido: 'paginas/error', mensaje: 'Error al agregar evento al carrito' });
    }
}

export function eliminarDelCarrito(req, res) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'Datos no válidos' });
    }

    const { id_evento } = matchedData(req);
    const id_usuario = req.session.usuario_id;

    if (!id_usuario) {
        return res.status(401).render('pagina', { contenido: 'paginas/error', mensaje: 'Debes iniciar sesión' });
    }

    try {
        Carrito.deleteByEvent(id_usuario, id_evento);
        res.setFlash('Evento eliminado del carrito.');
        res.redirect('/');
    } catch (error) {
        res.status(500).render('pagina', { contenido: 'paginas/error', mensaje: 'Error al eliminar evento del carrito' });
    }
}

export function actualizarCantidadCarrito(req, res) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'Datos no válidos' });
    }

    const { id_evento, accion } = matchedData(req);
    const id_usuario = req.session.usuario_id;

    if (!id_usuario) {
        return res.status(401).render('pagina', { contenido: 'paginas/error', mensaje: 'Debes iniciar sesión' });
    }

    try {
        const carritoActual = Carrito.getCarrito(id_usuario);
        const item = carritoActual.find(e => e.id_evento == id_evento);

        if (!item) {
            res.setFlash('Evento no encontrado en el carrito.');
        } else if (accion === 'sumar') {
            Carrito.sumarCantidad(id_usuario, id_evento);
            res.setFlash('Cantidad de entradas actualizada.');
        } else if (accion === 'restar' && item.cantidad > 1) {
            Carrito.restarCantidad(id_usuario, id_evento);
            res.setFlash('Cantidad de entradas actualizada.');
        } else {
            res.setFlash('No se puede reducir más la cantidad.');
        }

        res.redirect('/');
    } catch (error) {
        res.status(500).render('pagina', { contenido: 'paginas/error', mensaje: 'Error al actualizar cantidad' });
    }
}

export function aplicarDescuento(req,res){
    
    const usuario_id=req.session.usuario_id;
    const {codigo}=req.body;

    const du = DescuentosUsuario.obtenerPorUsuario(usuario_id)
             .find(x => x.codigo === codigo);

    if (!du) {
        req.flash('error', 'Cupón no válido');
        return res.redirect('/carrito/carrito');
    }

    const descuento = Descuento.getDescuento(du.idDescuento);
    req.session.appliedCoupon = descuento;
    res.redirect('/carrito/carrito');
}

export function descartarDescuento(req, res) {
  delete req.session.appliedCoupon;
  return res.redirect('/carrito/carrito');
}