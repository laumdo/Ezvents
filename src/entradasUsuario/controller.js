import { Carrito } from '../carrito/Carrito.js';
import { Usuario } from '../usuarios/Usuario.js';
import { Evento } from "../eventos/Evento.js";
import { EntradasUsuario } from './EntradasUsuario.js';
import { DescuentosUsuario } from '../descuentosUsuario/DescuentosUsuario.js';
import { render } from '../utils/render.js';
import { validationResult } from 'express-validator';

export function viewEntradas(req, res){
    const usuario_id = req.session.usuario_id;
    
    const entradas = EntradasUsuario.getEntradasByUsuario(usuario_id);

    const ids_eventos = entradas.map(entrada => entrada.idEvento);

    const eventosMap = Evento.getEventosById(ids_eventos);

    const eventos = entradas.map(entrada => {
        const evento = eventosMap[entrada.idEvento];
        return {
            ...evento,
            cantidad: entrada.cantidad
        };
    });

    res.render('pagina', {contenido: 'paginas/entradas', session: req.session, eventos});
}

export function viewComprar(req, res){
    render(req, res, 'paginas/compra', {
        datos: {},
        errores: {}
    });
}

export async function comprar(req, res){
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        const mensajes = errores.array().map(e => e.msg).join(', ');
        res.setFlash(`Error al finalizar la compra: ${mensajes}`);
        return res.redirect('/');
    }

    try{
        const id_usuario = req.session.usuario_id;
        const usuario = Usuario.getUsuarioByUsername(req.session.username);

        const carrito = await Carrito.getCarrito(id_usuario);

        const cupon = req.session.appliedCoupon;
        if (cupon) { //si hemos aplicado un cupon hay que eliminarlo del usuario
            DescuentosUsuario.delete(id_usuario, cupon.id);
        }

        for (const item of carrito) {
            const id_evento = item.id_evento;
            const cantidad = item.cantidad;
            const evento = Evento.getEventoById(id_evento);

            const usuario = await Usuario.getUsuarioByUsername(req.session.username);
            if (usuario.age < evento.edad_minima) {
                req.setFlash(`No tienes la edad mínima (${evento.edad_minima} años) para el evento "${evento.nombre}".`);
                return res.redirect('/carrito');
            }

            EntradasUsuario.compraEntrada(id_usuario, id_evento, cantidad);

            evento.entradas_vendidas += cantidad;
            evento.persist();

            usuario.puntos += Math.round(item.precio * 5 * cantidad);
            await Carrito.deleteById(item.id);
        }
        usuario.persist();

        delete req.session.appliedCoupon;

        res.setFlash('Compra realizada con éxito');
        res.redirect('/');
    }catch (e){
        res.setFlash('Hubo un error al realizar la compra');
        res.redirect('/');
    }
    
}