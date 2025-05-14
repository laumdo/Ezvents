import { Carrito } from './Carrito.js';
import { Evento } from '../eventos/Evento.js';
import { matchedData, validationResult } from 'express-validator';
import { DescuentosUsuario } from '../descuentosUsuario/DescuentosUsuario.js';
import { Usuario } from '../usuarios/Usuario.js';
import { Descuento } from '../descuentos/Descuento.js'

export async function verCarrito(req, res) {
    const usuario    = Usuario.getUsuarioByUsername(req.session.username);
    const usuario_id = usuario.id;
    const entradas = Carrito.getCarrito(usuario_id);

    const carrito = [];
    let precioTotal = 0;

    for (const entrada of entradas) {
        const evento = Evento.getEventoById(entrada.id_evento);
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
        const evento = new Carrito(null, id_usuario, id_evento, precio);
        console.log(evento);
        evento.persist();
        res.redirect('/carrito/carrito');
    } catch (error) {
        console.log(error);
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
        res.redirect('/carrito/carrito');
    } catch (error) {
        res.status(500).render('pagina', { contenido: 'paginas/error', mensaje: 'Error al eliminar evento del carrito' });
    }
}

export function actualizarCantidadCarrito(req, res) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Datos inválidos' });
    }

    const { id_evento, accion } = matchedData(req);
    const id_usuario = req.session.usuario_id;

    try {
        const carritoActual = Carrito.getCarrito(id_usuario);
        const item = carritoActual.find(e => e.id_evento == id_evento);

        if (!item) {
            return res.json({ success: false, error: 'Evento no encontrado' });
        }

        let nuevaCantidad = item.cantidad;
        if (accion === 'restar') nuevaCantidad--;
        if (accion === 'sumar') nuevaCantidad++;

        if (nuevaCantidad <= 0) {
            Carrito.deleteByEvent(id_usuario, id_evento);
        } else {
            Carrito.actualizarCantidad(id_usuario, id_evento, nuevaCantidad);
        }

        return res.json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Error del servidor' });
    }
}

export function aplicarDescuento(req, res) {
    const usuario_id = req.session.usuario_id;
    const { codigo } = req.body;
    
    const du = DescuentosUsuario.obtenerPorUsuario(usuario_id)
        .find(x => x.codigo === codigo);

    if (!du) {
        return res.status(400).json({ success: false, error: 'Cupón no válido' });
    }

    const descuento = Descuento.getDescuento(du.idDescuento);
    req.session.appliedCoupon = descuento;

    // Recalcular precio total con descuento aplicado
    const entradas = Carrito.getCarrito(usuario_id);
    let precioTotal = 0;

    for (const entrada of entradas) {
        const evento = Evento.getEventoById(entrada.id_evento);
        if (evento) {
            precioTotal += evento.precio * entrada.cantidad;
        }
    }

    const descuentoAplicado = precioTotal * descuento.valor;
    const totalConDescuento = precioTotal - descuentoAplicado;
    const descuentoActivo = req.session.descuentoAplicado != null;


    return res.json({
        success: true,
        cupon: {
            titulo: descuento.titulo,
            valor: descuento.valor
        },
        totalConDescuento: totalConDescuento.toFixed(2),
        descuentoAplicado: descuentoAplicado.toFixed(2),
        precioTotal: precioTotal.toFixed(2),
        porcentaje: descuento.valor,
        descuentoActivo: typeof descuentoActivo !== 'undefined' ? descuentoActivo : false
    });
}

export function descartarDescuento(req, res) {
  delete req.session.appliedCoupon;
  return res.redirect('/carrito/carrito');
}