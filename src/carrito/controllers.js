import { Carrito } from './Carrito.js';
import { Evento } from '../eventos/Evento.js';
import { Usuario } from '../usuarios/Usuario.js';
import { Descuento } from '../descuentos/Descuento.js';
import { flashMessages } from '../middleware/flash.js';
import { DescuentosUsuario } from '../descuentosUsuario/DescuentosUsuario.js';

export function verCarrito(req, res) {
    const usuario    = Usuario.getUsuarioByUsername(req.session.username);
    const usuario_id = usuario.id;

    //const usuario_id = req.session.usuario_id;
    const entradas = Carrito.getCarrito(usuario_id);

    const carrito = [];
    let precioTotal = 0;

    for (const entrada of entradas) {
        const evento = Evento.getEventoById(entrada.id_evento);
        if (evento) {
            carrito.push({
            id: evento.id,
            nombre: evento.nombre,
            precio: evento.precio,
            cantidad: entrada.cantidad,
            imagen: evento.imagen
            });
            precioTotal += (evento.precio * entrada.cantidad);
        }
    }

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
    try {

        const id_evento = req.body.id_evento;
        const precio = req.body.precio;

        const id_usuario = req.session.usuario_id ? req.session.usuario_id : null;
        if (!id_usuario) {
            return res.render('pagina', { contenido: 'paginas/error', mensaje: 'Debes iniciar sesión para agregar al carrito' });
        }

    Carrito.agregarEvento(id_usuario, id_evento, precio);
    res.setFlash('Evento añadido al carrito.');
    res.redirect('/');

    } catch (error) {
        res.render('pagina', { contenido: 'paginas/error', mensaje: 'Error al agregar evento al carrito' });
    }
}

export function eliminarDelCarrito(req, res) {
    try {
        const { id_evento } = req.body;
        const id_usuario = req.session.usuario_id ? req.session.usuario_id : null;

        Carrito.deleteByEvent(id_usuario, id_evento);

        res.redirect('/carrito/carrito');
    } catch (error) {
        res.status(500).render('pagina', { contenido: 'paginas/error', mensaje: 'Error al eliminar evento del carrito' });
    }
}

export function actualizarCantidadCarrito(req, res) {
    try {
        const id_usuario = req.session.usuario_id;
        const { id_evento} = req.body;
        const { accion} = req.body;
        const carritoActual = Carrito.getCarrito(id_usuario);
        const item = carritoActual.find(e => e.id_evento == id_evento);

        const evento = Evento.getEventoById(id_evento);

        if (accion === 'sumar' && evento.entradas_vendidas + item.cantidad < evento.aforo_maximo) {
            Carrito.sumarCantidad(id_usuario, id_evento);
        } else if (accion === 'restar' && item.cantidad > 1) {
            Carrito.restarCantidad(id_usuario, id_evento);
        }else{
            res.redirect('/carrito/carrito');
        }

        res.redirect('/carrito/carrito');
    } catch (error) {
        res.render('pagina', { contenido: 'paginas/error', mensaje: 'Error al actualizar cantidad' });
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