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
