import { render } from '../utils/render.js';
import { Evento } from '../eventos/Evento.js';

export function viewContenidoNormal(req, res) {
    render(req, res, 'paginas/normal');
}

export function viewContenidoAdmin(req, res) {
    render(req, res, 'paginas/admin');
}

export function viewContenidoEmpresa(req,res){
    const eventos = Evento.getEventosByIdEmpresa(req.session.usuario_id);
    render(req,res,'paginas/empresa', { eventos });
}