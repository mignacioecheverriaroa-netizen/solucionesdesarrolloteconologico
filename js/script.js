// =========================================================
// SDT — Soluciones en Desarrollo Tecnológico
// Interacciones de la página
// =========================================================

// ---------- CONFIGURACIÓN ----------

// Correo de la empresa. Déjalo vacío ("") hasta tenerlo listo.
// Al escribirlo aquí, por ejemplo "contacto@sdt.cl":
//   1) aparece automáticamente en la sección de contacto, y
//   2) cada consulta del formulario también llega a ese correo (servicio FormSubmit).
const CORREO = "";

// Número que usa el botón flotante (formato internacional, sin "+" ni espacios)
const WHATSAPP_FLOTANTE = "56934361183";

// Números permitidos para el formulario. Solo se envía a estos,
// aunque alguien modifique el HTML desde el navegador.
const NUMEROS_PERMITIDOS = ["56934361183", "56977894839"];

// Seguridad del formulario
const TIEMPO_MINIMO_MS = 3000;      // un robot llena el formulario en menos de 3 segundos
const ESPERA_ENTRE_ENVIOS_MS = 30000; // evita envíos repetidos (30 segundos)
const MAX_NOMBRE = 60;
const MAX_CONSULTA = 800;

// ---------- 1. Año actual en el pie ----------
document.getElementById("anio").textContent = new Date().getFullYear();

// ---------- 2. Borde del encabezado al bajar ----------
const encabezado = document.getElementById("encabezado");
window.addEventListener("scroll", () => {
    encabezado.classList.toggle("con-borde", window.scrollY > 10);
}, { passive: true });

// ---------- 3. Mostrar el correo cuando esté configurado ----------
if (CORREO) {
    const enlaceCorreo = document.getElementById("enlaceCorreo");
    enlaceCorreo.textContent = CORREO;
    enlaceCorreo.href = `mailto:${CORREO}`;
    document.getElementById("datoCorreo").hidden = false;
}

// ---------- Utilidades ----------

// Abre WhatsApp con un mensaje ya escrito
// (se usa un enlace real porque algunos navegadores bloquean window.open)
function abrirWhatsApp(numero, mensaje) {
    const enlace = document.createElement("a");
    enlace.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    enlace.target = "_blank";
    enlace.rel = "noopener";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
}

// Limpia el texto escrito por el cliente:
// quita caracteres de control y etiquetas HTML, junta espacios repetidos y respeta el largo máximo
function limpiarTexto(texto, maximo) {
    return texto
        .normalize("NFC")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E]/g, "")
        .replace(/<[^>]*>/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, maximo);
}

// Un nombre solo puede tener letras (con tildes y ñ), espacios, apóstrofo, punto y guion
const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]{2,60}$/;

// Detecta enlaces dentro de la consulta (típico del spam)
const PATRON_ENLACE = /(https?:\/\/|www\.)\S+/i;

// Lectura y escritura segura del almacenamiento del navegador
function leerUltimoEnvio() {
    try { return Number(localStorage.getItem("sdt_ultimo_envio")) || 0; } catch { return 0; }
}
function guardarUltimoEnvio(momento) {
    try { localStorage.setItem("sdt_ultimo_envio", String(momento)); } catch { /* sin almacenamiento: se usa la memoria */ }
}

// Muestra u oculta el mensaje de error de un campo
function mostrarError(input, mensaje) {
    const campo = input.closest(".campo");
    campo.classList.toggle("invalido", Boolean(mensaje));
    campo.querySelector(".error").textContent = mensaje || "";
    return !mensaje;
}

