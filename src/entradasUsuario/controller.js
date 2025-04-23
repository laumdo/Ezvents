import { Carrito } from '../carrito/Carrito.js';
import { Usuario } from '../usuarios/Usuario.js';
import { Evento } from "../eventos/Evento.js";
import { EntradasUsuario } from './EntradasUsuario.js';
import { render } from '../utils/render.js';
import { flashMessages } from '../middleware/flash.js';

export function viewEntradas(req, res){
    const usuario_id = req.session.usuario_id;
    
    const entradas = EntradasUsuario.getEntradasByUsuario(usuario_id);

    const eventos = [];

    for (const entrada of entradas) {
        const evento = Evento.getEventoById(entrada.idEvento);
        if (evento) {
            eventos.push({
                ...evento,
                cantidad: entrada.cantidad
            });
        }
    }

    res.render('pagina', {contenido: 'paginas/entradas', session: req.session, eventos});
}

export function viewComprar(req, res){
    render(req, res, 'paginas/compra', {
        datos: {},
        errores: {}
    });
}

export async function comprar(req, res){
    try{
        const id_usuario = req.session.usuario_id;
        const usuario = Usuario.getUsuarioByUsername(req.session.username);

        const carrito = await Carrito.getCarrito(id_usuario);

        /*for (const item of carrito) {
            const id_evento = item.id_evento;
            const cantidad = item.cantidad;
            const evento = Evento.getEventoById(id_evento);

            EntradasUsuario.compraEntrada(id_usuario, id_evento, cantidad);

            evento.entradas_vendidas += cantidad;
            evento.persist();

            usuario.puntos += item.precio * 5 * cantidad;
            await Carrito.deleteById(item.id);
        }
        usuario.persist();*/
        for (const item of carrito) {
                // registrar la venta
                 EntradasUsuario.compraEntrada(id_usuario, item.id_evento, item.cantidad);
                 // actualizar existencias
                 const evento = Evento.getEventoById(item.id_evento);
                 evento.entradas_vendidas += item.cantidad;
                 evento.persist();
                 // **añadir** lote de puntos en PuntosUsuario
                 Usuario.addPoints(id_usuario, item.precio * 5 * item.cantidad);
                 await Carrito.deleteById(item.id);
        }

        res.setFlash('Compra realizada con éxito');
        res.redirect('/');
    }catch (e){
        res.setFlash('Hubo un error al realizar la compra');
        res.redirect('/');
    }
}