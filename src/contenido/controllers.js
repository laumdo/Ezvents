import { render } from '../utils/render.js';
import { Evento } from '../eventos/Evento.js';
import { error } from '../utils/helpers.js';

export function viewContenidoNormal(req, res) {
    render(req, res, 'paginas/normal');
}

export function viewContenidoAdmin(req, res) {
    render(req, res, 'paginas/admin', {
        errores: {},
        datos: {},
        helpers: { error }
    });
}

export function viewContenidoEmpresa(req,res){
    const eventos = Evento.getEventosByIdEmpresa(req.session.usuario_id);
    render(req, res, 'paginas/empresa', {
        eventos,
        errores: {},
        datos: {},
        helpers: { error }
    });
}