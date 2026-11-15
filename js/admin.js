// Panel de administración (/admin): resumen, usuarios y postulaciones del campamento.
// Los permisos los controla el servidor en cada pedido; esta página solo muestra lo que la API devuelve.
// Todo dato que viene de la base se escapa con escapeHtml antes de insertarlo en el HTML.
import { escapeHtml } from './security.js';
import * as api from './api.js';

const $ = (selector) => document.querySelector(selector);

const ROLES = { miliciano: 'Miliciano', redactor: 'Redactor', admin: 'Admin' };
const STATUS = {
    active: ['Activa', 'bg-secondary-fixed text-on-secondary-fixed-variant'],
    pending_invite: ['Invitación pendiente', 'bg-tertiary-fixed text-on-tertiary-fixed-variant'],
    unverified: ['Sin confirmar email', 'bg-surface-container-high text-on-surface-variant'],
    suspended: ['Suspendida', 'bg-error-container text-on-error-container'],
};
const TABS = ['resumen', 'usuarios', 'postulaciones'];

const dateFormat = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const relativeFormat = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

let users = [];
let postulaciones = null;

// ─── Utilidades ───────────────────────────────────────────────────────────

function showView(id) {
    for (const view of ['loading-view', 'login-view', 'denied-view', 'panel-view']) {
        document.getElementById(view).hidden = view !== id;
    }
}

let toastTimer;
function toast(message, type = 'success') {
    const el = $('#toast');
    el.textContent = message;
    el.classList.toggle('bg-secondary', type === 'success');
    el.classList.toggle('bg-error', type === 'error');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 5000);
}

function formatDate(iso, withTime = false) {
    return iso ? (withTime ? dateTimeFormat : dateFormat).format(new Date(iso)) : '—';
}

function timeAgo(iso) {
    if (!iso) return 'Nunca';
    const days = Math.round((new Date(iso) - Date.now()) / 86400000);
    if (days === 0) return 'Hoy';
    if (days > -30) return relativeFormat.format(days, 'day');
    return formatDate(iso);
}

/** Texto en minúsculas y sin tildes, para buscar "lucia" y encontrar "Lucía". */
function normalize(text) {
    return String(text ?? '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function fullName(user) {
    return `${user.first_name} ${user.last_name}`.trim();
}

// ─── Sesión ───────────────────────────────────────────────────────────────

function render() {
    const user = api.auth.user();
    $('#session-bar').hidden = !user;
    $('#session-name').textContent = user ? fullName(user) : '';

    if (!user) return showView('login-view');
    if (user.role !== 'admin') return showView('denied-view');
    showView('panel-view');
    openTab(location.hash.slice(1));
}

$('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.submitter;
    const error = $('#login-error');
    error.hidden = true;
    button.disabled = true;
    try {
        await api.auth.login($('#login-email').value, $('#login-password').value);
        $('#login-password').value = '';
    } catch (err) {
        error.textContent = err.message;
        error.hidden = false;
    } finally {
        button.disabled = false;
    }
});

$('#logout').addEventListener('click', async () => {
    try {
        await api.auth.logout();
    } catch (err) {
        toast(err.message, 'error');
    }
});

// ─── Pestañas ─────────────────────────────────────────────────────────────

const loaders = { resumen: loadSummary, usuarios: loadUsers, postulaciones: loadPostulaciones };

function openTab(name) {
    const tab = TABS.includes(name) ? name : 'resumen';
    for (const other of TABS) document.getElementById(`tab-${other}`).hidden = other !== tab;
    document.querySelectorAll('.tab').forEach((link) => {
        const active = link.dataset.tab === tab;
        link.classList.toggle('border-primary', active);
        link.classList.toggle('text-primary', active);
        link.classList.toggle('border-transparent', !active);
        link.classList.toggle('text-on-surface-variant', !active);
        link.setAttribute('aria-current', active ? 'page' : 'false');
    });
    loaders[tab]();
}

window.addEventListener('hashchange', () => {
    if (api.auth.user()?.role === 'admin') openTab(location.hash.slice(1));
});

/** Ejecuta un pedido mostrando el error si falla (si la sesión venció, la página vuelve al login sola). */
async function attempt(fn) {
    try {
        return await fn();
    } catch (err) {
        if (err.status !== 401) toast(err.message, 'error');
        return undefined;
    }
}

// ─── Resumen ──────────────────────────────────────────────────────────────

function card(title, value, detail) {
    return `<div class="bg-white rounded-xl border border-outline-variant/60 p-5">
        <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">${escapeHtml(title)}</p>
        <p class="font-headline text-4xl font-extrabold tracking-tight mt-2">${escapeHtml(value)}</p>
        <p class="text-sm text-on-surface-variant mt-1">${escapeHtml(detail)}</p>
    </div>`;
}

