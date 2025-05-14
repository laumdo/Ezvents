import { body, validationResult } from 'express-validator';
import { Usuario, RolesEnum, UsuarioYaExiste, EmailYaExiste } from './Usuario.js';
import { matchedData } from 'express-validator';
import { DescuentosUsuario } from '../descuentosUsuario/DescuentosUsuario.js';
import { render } from '../utils/render.js';



export function viewLogin(req, res) {
    render(req, res, 'paginas/login', {
        datos: {},
        errores: {}
    });
}

export async function doLogin(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, 'paginas/login', {
            errores,
            datos
        });
    }

    const username = req.body.username;
    
    const password = req.body.password;

    try {
        const usuario = await Usuario.login(username, password);
       
        //verficar cumpleaños
        // --- Nuevo bonus de cumpleaños---
        if (usuario.fecha_nacimiento) {
            const [y, m, d] = usuario.fecha_nacimiento.split('-').map(Number);
            const hoy = new Date();
            const esCumple = m === hoy.getMonth() + 1 && d === hoy.getDate();
            const todayStr = hoy.toISOString().slice(0,10);
          
            if (esCumple && !Usuario.hasBirthdayBonusToday(usuario.id)) {
                Usuario.addBirthdayBonus(usuario.id);
                res.setFlash(`🎂 ¡Feliz cumpleaños, ${usuario.nombre}! Te hemos regalado 200 puntos.`);
            }
        }
        if (!req.session.flashMsg) {
            res.setFlash(`Encantado de verte de nuevo: ${usuario.nombre}`);
        }
        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.username = usuario.username;
        req.session.rol = usuario.rol;
        req.session.usuario_id = usuario.id;
        req.session.usuario = usuario.username;
        
        req.session.esUsuario = usuario.rol === RolesEnum.USUARIO;
        req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;
        req.session.esEmpresa = usuario.rol === RolesEnum.EMPRESA;
        return res.redirect('/');
    } catch (e) {
        const datos = matchedData(req);
        req.log.warn("Problemas al hacer login del usuario '%s'", username);
        req.log.debug('El usuario %s, no ha podido logarse: %s', username, e.message);
        render(req, res, 'paginas/login', {
            error: 'El usuario o contraseña no son válidos',
            datos,
            errores: {}
        });
    }
}

export function doLogout(req, res, next) {
    
    req.session.login = null
    req.session.nombre = null;
    req.session.esAdmin = null;
    req.session.esEmpresa=null;
    req.session.esUsuario=null;
    req.session.save((err) => {
        if (err) next(err);

        req.session.regenerate((err) => {
            if (err) next(err)
            res.redirect('/');
        })
    })
}

export function agregarUsuario(req, res){

    try{
        const{username, password,nombre,rol}=req.body;
        const nuevoUsuario= new Usuario(null,username,password,nombre,rol);
        nuevoUsuario.persist();

        res.redirect('/usuarios');

    }catch(error){
        res.status(400).send("Error al agregar un usuario.");
    }
}

export function eliminarUsuario(req, res) {
    try {
        if (!req.session || !req.session.username) {
            return res.status(403).send("No tienes permiso para realizar esta acción.");
        }

        let usernameAEliminar;

        if (req.body.propio) {
            usernameAEliminar = req.session.username;
        } else if (req.session.esAdmin && req.body.nombre) {
            usernameAEliminar = req.body.nombre;
        } else {
            return res.status(403).send("No tienes permiso para realizar esta acción.");
        }

        const usuario = Usuario.getUsuarioByUsername(usernameAEliminar);
        if (!usuario) {
            throw new UsuarioNoEncontrado(usernameAEliminar);
        }

        Usuario.delete(usuario.id);

        if (req.body.propio) {
            req.session.destroy((err) => {
                if (err) console.error("Error al cerrar sesión tras eliminar usuario:", err);
                res.redirect('/');
            });
        } else {
            res.render('pagina', { 
                contenido: 'paginas/admin', 
                session: req.session,
                mensaje: 'Usuario eliminado con éxito' 
            });
        }

    } catch (error) {
        console.error("Error al eliminar usuario:", error.message);
        res.render('pagina', {
            contenido: 'paginas/admin',
            session: req.session,
            error: 'Error al eliminar la cuenta.'
        });
    }
}



export function viewRegister(req, res){
    res.render('pagina', {contenido: 'paginas/register', 
        session: req.session,
        datos: {},
        errores: {},
        error: null});
}

