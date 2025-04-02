/*function canjearDescuento(descuentoId, puntosRequeridos) {
    fetch('/descuentos/canjear/' + descuentoId, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (confirm("¿Seguro que quieres canjear esta oferta?")) {
                    alert("Código de canje: " + data.codigo);
                    location.reload();
                }
            } else {
                alert("Puntos insuficientes");
            }
        });
}*/

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".btn-canjear").forEach(btn => {
        btn.addEventListener("click", async function () {
            const idDescuento = this.dataset.id; // Obtener el ID del descuento
            const puntosNecesarios = this.dataset.puntos; // Obtener los puntos necesarios

            try {
                const respuesta = await fetch(`/descuentos/canjear/${idDescuento}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });

                const data = await respuesta.json();
                mostrarMensaje(data.message, data.success);
            } catch (error) {
                console.error("Error al canjear el descuento:", error);
                mostrarMensaje("Hubo un error al procesar la solicitud.", false);
            }
        });
    });
});

/**
 * Muestra un mensaje flotante en la web
 * @param {string} mensaje - Texto del mensaje
 * @param {boolean} exito - Indica si es un mensaje de éxito (true) o error (false)
 */
function mostrarMensaje(mensaje, exito) {
    const mensajeBox = document.getElementById("mensajeDescuento");

    if (!mensajeBox) {
        console.error("No se encontró el contenedor de mensajes.");
        return;
    }

    mensajeBox.textContent = mensaje;
    mensajeBox.classList.remove("oculto", "error", "exito");
    mensajeBox.classList.add(exito ? "exito" : "error");

    setTimeout(() => mensajeBox.classList.add("oculto"), 3000); // Ocultar después de 3 segundos
}