const lastWeek = (n) => (n === 1 ? '1 nuevo en los últimos 7 días' : `${n} nuevos en los últimos 7 días`);

async function loadSummary() {
    const data = await attempt(() => api.admin.summary());
    if (!data) return;
    const { users: u, roles, posts, comments, notes, postulaciones: p } = data;
    $('#summary-cards').innerHTML = [
        card('Usuarios', u.total, `${lastWeek(u.last_week)} · ${u.active_last_week === 1 ? '1 usó' : `${u.active_last_week} usaron`} el sitio esta semana`),
        card('Admins y redactores', roles.admin + roles.redactor, `${roles.admin} admin · ${roles.redactor} redactor · ${roles.miliciano} miliciano`),
        card('Postulaciones al campamento', p.total, p.last_week === 1 ? '1 nueva en los últimos 7 días' : `${p.last_week} nuevas en los últimos 7 días`),
        card('Posts del foro', posts.total, lastWeek(posts.last_week)),
        card('Comentarios', comments.total, lastWeek(comments.last_week)),
        card('Notas publicadas', notes.total, notes.last_week === 1 ? '1 nueva en los últimos 7 días' : `${notes.last_week} nuevas en los últimos 7 días`),
    ].join('');
}

// ─── Usuarios ─────────────────────────────────────────────────────────────

async function loadUsers() {
    const list = await attempt(() => api.admin.users());
    if (!list) return;
    users = list;
    renderUsers();
}

function userRow(user) {
    const [statusLabel, statusClass] = STATUS[user.status] ?? [user.status, ''];
    const roleOptions = Object.entries(ROLES)
        .map(([value, label]) => `<option value="${value}"${value === user.role ? ' selected' : ''}>${label}</option>`)
        .join('');

    let action = '';
    if (user.status === 'pending_invite') action = `<button data-action="resend" class="font-semibold text-tertiary hover:underline">Reenviar invitación</button>`;
    else if (user.status === 'suspended') action = `<button data-action="reactivate" class="font-semibold text-secondary hover:underline">Reactivar</button>`;
    else if (!user.is_me) action = `<button data-action="suspend" class="font-semibold text-error hover:underline">Suspender</button>`;

    return `<tr data-id="${Number(user.id)}">
        <td class="px-4 py-3">
            <p class="font-semibold">${escapeHtml(fullName(user))}${user.is_me ? ' <span class="text-xs font-normal text-on-surface-variant">(vos)</span>' : ''}</p>
            <p class="text-on-surface-variant">${escapeHtml(user.email)}</p>
        </td>
        <td class="px-4 py-3">
            <select data-action="role" aria-label="Rol de ${escapeHtml(fullName(user))}" class="rounded-lg border border-outline-variant px-2 py-1 bg-white disabled:opacity-60"
                ${user.is_me ? 'disabled title="No podés cambiar tu propio rol"' : ''}>${roleOptions}</select>
        </td>
        <td class="px-4 py-3"><span class="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${statusClass}">${escapeHtml(statusLabel)}</span></td>
        <td class="px-4 py-3 whitespace-nowrap">${formatDate(user.created_at)}</td>
        <td class="px-4 py-3 whitespace-nowrap">${escapeHtml(timeAgo(user.last_seen_at))}</td>
        <td class="px-4 py-3 text-right whitespace-nowrap">${action}</td>
    </tr>`;
}

function renderUsers() {
    const query = normalize($('#user-search').value.trim());
    const role = $('#user-role-filter').value;
    const status = $('#user-status-filter').value;
    const visible = users.filter((u) =>
        (!query || normalize(`${fullName(u)} ${u.email}`).includes(query))
        && (!role || u.role === role)
        && (!status || u.status === status));

    $('#users-body').innerHTML = visible.length
        ? visible.map(userRow).join('')
        : `<tr><td colspan="6" class="px-4 py-8 text-center text-on-surface-variant">No hay usuarios que coincidan.</td></tr>`;
    $('#users-count').textContent = visible.length === users.length
        ? `${users.length} ${users.length === 1 ? 'cuenta' : 'cuentas'}`
        : `${visible.length} de ${users.length} cuentas`;
}

function replaceUser(updated) {
    const index = users.findIndex((u) => u.id === updated.id);
    if (index === -1) users.unshift(updated);
    else users[index] = updated;
    renderUsers();
}

for (const id of ['#user-search', '#user-role-filter', '#user-status-filter']) {
    $(id).addEventListener('input', renderUsers);
}

