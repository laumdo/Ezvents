import { body, validationResult } from 'express-validator';

export function viewLogin(req, res) {
    res.render('pagina', {contenido: 'paginas/login', session: req.session, error: null});
}

export function doLogin(req, res) {
    body('username').escape(); // Se asegura que eliminar caracteres problemáticos
    body('password').escape(); // Se asegura que eliminar caracteres problemáticos

    const {username, password} = req.body;
    if(username === 'user' && password === 'userpass'){
        req.session.login = true;
        req.session.nombre = 'Usuario';
    }else if(username === 'admin' && password === 'adminpass'){
        req.session.login = true;
        req.session.nombre = 'Administrador';
        req.session.esAdmin = true;
    }else{
        return res.render('pagina', {contenido: 'paginas/login', session: req.session, error: 'Nombre o contraseña incorrecta'});
    }

    return res.render('pagina', {contenido: 'paginas/bienvenida', session: req.session});
}

export function doLogout(req, res, next) {
    // TODO: https://expressjs.com/en/resources/middleware/session.html
    delete req.session.login;
    delete req.session.nombre;
    if(req.session.esAdmin){
        delete req.session.esAdmin;
    }

    res.render('pagina', {contenido: 'paginas/logout', mensaje: 'Gracias por visitar nuestra web. Hasta pronto.'});
}