// Envía una copia de la consulta al correo (solo si CORREO está configurado)
function enviarCopiaAlCorreo(datos, trampa) {
    if (!CORREO) return Promise.resolve();
    return fetch(`https://formsubmit.co/ajax/${CORREO}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            _subject: `Nueva consulta web: ${datos["Interés"]} — ${datos.Nombre}`,
            _template: "table",
            _captcha: "false",
            _honey: trampa,
            ...datos
        })
    }).then((respuesta) => {
        if (!respuesta.ok) throw new Error("No se pudo enviar al correo");
    });
}

// ---------- 4. Formulario de consultas ----------
const formulario = document.getElementById("formConsulta");
const nota = document.getElementById("notaConsulta");
const campoConsulta = document.getElementById("consulta");
const contador = document.getElementById("contador");
const OPCIONES_INTERES = Array.from(document.getElementById("interes").options).map((o) => o.value).filter(Boolean);
const momentoCarga = Date.now();
let ultimoEnvio = leerUltimoEnvio();

function mostrarNota(tipo, texto) {
    nota.className = tipo === "error" ? "form-nota form-nota--error" : "form-nota";
    nota.textContent = texto;
}

// Contador de caracteres de la consulta
function actualizarContador() {
    contador.textContent = `${campoConsulta.value.length} / ${MAX_CONSULTA}`;
}
campoConsulta.addEventListener("input", actualizarContador);
actualizarContador();

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    // 1) Filtros contra robots: campo trampa lleno o formulario llenado demasiado rápido.
    //    Se responde como si todo saliera bien para no darle pistas al robot.
    const trampa = document.getElementById("trampa").value;
    if (trampa || Date.now() - momentoCarga < TIEMPO_MINIMO_MS) {
        mostrarNota("ok", "Gracias, recibimos tu consulta.");
        return;
    }

    // 2) Evita envíos repetidos seguidos
    const espera = ultimoEnvio + ESPERA_ENTRE_ENVIOS_MS - Date.now();
    if (espera > 0) {
        mostrarNota("error", `Ya enviaste una consulta. Espera ${Math.ceil(espera / 1000)} segundos para enviar otra.`);
        return;
    }

    const nombre = document.getElementById("nombre");
    const interes = document.getElementById("interes");
    const numeroElegido = formulario.querySelector('input[name="numero"]:checked')?.value;

    // 3) Limpieza y validación de cada dato
    const nombreLimpio = limpiarTexto(nombre.value, MAX_NOMBRE);
    const consultaLimpia = limpiarTexto(campoConsulta.value, MAX_CONSULTA);

    const valido = [
        mostrarError(nombre, PATRON_NOMBRE.test(nombreLimpio) ? "" : "Ingresa tu nombre usando solo letras."),
        mostrarError(interes, OPCIONES_INTERES.includes(interes.value) ? "" : "Elige una opción."),
        mostrarError(campoConsulta,
            consultaLimpia.length < 10 ? "Cuéntanos un poco más (mínimo 10 caracteres)." :
            PATRON_ENLACE.test(consultaLimpia) ? "Por seguridad, no incluyas enlaces en la consulta." : "")
    ].every(Boolean);

    if (!valido) {
        nota.textContent = "";
        formulario.querySelector(".invalido input, .invalido select, .invalido textarea")?.focus();
        return;
    }

    // 4) Solo se envía a uno de los números autorizados
    const numero = NUMEROS_PERMITIDOS.includes(numeroElegido) ? numeroElegido : NUMEROS_PERMITIDOS[0];

    const datos = {
        "Nombre": nombreLimpio,
        "Interés": interes.value,
        "Consulta": consultaLimpia
    };

    ultimoEnvio = Date.now();
    guardarUltimoEnvio(ultimoEnvio);

    // Copia al correo (se activa sola cuando se configura CORREO)
    enviarCopiaAlCorreo(datos, trampa)
        .catch(() => console.warn("La consulta no se pudo copiar al correo."));

    // Abre WhatsApp con la consulta
    abrirWhatsApp(numero,
        `Hola SDT, tengo una consulta.\n` +
        `• Nombre: ${datos.Nombre}\n` +
        `• Me interesa: ${datos["Interés"]}\n` +
        `• Consulta: ${datos.Consulta}`
    );

    mostrarNota("ok", "Se abrió WhatsApp con tu consulta. Solo presiona enviar y te responderemos a la brevedad.");
});

// Quita el error de un campo apenas la persona lo corrige
formulario.querySelectorAll("input, select, textarea").forEach((control) => {
    control.addEventListener("input", () => {
        const campo = control.closest(".campo");
        if (campo && campo.classList.contains("invalido")) mostrarError(control, "");
    });
});

// ---------- 5. Fotos: si alguna no carga (sin internet), queda un fondo de respaldo ----------
document.querySelectorAll(".foto__marco img").forEach((imagen) => {
    const marcarSinFoto = () => imagen.parentElement.classList.add("sin-foto");
    imagen.addEventListener("error", marcarSinFoto);
    if (imagen.complete && imagen.naturalWidth === 0 && imagen.src) marcarSinFoto();
});

// ---------- 6. Botón flotante ----------
document.querySelector(".whatsapp-flotante").href =
    `https://wa.me/${WHATSAPP_FLOTANTE}?text=${encodeURIComponent("Hola SDT, tengo una consulta")}`;