$('#users-body').addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const user = users.find((u) => u.id === Number(button.closest('tr').dataset.id));
    if (!user) return;
    const name = fullName(user);

    let request;
    if (button.dataset.action === 'suspend') {
        if (!confirm(`¿Suspender la cuenta de ${name}?\n\nNo va a poder entrar más (se le cierra la sesión ahora). Lo que publicó se conserva y podés reactivarla cuando quieras.`)) return;
        request = () => api.admin.suspend(user.id);
    } else if (button.dataset.action === 'reactivate') {
        request = () => api.admin.reactivate(user.id);
    } else if (button.dataset.action === 'resend') {
        request = () => api.admin.resendInvitation(user.id);
    } else {
        return;
    }

    button.disabled = true;
    const result = await attempt(request);
    button.disabled = false;
    if (result) {
        replaceUser(result.user);
        toast(result.message);
    }
});

$('#users-body').addEventListener('change', async (event) => {
    const select = event.target.closest('select[data-action="role"]');
    if (!select) return;
    const user = users.find((u) => u.id === Number(select.closest('tr').dataset.id));
    if (!user) return;

    const role = select.value;
    const warning = role === 'admin'
        ? '\n\nLos admins ven los datos personales de las postulaciones y pueden crear, cambiar y suspender cuentas.'
        : '';
    if (!confirm(`¿Cambiar el rol de ${fullName(user)} a ${ROLES[role]}?${warning}`)) {
        select.value = user.role;
        return;
    }
    select.disabled = true;
    const result = await attempt(() => api.admin.changeRole(user.id, role));
    if (result) {
        replaceUser(result.user);
        toast(result.message);
    } else {
        select.value = user.role;
        select.disabled = false;
    }
});

// Nuevo usuario (invitación por email).
const newUserForm = $('#new-user-form');

$('#new-user-toggle').addEventListener('click', () => {
    newUserForm.hidden = !newUserForm.hidden;
    if (!newUserForm.hidden) newUserForm.elements.first_name.focus();
});

$('#new-user-cancel').addEventListener('click', () => {
    newUserForm.reset();
    newUserForm.hidden = true;
});

newUserForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.submitter;
    const data = Object.fromEntries(new FormData(newUserForm));
    if (data.role === 'admin' && !confirm(`¿Crear a ${data.first_name} como Admin?\n\nLos admins ven los datos personales de las postulaciones y pueden crear, cambiar y suspender cuentas.`)) return;

    button.disabled = true;
    const result = await attempt(() => api.admin.createUser(data));
    button.disabled = false;
    if (result) {
        newUserForm.reset();
        newUserForm.hidden = true;
        replaceUser(result.user);
        toast(result.message);
    }
});

// ─── Postulaciones del campamento ─────────────────────────────────────────

async function loadPostulaciones() {
    const data = await attempt(() => api.admin.postulaciones());
    if (!data) return;
    postulaciones = data.postulaciones;
    renderPostulaciones();
}

function whatsappCell(number) {
    const digits = String(number ?? '').replace(/\D/g, '');
    const text = escapeHtml(number);
    return digits ? `<a href="https://wa.me/${digits}" target="_blank" rel="noopener" class="text-secondary font-semibold hover:underline">${text}</a>` : text;
}

function renderPostulaciones() {
    if (!postulaciones) return;
    const query = normalize($('#post-search').value.trim());
    const visible = postulaciones.filter((p) => !query || normalize(`${p.nombre} ${p.ciudad} ${p.carrera} ${p.whatsapp}`).includes(query));

    $('#postulaciones-body').innerHTML = visible.length
        ? visible.map((p) => `<tr>
            <td class="px-4 py-3 whitespace-nowrap">${formatDate(p.created_at, true)}</td>
            <td class="px-4 py-3 font-semibold">${escapeHtml(p.nombre)}</td>
            <td class="px-4 py-3 whitespace-nowrap">${whatsappCell(p.whatsapp)}</td>
            <td class="px-4 py-3">${escapeHtml(p.ciudad)}</td>
            <td class="px-4 py-3">${escapeHtml(p.carrera)}</td>
            <td class="px-4 py-3 min-w-[16rem] text-on-surface-variant">${escapeHtml(p.motivacion ?? '')}</td>
        </tr>`).join('')
        : `<tr><td colspan="6" class="px-4 py-8 text-center text-on-surface-variant">${postulaciones.length ? 'No hay postulaciones que coincidan.' : 'Todavía no hay postulaciones.'}</td></tr>`;
    $('#postulaciones-count').textContent = visible.length === postulaciones.length
        ? `${postulaciones.length} ${postulaciones.length === 1 ? 'postulación' : 'postulaciones'}`
        : `${visible.length} de ${postulaciones.length} postulaciones`;
}

$('#post-search').addEventListener('input', renderPostulaciones);

// ─── Arranque ─────────────────────────────────────────────────────────────

api.auth.refresh()
    .catch((err) => toast(err.message, 'error'))
    .finally(() => {
        render();
        api.auth.onChange(render); // después: login y logout vuelven a dibujar la página
    });
