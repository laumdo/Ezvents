import { param, validationResult } from 'express-validator';
import { Descuento } from './Descuento.js';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import { getConnection } from "../db.js";
import { Usuario } from '../usuarios/Usuario.js';

export function viewDescuentos(req, res) {
    const descuentos = Descuento.getAll();
    const usuario = Usuario.getUsuarioByUsername(req.session.username); // Obtener el usuario por su ID

    res.render('pagina', { 
        contenido: 'paginas/puntos', 
        session: req.session, 
        descuentos, 
        puntosUsuario: usuario.puntos 
    });
}

export function agregarDescuento(req,res){
    try{
        const{ titulo, condiciones, puntos}=req.body;
        const imagen = req.file ? req.file.filename : 'default.png';

        const nuevoDescuento= new Descuento(null,titulo,condiciones,puntos,imagen);
        nuevoDescuento.persist();

        res.render('pagina',{
            contenido:'paginas/puntos',
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
        const imagen = req.file ? req.file.filename : null;
        let descuento = Descuento.getDescuento(id);
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
        Descuento.getDescuento(id);

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

export function canjearDescuento(req, res) {
    const descuento = Descuento.getDescuento(req.params.id);
    if (!descuento) {
        return res.json({ success: false, message: "El descuento no existe." });
    }

    const usuario = Usuario.getUsuarioByUsername(req.session.username);
    if (!usuario) {
        return res.json({ success: false, message: "Usuario no encontrado." });
    }

    // Verificar si el usuario tiene suficientes puntos
    if (usuario.puntos < descuento.puntos) {
        return res.json({ success: false, message: "Puntos insuficientes." });
    }

    // Restar puntos al usuario
    usuario.puntos -= descuento.puntos;
    usuario.persist(); // Guardar los cambios en la BD

    return res.json({ success: true, message: "Descuento canjeado con éxito." });
}
/*export function canjearDescuento(req,res){
    const descuento = Descuento.getDescuento(req.params.id);
    const usuario = Usuario.getUsuarioByUsername(req.session.username); // Obtener el usuario por su ID




    const userId = req.session.userId;
    const descuentoId = req.params.id;
    const db = getConnection();

    const user = db.prepare("SELECT puntos FROM Usuarios WHERE id = ?").get(userId);
    //const descuento = db.prepare("SELECT puntos FROM Descuento WHERE id = ?").get(descuentoId);
    
    if (!user || !descuento || user.puntos < descuento.puntos) {
        return res.json({ success: false });
    }
    
    const codigo = uuidv4().slice(0, 8);
    //db.prepare("INSERT INTO canjes (usuario_id, descuento_id, codigo) VALUES (?, ?, ?)").run(userId, descuentoId, codigo);
    db.prepare("UPDATE Usuarios SET puntos = puntos - ? WHERE id = ?").run(descuento.puntos, userId);
    
    res.json({ success: true, codigo });
}*/