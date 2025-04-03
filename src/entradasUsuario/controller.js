import { Usuario } from '../usuarios/Usuario.js';
import { Carrito } from '../carrito/Carrito.js';
import { Evento } from "../eventos/Evento.js";
import { EntradasUsuario } from './EntradasUsuario.js';
import { render } from '../utils/render.js';

export function viewEntradas(req, res){
    const usuario_id = req.session.usuario_id;
    const entradas = EntradasUsuario.getEntradasByUsuario(usuario_id);
    //Igual cambio a un buble for aqui
    res.render('pagina', {contenido: 'paginas/entradas', session: req.session, entradas});
}

export function viewComprar(req, res){
    render(req, res, 'paginas/compra', {
        datos: {},
        errores: {}
    });
}

export async function comprar(req, res){
    console.log("Solicitud POST recibida en /comprar");
    res.setFlash('Compra realizada con éxito');
    res.redirect('/');
}