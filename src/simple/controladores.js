import { join } from 'node:path';
import { config } from '../config.js';

export function procesarFormulario(request, response) {
    response.render("datos_formulario", {
        nombre: request.body.nombre,
        apellidos: request.body.apellidos,
        fumador: request.body.fumador === "si",
        imagen: request.file ? request.file.filename : ""
    });
}

export function viewImagen(request, response) {
    response.sendFile(join(config.uploads, request.params.id));
}