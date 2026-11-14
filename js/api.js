// Cliente de la API propia (api/ en PHP). Reemplaza a Supabase.
// Maneja la sesión (cookie HttpOnly que pone el servidor + token CSRF) y convierte los errores
// en excepciones con el mensaje del servidor, que ya viene listo para mostrarle al usuario.

let csrfToken = null;
let currentUser = null;
const listeners = new Set();

async function request(method, path, body) {
    const headers = { Accept: 'application/json' };
    const isForm = body instanceof FormData;
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
    if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken;

    let response;
    try {
        response = await fetch(`/api${path}`, {
            method,
            headers,
            credentials: 'same-origin',
            body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
        });
    } catch {
        throw Object.assign(new Error('No hay conexión con el servidor. Revisá tu internet.'), { status: 0 });
    }

    const data = await response.json().catch(() => ({}));
    // Las respuestas de /auth traen el usuario y el token CSRF de la sesión actual.
    if ('csrf_token' in data) csrfToken = data.csrf_token;
    if (path.startsWith('/auth/') && 'user' in data) setUser(data.user);

    if (!response.ok) {
        if (response.status === 401 && currentUser) setUser(null); // la sesión venció
        throw Object.assign(new Error(data.error || 'Ocurrió un error inesperado.'), { status: response.status });
    }
    return data;
}

function setUser(user) {
    const changed = JSON.stringify(user) !== JSON.stringify(currentUser);
    currentUser = user;
    if (changed) listeners.forEach((fn) => fn(user));
}

const get = (path) => request('GET', path);
const post = (path, body = {}) => request('POST', path, body);

export const auth = {
    /** Usuario logueado ({ id, email, first_name, last_name, role }) o null. */
    user: () => currentUser,
    isModerator: () => ['admin', 'redactor'].includes(currentUser?.role),
    /** Llama a fn(user) cada vez que alguien entra o sale. */
    onChange(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
    },
    /** Pregunta al servidor quién está logueado (se hace una vez al cargar la página). */
    refresh: () => get('/auth/me').then((data) => data.user),
    register: (data) => post('/auth/register', data),
    login: (email, password) => post('/auth/login', { email, password }),
    logout: () => post('/auth/logout'),
    verifyEmail: (token) => post('/auth/verify-email', { token }),
    forgotPassword: (email) => post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => post('/auth/reset-password', { token, password }),
};

export const posts = {
    list: () => get('/posts').then((data) => data.posts),
    create: (data) => post('/posts', data).then((res) => res.post),
    remove: (id) => request('DELETE', `/posts/${id}`),
    toggleLike: (id) => post(`/posts/${id}/like`),
    vote: (id, optionId) => post(`/posts/${id}/poll/vote`, { option_id: optionId }).then((res) => res.poll),
    revealResults: (id) => post(`/posts/${id}/poll/reveal`).then((res) => res.poll),
};

export const comments = {
    list: (postId) => get(`/posts/${postId}/comments`).then((data) => data.comments),
    create: (postId, content) => post(`/posts/${postId}/comments`, { content }).then((res) => res.comment),
    remove: (id) => request('DELETE', `/comments/${id}`),
};

export const notes = {
    list: () => get('/notes').then((data) => data.notes),
    get: (id) => get(`/notes/${id}`).then((data) => data.note),
    tags: () => get('/notes/tags').then((data) => data.tags),
    latestDraft: () => get('/notes/drafts/latest').then((data) => data.note),
    create: (data) => post('/notes', data).then((res) => res.note),
    update: (id, data) => request('PUT', `/notes/${id}`, data).then((res) => res.note),
    remove: (id) => request('DELETE', `/notes/${id}`),
};

/** Sube una imagen (kind: 'post' o 'note') y devuelve su URL. */
export async function uploadImage(file, kind) {
    const form = new FormData();
    form.append('image', file);
    const data = await request('POST', `/uploads?kind=${encodeURIComponent(kind)}`, form);
    return data.url;
}
