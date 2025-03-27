import { Usuario } from "./usuarios/Usuario.js";
import { Evento } from "./eventos/Evento.js";
import { carrito} from "./carrito/Carrito.js"

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Evento.initStatements(db);
    carrito.initStatements(db);
}