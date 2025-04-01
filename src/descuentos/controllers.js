import { param, validationResult } from 'express-validator';
import { Descuento } from './Descuento.js';
import session from 'express-session';

export function viewDescuentos(req, res) {
    const descuentos = Descuento.getAll();
    res.render('pagina', { contenido: 'paginas/index', session: req.session, descuentos });
}

export function agregarDescuento(req,res){
    try{
        const{ titulo, condiciones, puntos}=req.body;
        const imagen = req.file ? req.file.filename : 'default.png';

        const nuevoDescuento= new Descuento(null,titulo,condiciones,puntos,imagen);
        nuevoDescuento.persist();

        res.render('pagina',{
            contenido:'paginas/index',
            session:req.session,
            mensaje:'Descuento agregado con exito'
        });
    }catch(error){
        res.status(400).send("Error al agregar descuento");
    }
}

export function modificarDescuento(req,res){
    try{
        const{ titulo, condiciones, puntos}=req.body;
        const imagen = req.file ? req.file.filename : 'default.png';
        let descuento = Descuento.obtenerPorId(id);
        if(!descuento) throw new DescuentoNoEncontrado(id);

        descuento.titulo=titulo || descuento.titulo;
        descuento.condiciones=condiciones || descuento.condiciones;
        descuento.puntos=puntos || descuento.puntos;
        descuento.imagen=imagen ? imagen : descuento.imagen;

        descuento.persist();
        res.render('pagina',{
            contenido: 'paginas/admin',
            session:req.session,
            mensaje:'Descuento modificado con exito'
        });
    }catch(error){
        res.render('pagina',{
            contenido:'paginas/admin',
            session:req.session,
            error:'Error al modificar descuento'
        });
    }
}

export function eliminarDescuento(req,res){

    try{
        const{id}=req.body;
        Descuento.obtenerPorId(id);

        Descuento.delete(id);

        res.render('pagina',{
            contenido: 'paginas/admin',
            session:req.session,
            mensaje: 'Descuento eliminado con exito'
        });
    }catch(error){
        res.render('pagina',{ contenido:'paginas/admin', error: 'Error al eliminar el descuento. Verifique el ID.'});
    }
}