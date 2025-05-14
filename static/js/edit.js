document.addEventListener('DOMContentLoaded', init);

let usernameOriginal = '';

function init() {
    const formRegistro = document.forms.namedItem('edit');
    formRegistro.addEventListener('submit', registroSubmit);

    const email = formRegistro.elements.namedItem('email');
    email.addEventListener('input', compruebaEmail);

    const username = formRegistro.elements.namedItem('username');
    usernameOriginal = username.value.trim(); // Guardamos el valor original
    username.addEventListener('input', usernameDisponible);

    formRegistro.elements.password.addEventListener('input', compruebaPassword);
}

function setError(input, msg) {
    const span = input.parentElement.querySelector('span.error');
    if (span) span.textContent = msg;
}
  
function clearError(input) {
    setError(input, '');
}

async function registroSubmit(e){
    e.preventDefault();
    const formRegistro = e.target;

    try {
        const formData = new FormData(formRegistro);
        const response = await postData('/usuarios/modificarUsuario', formData);
        window.location.assign('/');
    } catch (err) {
        if (err instanceof ResponseError) {
            if (err.response.status === 400) {
                await displayErrores(err.response);
            }
        }
        console.error(`Error: `, err);
    } 
}

async function displayErrores(response) {
    const { errores } = await response.json();
    const formRegistro = document.forms.namedItem('edit');
    for (const input of formRegistro.elements) {
        if (!input.name) continue;

        const errorSpan = input.parentElement.querySelector('span.error');
        if (errorSpan) errorSpan.textContent = '';

        const err = errores[input.name];
        if (err && errorSpan) {
            errorSpan.textContent = err.msg;
        }
    }
}

function compruebaEmail(e) {
    const email = e.target;

    const valido = correoValidoUCM(email.value);
    email.setCustomValidity(valido ? '' : "El correo debe ser válido y acabar por @ucm.es");

    const feedback = email.form.querySelector(`*[name="${email.name}"] ~ span.feedback`);
    if (!feedback) return;

    if (email.checkValidity()) {
        feedback.textContent = '✔';
        feedback.style.color = '#6aa84f';
    } else {
        feedback.textContent = '⚠';
        feedback.style.color = '#ff0000';
    }

    email.reportValidity();
}

function correoValidoUCM(correo) {
    return correo.endsWith("@ucm.es");
}

async function usernameDisponible(e) {
    const username = e.target;
    const valor = username.value.trim();
    const feedback = username.form.querySelector(`*[name="${username.name}"] ~ .feedback`);
    if (!feedback) return;

    feedback.textContent = '';
    username.setCustomValidity('');

    // Si no ha cambiado, se considera válido
    if (valor === usernameOriginal) {
        feedback.textContent = '✔';
        feedback.style.color = '#6aa84f';
        return;
    }

    if (!valor) return;

    try {
        const response = await postJson('/api/usuarios/disponible', { username: valor });
        const { disponible } = await response.json();

        if (disponible) {
            feedback.textContent = '✔';
            feedback.style.color = '#6aa84f';
            username.setCustomValidity('');
        } else {
            feedback.textContent = '⚠';
            feedback.style.color = '#ff0000';
            username.setCustomValidity('El nombre de usuario ya está utilizado');
        }
        username.reportValidity();
    } catch (err) {
        console.error('Error comprobando disponibilidad:', err);
    }
}

function compruebaPassword(e) {
    const pwd = e.target;
    if (pwd.value && (pwd.value.length < 6 || pwd.value.length > 10)) {
        setError(pwd, 'Debe tener entre 6 y 10 caracteres');
    } else {
        clearError(pwd);
    }
}
