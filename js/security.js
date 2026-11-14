// Helpers para insertar datos de usuarios en el HTML sin abrir la puerta a XSS.
// Regla: todo dato que venga de la base de datos o de un usuario pasa por
// alguna de estas funciones antes de llegar a innerHTML.

import DOMPurify from 'dompurify';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Texto plano → seguro como contenido HTML o como valor de atributo entre comillas. */
export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/** Argumento string para un handler inline: onclick="fn(${jsArg(id)})". */
export function jsArg(value) {
    return escapeHtml(JSON.stringify(String(value ?? '')));
}

/** URL http(s) o relativa, escapada para un atributo; cualquier otra cosa → ''. */
export function safeUrl(url) {
    if (!url) return '';
    try {
        const { protocol } = new URL(String(url), window.location.origin);
        return protocol === 'http:' || protocol === 'https:' ? escapeHtml(url) : '';
    } catch {
        return '';
    }
}

const TRUSTED_IFRAME_SRC = /^https:\/\/www\.(youtube|youtube-nocookie)\.com\/embed\/[\w-]{11}(\?|$)/;

DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    if (node.nodeName === 'IFRAME' && data.attrName === 'src' && !TRUSTED_IFRAME_SRC.test(data.attrValue)) {
        data.keepAttr = false;
    }
});

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.nodeName === 'A' && node.hasAttribute('target')) {
        node.setAttribute('rel', 'noopener noreferrer');
    }
});

/** HTML con formato (Quill, Editor.js, Markdown) → sin scripts; solo iframes de YouTube. */
export function sanitizeHtml(html) {
    return DOMPurify.sanitize(String(html ?? ''), {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target'],
    });
}
