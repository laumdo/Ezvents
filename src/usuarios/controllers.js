import { body, validationResult } from 'express-validator';
import { Usuario, RolesEnum } from './Usuario.js';
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
        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.username = usuario.username;
        req.session.rol = usuario.rol;
        req.session.usuario_id = usuario.id;
        req.session.usuario = usuario.username;
        
        req.session.esUsuario = usuario.rol === RolesEnum.USUARIO;
        req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;
        req.session.esEmpresa = usuario.rol === RolesEnum.EMPRESA;

        res.setFlash(`Encantado de verte de nuevo: ${usuario.nombre}`);
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
        usuario.persist();

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

    res.render('pagina', { contenido: 'paginas/datos', 
        session: req.session, 
        usuario,
        descuentosUsuario
     });
}

/*export async function doRegister(req, res) {
    const result = validationResult(req);
    if (! result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, 'paginas/register', {
            datos,
            errores
        });
    }

    // Capturo las variables username y password
    const username = req.body.username;
    const password = req.body.password;
    const nombre = req.body.nombre;

    try {
        const usuario = await Usuario.creaUsuario(username, password, nombre);
        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.rol = usuario.rol;
        req.session.usuario = usuario.username;

        return res.redirect('/usuarios/index');
    } catch (e) {
        let error = 'No se ha podido crear el usuario';
        if (e instanceof UsuarioYaExiste) {
            error = 'El nombre de usuario ya está utilizado';
        }
        const datos = matchedData(req);
        delete datos.password;
        delete datos.passwordConfirmacion;
        req.log.error("Problemas al registrar un nuevo usuario '%s'", username);
        req.log.debug('El usuario no ha podido registrarse: %s', e);
        render(req, res, 'paginas/register', {
            error,
            datos: {},
            errores: {}
        });
    }
}*/
export async function doRegister(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errores = result.mapped();
      const datos = matchedData(req);
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
      const nuevoUsuario = new Usuario(username, password, nombre, apellidos, email, rol);
      nuevoUsuario.persist();
  
      // Configurar la sesión con los datos del usuario
      req.session.login = true;
      req.session.nombre = nuevoUsuario.nombre;
      req.session.username = nuevoUsuario.username;
      req.session.rol = nuevoUsuario.rol;
      req.session.esUsuario = nuevoUsuario.rol === RolesEnum.USUARIO;
      req.session.esAdmin = nuevoUsuario.rol === RolesEnum.ADMIN;
      req.session.esEmpresa = nuevoUsuario.rol === RolesEnum.EMPRESA;
  
      return res.redirect('/usuarios/index');
    } catch (e) {
      let error = 'No se ha podido crear el usuario';
      if (e instanceof UsuarioYaExiste) {
        error = 'El nombre de usuario ya está utilizado';
      }
      const datos = matchedData(req);
      // Eliminar datos sensibles
      delete datos.password;
      delete datos.passwordConfirmacion;
      req.log.error("Problemas al registrar un nuevo usuario '%s'", username);
      req.log.debug('El usuario no ha podido registrarse: %s', e);
      render(req, res, 'paginas/register', {
        error,
        datos: {},
        errores: {}
      });
    }
  }
  