// Reemplazo de window.storage (disponible solo dentro de un Artifact de Claude)
// usando localStorage del navegador, para que la app funcione como proyecto
// independiente.
//
// AVISO IMPORTANTE: localStorage es local a CADA navegador/dispositivo.
// Dentro del Artifact de Claude, las claves guardadas con shared=true se
// comparten entre todos los usuarios (por eso ahí los comentarios y las
// cuentas eran "reales" entre distintas personas). Aquí, sin un backend
// propio, TODO queda guardado solo en el navegador de cada persona: si
// alguien crea una cuenta en su celular, no podrá iniciar sesión con ese
// mismo correo desde otro dispositivo, y los comentarios que escriba solo
// los verá ella misma. Para que las cuentas y comentarios sean de verdad
// compartidos entre usuarios necesitas un backend (por ejemplo una API en
// Node.js con una base de datos) — puedo ayudarte a construir uno si
// llegas a ese punto.

const PREFIX = "mangaverso:";

function fullKey(key, shared) {
  return `${PREFIX}${shared ? "shared:" : "local:"}${key}`;
}

window.storage = {
  async get(key, shared = false) {
    const raw = localStorage.getItem(fullKey(key, shared));
    if (raw === null) return null;
    return { key, value: raw, shared };
  },
  async set(key, value, shared = false) {
    localStorage.setItem(fullKey(key, shared), value);
    return { key, value, shared };
  },
  async delete(key, shared = false) {
    const existed = localStorage.getItem(fullKey(key, shared)) !== null;
    localStorage.removeItem(fullKey(key, shared));
    return { key, deleted: existed, shared };
  },
  async list(prefix = "", shared = false) {
    const scope = `${PREFIX}${shared ? "shared:" : "local:"}${prefix}`;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(scope)) keys.push(k.slice(`${PREFIX}${shared ? "shared:" : "local:"}`.length));
    }
    return { keys, prefix, shared };
  },
};
