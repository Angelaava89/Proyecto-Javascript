/**
 * auth.js — Deluxe Boutique
 * Validación segura de formularios + protección XSS
 *
 * FIXES aplicados:
 *  1. Se intercepta el submit ANTES de cualquier navegación
 *  2. El <a href="index.html"> dentro del botón de registro ya no navega solo
 *  3. La redirección ocurre solo si el registro/login fue exitoso
 */

// ============================================================
// 1. PROTECCIÓN XSS — Sanitización de inputs
// ============================================================

//Este bloque de código covierte caracteres peligrosos en HTML a sus versiones seguras 
function escapeHTML(str) { 
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;") 
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/`/g, "&#x60;");
}
//Este bloque de codigo  reemplaza que si el valor no es un string  retorna  vacio para evitar errores
function stripTags(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "");
}

// Sanitiza texto visible (nombre, email). NO usar en contraseñas.
//Esta funcion ocupa 2 metodos una que reemplaza los caracteres peligrosos y otra que  si no string reemplaza el codigo por nada
function sanitize(value) {
  return escapeHTML(stripTags(String(value).trim()));//función de programación que se utiliza para eliminar todas las etiquetas HTML y PHP de una cadena de texto
}

// ============================================================
// 2. REGLAS DE VALIDACIÓN
// ============================================================

const RULES = {
  nombre: {
    minLen: 2,
    maxLen: 50,
    pattern: /^[a-zA-ZÀ-ÿÑñ\s'\-]+$/,// comprueba que una palabra o frase contenga únicamente letras (incluyendo las acentuadas y la ñ), espacios y algunos caracteres especiales
    messages: {
      required: "El nombre es obligatorio.",
      minLen:   "Mínimo 2 caracteres.",
      maxLen:   "Máximo 50 caracteres.",
      pattern:  "Solo letras, espacios y guiones.",
    },
  },
  email: {
    maxLen: 254,
    pattern: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,//. Comprueba que el texto tenga el formato estándar de un email antes de permitir enviar un formulario o procesar datos. (Es decir nombre@marca.termino)
    messages: {
      required: "El correo es obligatorio.",
      maxLen:   "Máximo 254 caracteres.",
      pattern:  "Ingresa un correo válido (ej: usuario@dominio.com).",
    },
  },
  password: {
    minLen: 8,
    maxLen: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>?\/\\|`~]).+$/,//se utiliza para validar que una contraseña sea fuerte y cumpla con estrictos requisitos de seguridad
    messages: {
      required: "La contraseña es obligatoria.",
      minLen:   "Mínimo 8 caracteres.",
      maxLen:   "Máximo 128 caracteres.",
      pattern:  "Debe incluir: mayúscula, minúscula, número y símbolo (ej: !@#$).",
    },
  },
};

function validateField(fieldName, value) { //busca por clave(ej: nombre) y luego busca los valores de esa clave
  const rule = RULES[fieldName]; //Busca las reglas del campo
  if (!rule) return { valid: true, error: "" };//Si la regla no existe (o es nula/falsa), detén la función aquí mismo y devuelve que es válida sin ningún mensaje de error

  if (!value || value.length === 0)         return { valid: false, error: rule.messages.required }; //¿Es identico a cero?
  if (rule.minLen && value.length < rule.minLen) return { valid: false, error: rule.messages.minLen };//¿Es muy corta?
  if (rule.maxLen && value.length > rule.maxLen) return { valid: false, error: rule.messages.maxLen };//¿Es muy larga?
  if (rule.pattern && !rule.pattern.test(value)) return { valid: false, error: rule.messages.pattern };//¿Cumple con el patron?

  return { valid: true, error: "" }; //Todo bien 
}

// ============================================================
// 3. ALMACENAMIENTO — usuarios en localStorage
//    Contraseñas hasheadas con SHA-256 (Web Crypto API)
// ============================================================

const STORAGE_KEY = "deluxe_users";
//Convierte la contraseña en un hash SHA-256 usando la API nativa del navegador (crypto.subtle).
//bytes con TextEncoder → hash binario → cada byte se convierte a hexadecimal de 2 dígitos → se unen en un string de 64 caracteres.
async function hashPassword(password) {
  const data    = new TextEncoder().encode(password); //Convierte texto a bytes
  const buffer  = await crypto.subtle.digest("SHA-256", data); //Aplica el algoritmo SHA-256
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0")) //Convierte cada byte a hexadecimal de 2 digitos
    .join(""); //Une todo un string de 64 caracteres hexadecimales
}


// localStorage : Esta propiedad te da acceso a un objeto de almacenamiento web que te permite guardar datos en el navegador de forma persistente (local)
////getUsers() lee el arreglo de usuarios guardado en localStorage bajo la clave "deluxe_users". Si no existe o está corrupto, retorna un arreglo vacío.
function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } //json.parse convierte una cadena de texto json a un objeto de javascript 
  catch { return []; }
}localStorage

