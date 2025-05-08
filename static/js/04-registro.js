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
    const formRegistro = document.forms.namedItem('registro');
    formRegistro.addEventListener('submit', registroSubmit);

    const email = formRegistro.elements.namedItem('email');
    //email.addEventListener('change', compruebaEmail);
    email.addEventListener('input', compruebaEmail);

    const username = formRegistro.elements.namedItem('username');

    // username.addEventListener('change', usernameDisponible);
    username.addEventListener('input', usernameDisponible);
}

/**
 * 
 * @param {SubmitEvent} e 
 */
async function registroSubmit(e){
    // No se envía el formulario manualmente
    e.preventDefault();
    const formRegistro = e.target;
    try {
        const formData = new FormData(formRegistro);
        const response = await postData('/usuarios/registro', formData);
        window.location.assign('/usuarios/home');
    } catch (err) {
        if (err instanceof ResponseError) {
            switch(err.response.status) {
                case 400:
                    await displayErrores(err.response);
                    break;
            }
        }
        console.error(`Error: `, err);
    } 
}

async function displayErrores(response) {
    const { errores } = await response.json();
    const formRegistro = document.forms.namedItem('registro');
    for(const input of formRegistro.elements) {
        if (input.name == undefined || input.name === '') continue;
        const feedback = formRegistro.querySelector(`*[name="${input.name}"] ~ span.error`);
        if (feedback == undefined) continue;

        feedback.textContent = '';

        const error = errores[input.name];
        if (error) {
            feedback.textContent = error.msg;
        }
    }
}

function compruebaEmail(e) {
    const email = e.target;

    if (correoValidoUCM(email.value)) {
        email.setCustomValidity('');
    } else {
        email.setCustomValidity("El correo debe ser válido y acabar por @ucm.es");
    }

    // validación html5, porque el campo es <input type="email" ...>
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity
    // se asigna la pseudoclase :invalid
    const esCorreoValido = email.checkValidity();

    const feedback = email.form.querySelector(`*[name="${email.name}"] ~ span.error`);

    if (esCorreoValido) {
        // el correo es válido y acaba por @ucm.es
        feedback.textContent='✔';
        feedback.style.color = '#6aa84f';
        // <-- aquí pongo la marca apropiada, y quito (si la hay) la otra
        // ✔
    } else {			
        // correo invalido: ponemos una marca e indicamos al usuario que no es valido
        feedback.textContent='⚠';
        feedback.style.color = '#ff0000';
        // <-- aquí pongo la marca apropiada, y quito (si la hay) la otra
        // ⚠
    }
    // Muestra el mensaje de validación
    email.reportValidity();
}

function correoValidoUCM(correo) {
    return correo.endsWith("@ucm.es");
}

async function usernameDisponible(e) {
    const username = e.target;
    const feedback = username.form.querySelector(`*[name="${username.name}"] ~ .feedback`);
    feedback.textContent = '';
    username.setCustomValidity('');
  
    if (!username.value) return;
  
    try {
      const response = await postJson('/api/usuarios/disponible', { username: username.value });
      const { disponible } = await response.json();
  
      if (disponible) {
        feedback.textContent = '✔';
        username.setCustomValidity('');
      } else {
        feedback.textContent = '⚠';
        username.setCustomValidity('El nombre de usuario ya está utilizado');
      }
      username.reportValidity();
    } catch (err) {
      console.error('Error comprobando disponibilidad:', err);
    }
  }