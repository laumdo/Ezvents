/*
 * Inicializamos el JS cuando se ha terminado de procesar todo el HTML de la página.
 *
 * Al incluir <script> al final de la página podríamos invocar simplemente a init().
 */
document.addEventListener('DOMContentLoaded', init);

/**
 * Inicializa la página
 */
function init() {
    const automaticamenteButton = document.querySelector('button[name="automaticamente"]');
    automaticamenteButton.addEventListener('click', (e) => {
        const listaUsuarios = document.querySelector('.usuarios');
        // Eliminamos el contenido interior de l lista de usuarios.
        listaUsuarios.innerHTML = '';
        cargarAutomaticamente(1, 1);
    });

    cargaUsuariosFetch(1);
}

/**
 * 
 * @param {number} pagina
 * @param {HTMLDivElement} [listaUsuarios]
 * 
 * @returns {object}
 */
async function cargaUsuariosFetch(pagina, listaUsuarios) {
    if (listaUsuarios == null) {
        listaUsuarios = document.querySelector('.usuarios');
    }

    try {
        /*
        * Invocar `fetch()`, pasando la URL.
        * fetch() devuelve una `Promise`. `await` espera a recibir la respuesta del servidor
        */
        const response = await safeFetch(`/api/usuarios?pagina=${pagina}`);

        /* Alternativa
        const response = await getData(`/api/usuarios?pagina=${pagina}`, {
            headers: {
                "Accept": "application/json"
            }
        });
        */

        /*
        * Si la respuesta es correcta, se carga toda la respuesta.
        * `response.json()` también devuelve una `Promise` que tenemos que esperar.
        */
        const jsonData = await response.json();
        for(const usuario of jsonData.data) {
            listaUsuarios.innerHTML += generaUsuario(usuario);
        }

        return jsonData;
    } catch (err) {
        listaUsuarios.textContent = `No se ha podido la lista de usuarios: ${err}`;
    }
}

/**
 * 
 * @param {{id: string; email:string; first_name:string; last_name:string; avatar: string}} usuario
 * 
 * @returns {string}
 */
function generaUsuario(usuario) {
    return`<div>
    <p>${usuario.nombre} ${usuario.apellidos}</p>
    <img src="${usuario.avatar}" />
</div>`;
}

/**
 * 
 * @param {number} [pagina] 
 */
function cargarAutomaticamente(pagina = 1, delay = 5) {
    setTimeout(async () => {
        const jsonData = await cargaUsuariosFetch(pagina);
        if (pagina < jsonData.total_paginas) {
            cargarAutomaticamente(pagina + 1);
        }
    }, delay * 1000);
}