//saveUsers() sobreescribe ese arreglo con la versión actualizada, convirtiéndolo a JSON.
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); //stringify es una función que convierte un objeto o estructura de datos en una cadena de texto
}

function registerUser(nombre, email, passwordHash) {
  const users      = getUsers();
  const emailLower = email.toLowerCase(); // Esto es un lower() de python
  if (users.some(u => u.email === emailLower)) { //Verifica si el email existe
    return { ok: false, message: "Ya existe una cuenta con ese correo." };
  }
  const newUser = {
    id:           (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()), //randomUUID es un identificador alfanumerico unico de 128 bts
    nombre,
    email:        emailLower, 
    passwordHash, //la password encriptada
    createdAt:    new Date().toISOString(), //toISOString() es un método de JavaScript que convierte un objeto de fecha (tipo Date) en una cadena de texto estandarizada según el formato internacional ISO 8601.
  };

  users.push(newUser); // Agrega el nuevo usuario a la lista
  saveUsers(users); //Guarda la lista actualizada
  return { ok: true, message: `¡Bienvenido, ${escapeHTML(nombre)}! Redirigiendo...` };
}

function loginUser(email, passwordHash) { //Agrega el email y la password 
  const users      = getUsers();
  const emailLower = email.toLowerCase();
  const user       = users.find(u => u.email === emailLower && u.passwordHash === passwordHash); //Para encontrarlo, debe coincidir el email y la contrasena

  if (!user) {//Si es distinto de la variable user correo o contraseña incorrecto
    return { ok: false, message: "Correo o contraseña incorrectos." };
  }

  sessionStorage.setItem( //Guarda la sesión del usuario en sessionStorage
    "deluxe_session",
    JSON.stringify({ id: user.id, nombre: user.nombre, email: user.email })//Json se transforma el  cadena de texto plano, por eso no esta la contraseña 
  );
  return { ok: true, message: `¡Hola de nuevo, ${escapeHTML(user.nombre)}! Redirigiendo...` };
}

// ============================================================
// 4. FEEDBACK VISUAL — mensajes de error por campo
// ============================================================
//setFieldError pinta el campo de rojo o verde y muestra o borra el mensaje de error debajo de él.
function setFieldError(input, message) { //input es el campo del formulario, message es el texto de error, si es "" no hay error
  if (!input) return; //si el usuario no relleno el campo, la funcion se detiene 
  let el = input.parentElement.querySelector(".field-error"); //Busca dentro del div padre un elemento con la clase field-error, para reutilizarlo si ya existe y no crearlo multiples veces
  if (!el) {// si no existe la variable el (o un elemento de error), entonces la crea
    el = document.createElement("small"); //Crea un elemento small (texto secundario) en memoria que vendria siendo una etiqueta en el formulario
    el.className  = "field-error";// Creado la clase field-error dentro de esa etiqueta small
    el.style.cssText =
      "color:#e74c3c;font-size:.78rem;display:block;margin-top:4px;text-align:left;padding-left:4px;";
    input.parentElement.appendChild(el);
  }
  el.textContent          = message;          // textContent — nunca innerHTML
  input.style.borderColor = message ? "#e74c3c" : "#2ecc71";
  
}

function showFormMessage(form, message, isError = false) {
  let el = form.querySelector(".form-message"); //Busca si a existe el mensaje general del formulario para reutilizarlo, si no existe lo crea
  if (!el) { //Si no existe el mensaje:
    el = document.createElement("p"); //Crea un elemento parrafo
    el.className  = "form-message"//le asigna la clase form-message, que significa que es un mensaje general del formulario, no de un campo específico
    el.style.cssText = //estilo 
      "font-weight:600;font-size:.9rem;margin-top:14px;padding:10px 16px;" +
      "border-radius:8px;text-align:center;transition:all .3s;";
    form.appendChild(el); //agrega el mensaje al final del formulario
  }
  el.textContent       = message;             // textContent — nunca innerHTML
  
  el.style.color       = isError ? "#c0392b" : "#1e8449"; // isError --> es false? si es false = true (color rojo) / si es true= false  (color verde)
  el.style.border      = `1px solid ${isError ? "#e74c3c" : "#2ecc71"}`;
}

// ============================================================
// 5. FORMULARIO DE REGISTRO  (form.registro en registro.html)
// ============================================================