export function viewDatos(req, res) {
    if (!req.session || !req.session.username) {
        return res.redirect('/usuarios/login'); 
    }

    let usuario = null;
    let descuentosUsuario=null;
    try {
        console.log(req.session.username);
        usuario = Usuario.getUsuarioByUsername(req.session.username);
        descuentosUsuario = DescuentosUsuario.obtenerPorUsuario(usuario.id);

    } catch (e) {
        console.error("Error obteniendo usuario:", e);
        usuario = null; 
        descuentosUsuario=null;
    }

    const puntosUsuario=Usuario.getAvailablePoints(usuario.id);
    res.render('pagina', { contenido: 'paginas/datos', 
        session: req.session, 
        usuario,
        descuentosUsuario,
        puntosUsuario
     });
}

export function viewModificarUsuario(req, res) {
    if (!req.session || !req.session.username) {
        return res.redirect('/usuarios/login'); 
    }

    let usuario = null;
    try {
        console.log(req.session.username);
        usuario = Usuario.getUsuarioById(req.session.usuario_id);
    } catch (e) {
        console.error("Error obteniendo usuario:", e);
        usuario = null; 
    }

    res.render('pagina', {contenido: 'paginas/modificarUsuario', 
    session: req.session,
    usuario,
    datos: {},
    errores: {},
    error: null});
}

export function modificarUsuario(req, res){
    console.log("modificarUsuario");
    try{
        const {username, password, nombre, apellidos, email, rol, fecha_nacimiento} = req.body;
        let usuario = Usuario.getUsuarioById(req.session.usuario_id);
        if(!usuario) throw new UsuarioNoEncontrado(req.session.usuario_id);
        console.log("usuario: ", usuario);

        if(username && username !== usuario.username){//CAMBIAR SI NO HAGO LO DEL AJAX
            usuario.username = username;
            req.session.username = username;
        }else{
            usuario.username = usuario.username;
        }
        console.log("username: ", usuario.username);

        if (password && password.trim() !== "") {
            usuario.password = password; // Hashear contraseña
        }else{
            usuario.password = usuario.password;
        }
        console.log("contrasena");

        let rolEnum = null;
        if (rol === 'empresa') {
            rolEnum = RolesEnum.EMPRESA;
        } else if (rol === 'administrador') {
            rolEnum = RolesEnum.ADMIN;
        } else {
            rolEnum = RolesEnum.USUARIO;
        }

        usuario.nombre = nombre || usuario.nombre;
        usuario.apellidos = apellidos || usuario.apellidos;
        usuario.email = email || usuario.email;
        usuario.rol = rolEnum || usuario.rol;
        usuario.fecha_nacimiento = fecha_nacimiento || usuario.fecha_nacimiento;

        console.log("usuario: ", usuario);

        console.log("va a llamar a persist");
        usuario.persist();
        console.log("ha llamado a persist");

        res.setFlash('Usuario modificado con éxito');
        res.redirect('/');
    }catch(error){
        res.setFlash('Error al modificar el usuario');
        res.redirect('/');
    }
}

export async function doRegister(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = req.body;
        return render(req, res, 'paginas/register', {
          datos,
          errores
        });
    }
    // Capturar las variables del formulario
    const username = req.body.username;
    const password = req.body.password;
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const email = req.body.email;
    const fecha_nacimiento = req.body.fecha_nacimiento;
    const rolStr = req.body.rol.toLowerCase();
  
    // Determinar el rol según el valor seleccionado
    let rol;
    if (rolStr === 'usuario') {
        rol = RolesEnum.USUARIO;
    } else if (rolStr === 'empresa') {
        rol = RolesEnum.EMPRESA;
    } else if (rolStr === 'administrador') {
        rol = RolesEnum.ADMIN;
    } else {
        rol = RolesEnum.USUARIO;
    }
  
    try {
      // Crear un nuevo usuario y persistirlo en la base de datos
      
        const nuevoUsuario = new Usuario(username,null, nombre, apellidos, email, rol,null,0,fecha_nacimiento,null);
        nuevoUsuario.password=password;
        nuevoUsuario.persist();
  
      // Configurar la sesión con los datos del usuario
        req.session.login = true;
        req.session.nombre = nuevoUsuario.nombre;
        req.session.username = nuevoUsuario.username;
        req.session.rol = nuevoUsuario.rol;
        req.session.esUsuario = nuevoUsuario.rol === RolesEnum.USUARIO;
        req.session.esAdmin = nuevoUsuario.rol === RolesEnum.ADMIN;
        req.session.esEmpresa = nuevoUsuario.rol === RolesEnum.EMPRESA;
  
        return res.redirect('/');
    } catch (e) {
        let error = 'No se ha podido crear el usuario';
        if (e instanceof UsuarioYaExiste) {
            error = 'El nombre de usuario ya está utilizado';
        } else if (e instanceof EmailYaExiste) {
            error = 'El email ya está registrado' ;
        }
        const datos = req.body;
        // Eliminar datos sensibles
        delete datos.password;
        delete datos.passwordConfirmacion;

        const errores = {};
        render(req, res, 'paginas/register', {
            error,
            datos,
            errores
        });
    }
}

  