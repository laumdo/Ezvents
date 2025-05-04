import { Carrito } from '../carrito/Carrito.js';
import { Usuario } from '../usuarios/Usuario.js';
import { Evento } from "../eventos/Evento.js";
import { EntradasUsuario } from './EntradasUsuario.js';
import { render } from '../utils/render.js';
import { flashMessages } from '../middleware/flash.js';

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
    try{
        const id_usuario = req.session.usuario_id;
        const usuario = Usuario.getUsuarioByUsername(req.session.username);

        const carrito = await Carrito.getCarrito(id_usuario);

        for (const item of carrito) {
            const id_evento = item.id_evento;
            const cantidad = item.cantidad;
            const evento = Evento.getEventoById(id_evento);

            EntradasUsuario.compraEntrada(id_usuario, id_evento, cantidad);

            evento.entradas_vendidas += cantidad;
            evento.persist();

            usuario.puntos += Math.round(item.precio * 5 * cantidad);
            await Carrito.deleteById(item.id);
        }
        usuario.persist();

        res.setFlash('Compra realizada con éxito');
        res.redirect('/');
    }catch (e){
        res.setFlash('Hubo un error al realizar la compra');
        res.redirect('/');
    }
}