function initRegistroForm() { //Inicializa el formulario de registro 
  const form = document.querySelector("form.registro"); //Busca el elemento de tipo form con la clase registro, si no lo encuentra, detiene la función
  if (!form) return;
//Los siguientes campos son para seleccionar y guardar en variables los tres campos  principales
  const inputNombre   = form.querySelector('input[placeholder="Nombre"]');
  const inputEmail    = form.querySelector('input[placeholder="Email"]');
  const inputPassword = form.querySelector('input[placeholder="Password"]');

  // Validación en tiempo real al salir del campo, mostrando el error especifico de cada campo 
  inputNombre  ?.addEventListener("blur", () =>  //blur se dispara cuando un campo pierde el foco,cuando el usuario hace clic fuera del campo de texto o cambia de casilla
    setFieldError(inputNombre,   validateField("nombre",   sanitize(inputNombre.value)).error));
  inputEmail   ?.addEventListener("blur", () =>
    setFieldError(inputEmail,    validateField("email",    sanitize(inputEmail.value)).error));
  inputPassword?.addEventListener("blur", () =>
    setFieldError(inputPassword, validateField("password", inputPassword.value.trim()).error));

  // Envío
  form.addEventListener("submit", async e => {
    e.preventDefault();   // ← detiene TODO: recarga y navegación
    //obtiene y limpia los valores
    const nombre   = sanitize(inputNombre?.value   || ""); //consigue el texto escrito en el campo, si no hay nada lo usa vacio
    const email    = sanitize(inputEmail?.value    || "");
    const password = (inputPassword?.value || "").trim(); // sin sanitize: preserva símbolos, trim es para sacar los espacios

    //valida campos
    const vN = validateField("nombre",   nombre);
    const vE = validateField("email",    email);
    const vP = validateField("password", password);

    //muestra errores específicos de cada campo
    setFieldError(inputNombre,   vN.error);
    setFieldError(inputEmail,    vE.error);
    setFieldError(inputPassword, vP.error);

    if (!vN.valid || !vE.valid || !vP.valid) { // Si el valor vN no es valido o vE no es valido o vP no es valido , entonces muestra el mensaje "Corrige los errores antes de continuar."  
      showFormMessage(form, "Corrige los errores antes de continuar.", true);
      return;
    }

    const passwordHash = await hashPassword(password);// await sirve  para dar un tiempo antes de hashear la contraseña (para que todo seavalido antes de hacerlo)
    const result       = registerUser(nombre, email, passwordHash);

    showFormMessage(form, result.message, !result.ok); //! result.ok es una pregunta ¿Es un error o exito?
// Si  los resultados no tienen errores, el formulario queda vacio y se redirecciona al formulario de inicio
    if (result.ok) { 
      form.reset();
      setTimeout(() => { window.location.href = "index.html#inicio-sesion"; }, 2000);
    }
  });
}

// ============================================================
// 6. FORMULARIO DE LOGIN  (form.inicio en index.html)
// ============================================================

function initLoginForm() {
  const form = document.querySelector("form.inicio"); //buscando el elemento form con la clase inicio
  if (!form) return; //si no lo encuentra, detiene la función

  const inputEmail    = form.querySelector('input[placeholder="Email"]'); //extraemos el campo email
  const inputPassword = form.querySelector('input[placeholder="Password"]');//extraemos el campo contraseña

  inputEmail?.addEventListener("blur", () => ////blur se dispara cuando un campo pierde el foco,cuando el usuario hace clic fuera del campo de texto o cambia de casilla
    setFieldError(inputEmail,    validateField("email",    sanitize(inputEmail.value)).error)); // verifica que el email no tenga errores , de tal forma que si existe un error con setFieldError lanzará un mensaje sea verde o rojo
  inputPassword?.addEventListener("blur", () => {
    const val = (inputPassword.value || "").trim();//consigue  la password hasheada y si no lo deha como campa vacio
    setFieldError(inputPassword, val ? "" : "La contraseña es obligatoria.");//tira el mensaje y el color rojo 
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();   // ← detiene recarga de página

    const email    = sanitize(inputEmail?.value    || ""); //esto realiza la limpieza del campo email, si no hay nada lo usa vacio
    const password = (inputPassword?.value || "").trim(); // Obtener el texto del campo contraseña y si no hay nada usa texto vacio

    const vE = validateField("email", email);
    setFieldError(inputEmail, vE.error);//Verifica que el email ingresado sea el mismo que el registrado y si no lanza un error

    const passwordVacia = !password;
    setFieldError(inputPassword, passwordVacia ? "La contraseña es obligatoria." : ""); //verifica que el campo contraseña no este vacio, si esta vacio lanza un mensaje de error y pinta el campo de rojo, si no esta vacio borra el mensaje de error y pinta el campo de verde

    if (!vE.valid || passwordVacia) {
      showFormMessage(form, "Completa todos los campos correctamente.", true);
      return; //Si el email no es valido o la contraseña esta vacia, muestra el mensaje "Completa todos los campos correctamente." y detiene la función
    }

    const passwordHash = await hashPassword(password); //Espera a que valide todo para hashear la contrasena
    const result       = loginUser(email, passwordHash); // Ingresa  el usuario con su contraseña

    showFormMessage(form, result.message, !result.ok); //¿Esta todo correcto?
//Si el resultado esta correcto se redirecciona al  index  y el formulario queda vacio
    if (result.ok) {
      form.reset();
      setTimeout(() => { window.location.href = "index.html"; }, 1500);
    }
  });
}

// ============================================================
// 7. ARRANQUE
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initRegistroForm();
  initLoginForm();
});
