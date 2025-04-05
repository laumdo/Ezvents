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

        const carrito = await Carrito.getByUser(id_usuario);

        if (!carrito || carrito.length === 0) {
            res.setFlash('No tienes entradas en el carrito');
            return res.redirect('/');
        }

        for (const item of carrito) {
            const id_evento = item.id_evento;

            usuario.puntos += item.precio * 10; // Sumar puntos al usuario
            usuario.persist();

            await EntradasUsuario.compraEntrada(id_usuario, id_evento, 1);
            await Carrito.deleteById(item.id_usuario, item.id_evento); // Eliminar entrada del carrito
        }

        res.setFlash('Compra realizada con éxito');
        res.redirect('/');
    }catch (e){
        res.setFlash('Hubo un error al realizar la compra');
        res.redirect('/');
    }
}