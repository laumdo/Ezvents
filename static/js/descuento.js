document.addEventListener("DOMContentLoaded", function () {
    const modalConfirmacion = document.getElementById("modalConfirmacion");
    const modalTexto = document.getElementById("modalTexto");
    const btnConfirmar = document.getElementById("btnConfirmar");
    const btnCancelar = document.getElementById("btnCancelar");

    const modalMensaje = document.getElementById("modalMensaje");
    const modalMensajeTexto = document.getElementById("modalMensajeTexto");
    const btnCerrarMensaje = document.getElementById("btnCerrarMensaje");

    let idDescuentoSeleccionado = null;
    let puntosNecesariosSeleccionados = null;

    document.querySelectorAll(".btn-canjear").forEach(btn => {
        btn.addEventListener("click", function () {
            idDescuentoSeleccionado = this.dataset.id;
            puntosNecesariosSeleccionados = parseInt(this.dataset.puntos, 10);

            const puntosUsuarioElem = document.querySelector("p strong");
            const puntosActuales = parseInt(puntosUsuarioElem.textContent, 10);

            if (puntosActuales < puntosNecesariosSeleccionados) {
                mostrarMensaje("No tienes suficientes puntos para este descuento.", false);
                return;
            }

            modalTexto.textContent = `¿Estás seguro de que quieres canjear este descuento por ${puntosNecesariosSeleccionados} puntos?`;
            modalConfirmacion.classList.remove("oculto");
        });
    });

    btnCancelar.addEventListener("click", function () {
        modalConfirmacion.classList.add("oculto");
    });

    btnConfirmar.addEventListener("click", async function () {
        modalConfirmacion.classList.add("oculto");

        try {
            const respuesta = await fetch(`/descuentos/canjear/${idDescuentoSeleccionado}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await respuesta.json();
            mostrarMensaje(data.message, data.success);

            // Si el canje fue exitoso, actualizar los puntos en la interfaz
            if (data.success) {
                const puntosUsuarioElem = document.querySelector("p strong");
                if (puntosUsuarioElem) {
                    const nuevosPuntos = parseInt(puntosUsuarioElem.textContent, 10) - puntosNecesariosSeleccionados;
                    puntosUsuarioElem.textContent = nuevosPuntos >= 0 ? nuevosPuntos : 0;
                }
            }
        } catch (error) {
            console.error("Error al canjear el descuento:", error);
            mostrarMensaje("Hubo un error al procesar la solicitud.", false);
        }
    });

    btnCerrarMensaje.addEventListener("click", function () {
        modalMensaje.classList.add("oculto");
    });

    function mostrarMensaje(mensaje, exito) {
        modalMensajeTexto.textContent = mensaje;
        modalMensaje.classList.remove("oculto");
        modalMensaje.classList.toggle("exito", exito);
        modalMensaje.classList.toggle("error", !exito);
    }
});
