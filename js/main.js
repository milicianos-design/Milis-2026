const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL; // Vercel inyectará esto en producción
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY; // Vercel inyectará esto en producción

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    if (SUPABASE_URL && SUPABASE_KEY) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error("⚠️ [Milicianos] Error crítico: Las credenciales de Supabase están vacías. Configura SUPABASE_URL y SUPABASE_KEY para que la plataforma funcione.");
    }
}

// --- Toast notification System ---
const injectToastStyles = () => {
    if (document.getElementById('toast-styles')) return;
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.innerHTML = `
        .toast-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 1000;
            pointer-events: none;
        }
        .toast {
            pointer-events: auto;
            min-width: 280px;
            max-width: 400px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            padding: 16px 20px;
            box-shadow: 0 10px 30px -5px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(120%);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            opacity: 0;
        }
        .dark .toast {
            background: rgba(24, 24, 27, 0.85);
            border-color: rgba(255, 255, 255, 0.05);
        }
        .toast.show {
            transform: translateX(0);
            opacity: 1;
        }
        .toast-icon {
            width: 36px;
            height: 36px;
            border-radius: 12px;
            display: flex;
            items-center;
            justify-content: center;
            flex-shrink: 0;
        }
        .toast-success .toast-icon { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .toast-error .toast-icon { background: rgba(150, 3, 23, 0.1); color: #960317; }
        .toast-info .toast-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        
        .toast-content { flex: 1; }
        .toast-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
        .toast-message { font-size: 13px; font-weight: 500; color: #52525b; line-height: 1.4; }
        .dark .toast-message { color: #a1a1aa; }
    `;
    document.head.appendChild(style);
};

const showToast = (message, type = 'info') => {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'check_circle',
        error: 'warning',
        info: 'info'
    };

    const titles = {
        success: 'Éxito en la Operación',
        error: 'Falla Estratégica',
        info: 'Comunicación'
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <span class="material-symbols-outlined">${icons[type]}</span>
        </div>
        <div class="toast-content">
            <div class="toast-title text-${type === 'error' ? '[#960317]' : (type === 'success' ? 'green-500' : 'blue-500')}">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 4500);
};

injectToastStyles();

// --- Auth Modal Injection ---
function injectAuthModal() {
    if (document.getElementById('auth-modal')) return;

    const modalHTML = `
    <div id="auth-modal" class="fixed inset-0 z-[100] hidden flex items-center justify-center bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300 opacity-0">
        <div class="glass-card w-full max-w-lg p-8 sm:p-12 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/20 mx-4">
            <div class="absolute top-0 right-0 p-8">
                <button id="close-auth-modal" class="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors group">
                    <span class="material-symbols-outlined text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-white transition-colors">close</span>
                </button>
            </div>
            
            <div id="auth-modal-content" class="space-y-8">
                <div class="space-y-2">
                    <h2 id="auth-title" class="text-4xl font-extrabold tracking-tighter mb-2">Ingresar</h2>
                    <p id="auth-desc" class="text-zinc-500 font-medium">Accede a la plataforma de Milicianos.</p>
                </div>
                
                <form id="auth-form" class="space-y-6">
                    <div id="name-fields" class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 hidden">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 pl-1">Nombre</label>
                            <input type="text" id="first-name" class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-[#960317]/10 focus:border-[#960317] outline-none transition-all" placeholder="Juan">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 pl-1">Apellido</label>
                            <input type="text" id="last-name" class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-[#960317]/10 focus:border-[#960317] outline-none transition-all" placeholder="Pérez">
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 pl-1">Email Institucional</label>
                        <input type="email" id="auth-email" required class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-[#960317]/10 focus:border-[#960317] outline-none transition-all" placeholder="n.apellido@fasta.org.ar">
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center px-1">
                            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Contraseña</label>
                            <button id="forgot-pass-btn" type="button" class="text-[10px] font-bold text-[#960317] uppercase tracking-wider hover:underline">Olvidé mi clave</button>
                        </div>
                        <div id="pass-field-container">
                            <input type="password" id="auth-pass" class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-[#960317]/10 focus:border-[#960317] outline-none transition-all" placeholder="••••••••">
                        </div>
                    </div>

                    <button type="submit" id="auth-submit" class="w-full py-5 bg-gradient-to-br from-[#960317] to-[#b9252b] text-white rounded-2xl font-bold shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all text-xl mt-4">
                        Continuar Operación
                    </button>
                </form>

                <div class="pt-6 text-center border-t border-zinc-100 dark:border-zinc-800">
                    <p id="auth-switch-text" class="text-zinc-500 font-medium">
                        ¿primera vez en el sitio? 
                        <button id="auth-switch-btn" class="text-[#960317] font-bold hover:underline transition-colors ml-1">Registrate</button>
                    </p>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupAuthModalEvents();
}

function setupAuthModalEvents() {
    const modal = document.getElementById('auth-modal');
    const closeBtn = document.getElementById('close-auth-modal');
    const authForm = document.getElementById('auth-form');
    const switchBtn = document.getElementById('auth-switch-btn');
    const nameFields = document.getElementById('name-fields');
    const authTitle = document.getElementById('auth-title');
    const authDesc = document.getElementById('auth-desc');
    const authSubmit = document.getElementById('auth-submit');
    const switchText = document.getElementById('auth-switch-text');

    let mode = 'login'; // 'login' or 'signup'

    const toggleMode = (targetMode) => {
        if (targetMode) mode = targetMode;
        else mode = mode === 'login' ? 'signup' : 'login';

        const passContainer = document.getElementById('pass-field-container');
        const forgotLink = document.getElementById('forgot-pass-btn');

        if (mode === 'signup') {
            authTitle.innerText = "Crear Cuenta";
            authDesc.innerText = "Sumate a la Agrupación Milicianos";
            nameFields.classList.remove('hidden');
            passContainer.classList.remove('hidden');
            forgotLink.classList.add('hidden');
            authSubmit.innerText = "Registrarse";
            switchText.innerHTML = `¿Ya tienes cuenta? <button id="auth-switch-btn" class="text-[#960317] font-bold hover:underline">Ingresar</button>`;
        } else if (mode === 'login') {
            authTitle.innerText = "Ingresar";
            authDesc.innerText = "Accede a la plataforma Milicianos.";
            nameFields.classList.add('hidden');
            passContainer.classList.remove('hidden');
            forgotLink.classList.remove('hidden');
            authSubmit.innerText = "Continuar";
            switchText.innerHTML = `¿No tienes cuenta? <button id="auth-switch-btn" class="text-[#960317] font-bold hover:underline">Registrate</button>`;
        } else if (mode === 'forgot') {
            authTitle.innerText = "Recuperar Acceso";
            authDesc.innerText = "Te enviaremos un email para restablecer tu clave.";
            nameFields.classList.add('hidden');
            passContainer.classList.add('hidden');
            forgotLink.classList.add('hidden');
            authSubmit.innerText = "Enviar Email de Recupero";
            switchText.innerHTML = `<button id="auth-switch-btn" class="text-[#960317] font-bold hover:underline">Volver al Login</button>`;
        } else if (mode === 'update_password') {
            authTitle.innerText = "Nueva Contraseña";
            authDesc.innerText = "Ingresa tu nueva clave de acceso.";
            nameFields.classList.add('hidden');
            passContainer.classList.remove('hidden');
            forgotLink.classList.add('hidden');
            authSubmit.innerText = "Actualizar Contraseña";
            switchText.innerHTML = "";
        }
        
        // Re-attach switch btn event if destroyed by innerHTML
        const newSwitchBtn = document.getElementById('auth-switch-btn');
        if (newSwitchBtn) newSwitchBtn.addEventListener('click', () => toggleMode());
    };

    switchBtn.addEventListener('click', () => toggleMode());
    document.getElementById('forgot-pass-btn').addEventListener('click', () => toggleMode('forgot'));

    closeBtn.addEventListener('click', () => {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-pass').value;

        authSubmit.disabled = true;
        authSubmit.innerText = "Procesando...";

        try {
            if (mode === 'signup') {
                const firstName = document.getElementById('first-name').value;
                const lastName = document.getElementById('last-name').value;
                const { error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { first_name: firstName, last_name: lastName }
                    }
                });
                if (error) throw error;
                showToast("Registro exitoso. Revisa tu email para confirmar.", "success");
                modal.classList.add('opacity-0');
                setTimeout(() => modal.classList.add('hidden'), 300);
            } else if (mode === 'forgot') {
                const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + window.location.pathname,
                });
                if (error) throw error;
                showToast("Email de recuperación enviado.", "success");
                toggleMode('login');
            } else if (mode === 'update_password') {
                const { error } = await supabaseClient.auth.updateUser({ password });
                if (error) throw error;
                showToast("Contraseña actualizada con éxito.", "success");
                modal.classList.add('opacity-0');
                setTimeout(() => modal.classList.add('hidden'), 300);
            } else {
                const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                showToast("Conexión establecida correctamente.", "success");
                modal.classList.add('opacity-0');
                setTimeout(() => modal.classList.add('hidden'), 300);
            }
        } catch (err) {
            let msg = err.message || "Ocurrió un error inesperado.";
            if (err.status === 429) msg = "Demasiados intentos. Por favor, espera unos minutos e intenta nuevamente.";
            else if (msg.includes('User already registered')) msg = "Este correo electrónico ya se encuentra registrado.";
            else if (msg.includes('Password should be')) msg = "La contraseña debe tener al menos 6 caracteres.";
            else if (msg.includes('Invalid login credentials')) msg = "Credenciales incorrectas. Verifica tu email y contraseña.";
            showToast(msg, "error");
        } finally {
            authSubmit.disabled = false;
            if (mode === 'signup') authSubmit.innerText = "Registrarse";
            else if (mode === 'forgot') authSubmit.innerText = "Enviar Email de Recupero";
            else if (mode === 'update_password') authSubmit.innerText = "Actualizar Contraseña";
            else authSubmit.innerText = "Continuar";
        }
    });

    // Handle Password Recovery Event
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
            openAuth('update_password');
            const emailInput = document.getElementById('auth-email');
            if (emailInput) {
                emailInput.value = session.user.email;
                emailInput.disabled = true;
            }
            toggleMode('update_password');
        }
    });
}

function openAuth(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    
    // We need a way to trigger the internal toggleMode from outside if needed, 
    // but for now the simple logic in setupAuthModalEvents handles the initial state.
    // To support starting in a specific mode:
    if (mode === 'update_password') {
        // This is handled by the event listener above usually
    }
}

document.addEventListener("DOMContentLoaded", () => {
    injectAuthModal();
    
    // --- Global Helper Assignments (Must be before loadPosts) ---
    window.getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1&origin=${window.location.origin}`;
        }
        return null;
    };

    // ─── POLL RENDERING (inline styles for guaranteed visibility) ───────────
    window.getPollHtml = (post, user) => {
        try {
            let pollData = post.poll_data;
            if (typeof pollData === 'string') {
                try { pollData = JSON.parse(pollData); } catch(e) { return ''; }
            }
            if (!pollData || !pollData.options || !Array.isArray(pollData.options)) return '';

            const voters = Array.isArray(pollData.voters) ? pollData.voters : [];
            const hasVoted = user && voters.includes(user.id);
            const totalVotes = voters.length;
            const resultsTo = Array.isArray(pollData.show_results_to) ? pollData.show_results_to : [];
            const showResults = hasVoted || (user && resultsTo.includes(user.id));

            let html = `<div id="poll-container-${post.id}" style="margin:16px 0;background:#f4f4f5;border-radius:16px;padding:20px;border:1px solid #e4e4e7;">
                <p style="margin:0 0 14px;font-size:13px;font-weight:800;color:#18181b;display:flex;align-items:center;gap:8px;">
                    <span class="material-symbols-outlined" style="font-size:18px;color:#960317;">poll</span>
                    ${pollData.question || 'Encuesta'}
                </p>
                <div style="display:flex;flex-direction:column;gap:10px;">`;

            pollData.options.forEach((opt, index) => {
                const optId = opt.id !== undefined ? opt.id : index;
                const optVotes = Array.isArray(opt.votes) ? opt.votes.length : 0;
                const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;

                if (showResults) {
                    html += `<div style="position:relative;background:#fff;border-radius:10px;height:48px;overflow:hidden;border:1px solid #e4e4e7;">
                        <div class="poll-bar" style="position:absolute;left:0;top:0;height:100%;background:#960317;opacity:0.12;width:0%;transition:width 1s ease;" data-percent="${percent}"></div>
                        <div style="position:relative;z-index:1;height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 16px;">
                            <div>
                                <span style="font-size:12px;font-weight:700;color:#18181b;">${opt.text}</span>
                                <span style="display:block;font-size:10px;color:#71717a;">${optVotes} voto${optVotes !== 1 ? 's' : ''}</span>
                            </div>
                            <span style="font-size:13px;font-weight:800;color:#960317;">${percent}%</span>
                        </div>
                    </div>`;
                } else {
                    html += `<button onclick="votePoll('${post.id}', ${optId})" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#fff;border:1.5px solid #e4e4e7;border-radius:10px;cursor:pointer;font-family:inherit;transition:border-color 0.2s,background 0.2s;" onmouseover="this.style.borderColor='#960317';this.style.background='#fff1f0';" onmouseout="this.style.borderColor='#e4e4e7';this.style.background='#fff';">
                        <span style="font-size:12px;font-weight:700;color:#18181b;">${opt.text}</span>
                        <span class="material-symbols-outlined" style="font-size:16px;color:#d4d4d8;">add_circle</span>
                    </button>`;
                }
            });

            if (!showResults) {
                html += `<button onclick="viewPollResults('${post.id}')" style="width:100%;padding:8px;background:none;border:none;cursor:pointer;font-size:11px;font-weight:700;color:#a1a1aa;font-family:inherit;letter-spacing:0.05em;" onmouseover="this.style.color='#960317';" onmouseout="this.style.color='#a1a1aa';">Ver resultados</button>`;
            }

            if (totalVotes > 0) {
                html += `<p style="margin:6px 0 0;font-size:10px;color:#a1a1aa;text-align:right;">${totalVotes} voto${totalVotes !== 1 ? 's' : ''} en total</p>`;
            }

            html += `</div></div>`;
            return html;
        } catch (error) {
            console.error('Error in getPollHtml:', error);
            return '';
        }
    };

    // ─── VOTE ON POLL ────────────────────────────────────────────────────────
    window.votePoll = async (postId, optionId) => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) { showToast('Ingresa para votar en la encuesta.', 'info'); return; }

        try {
            const { data: post, error: fetchErr } = await supabaseClient.from('posts').select('poll_data').eq('id', postId).single();
            if (fetchErr) throw fetchErr;

            let pollData = post.poll_data;
            if (typeof pollData === 'string') pollData = JSON.parse(pollData);
            if (!pollData) throw new Error('Datos de encuesta no encontrados.');

            pollData.voters = pollData.voters || [];
            if (pollData.voters.includes(user.id)) {
                showToast('Ya participaste en esta encuesta.', 'info');
                return;
            }

            const opt = pollData.options.find(o => (o.id !== undefined ? o.id : pollData.options.indexOf(o)) === optionId);
            if (!opt) throw new Error('Opción no encontrada.');

            opt.votes = opt.votes || [];
            opt.votes.push(user.id);
            pollData.voters.push(user.id);

            const { error: updateErr } = await supabaseClient.from('posts').update({ poll_data: pollData }).eq('id', postId);
            if (updateErr) throw updateErr;

            const container = document.getElementById(`poll-container-${postId}`);
            if (container) {
                container.outerHTML = window.getPollHtml({ id: postId, poll_data: pollData }, user);
                setTimeout(() => {
                    document.querySelectorAll(`#poll-container-${postId} .poll-bar`).forEach(bar => {
                        bar.style.width = bar.getAttribute('data-percent') + '%';
                    });
                }, 50);
            }
            showToast('¡Voto registrado!', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    // ─── VIEW POLL RESULTS WITHOUT VOTING ────────────────────────────────────
    window.viewPollResults = async (postId) => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) { showToast('Ingresa para ver resultados.', 'info'); return; }

        try {
            const { data: post, error } = await supabaseClient.from('posts').select('poll_data').eq('id', postId).single();
            if (error) throw error;

            let pollData = post.poll_data;
            if (typeof pollData === 'string') pollData = JSON.parse(pollData);

            pollData.show_results_to = pollData.show_results_to || [];
            if (!pollData.show_results_to.includes(user.id)) {
                pollData.show_results_to.push(user.id);
                await supabaseClient.from('posts').update({ poll_data: pollData }).eq('id', postId);
            }

            const container = document.getElementById(`poll-container-${postId}`);
            if (container) {
                container.outerHTML = window.getPollHtml({ id: postId, poll_data: pollData }, user);
                setTimeout(() => {
                    document.querySelectorAll(`#poll-container-${postId} .poll-bar`).forEach(bar => {
                        bar.style.width = bar.getAttribute('data-percent') + '%';
                    });
                }, 50);
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    // ─── UPVOTE POST (1 like per user, toggle) ───────────────────────────────
    window.upvotePost = async (postId) => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) { showToast('Ingresa para dar like.', 'info'); return; }

        const btn = document.getElementById(`like-btn-${postId}`);
        const counter = document.getElementById(`vote-count-${postId}`);

        // Disable button while processing to prevent double clicks
        if (btn) btn.style.pointerEvents = 'none';

        try {
            // 1. Check if already liked
            const { data: existing, error: checkErr } = await supabaseClient
                .from('post_likes')
                .select('user_id')
                .eq('post_id', postId)
                .eq('user_id', user.id)
                .maybeSingle();

            if (checkErr) throw checkErr;

            // 2. Get current count
            const { data: postRow, error: postErr } = await supabaseClient
                .from('posts')
                .select('vote_count')
                .eq('id', postId)
                .single();
            if (postErr) throw postErr;

            const currentCount = postRow.vote_count || 0;

            if (existing) {
                // → Unlike: delete from post_likes + decrement
                const { error: delErr } = await supabaseClient
                    .from('post_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', user.id);
                if (delErr) throw delErr;

                const newCount = Math.max(0, currentCount - 1);
                await supabaseClient.from('posts').update({ vote_count: newCount }).eq('id', postId);

                if (counter) counter.textContent = newCount;
                if (btn) { btn.style.color = '#71717a'; btn.title = 'Me gusta'; }
            } else {
                // → Like: insert into post_likes + increment
                const { error: insErr } = await supabaseClient
                    .from('post_likes')
                    .insert({ post_id: postId, user_id: user.id });

                // If unique constraint fires (race condition), just ignore
                if (insErr && insErr.code === '23505') {
                    showToast('Ya diste like a este post.', 'info');
                    if (btn) { btn.style.color = '#960317'; btn.title = 'Quitar like'; }
                    return;
                }
                if (insErr) throw insErr;

                const newCount = currentCount + 1;
                await supabaseClient.from('posts').update({ vote_count: newCount }).eq('id', postId);

                if (counter) counter.textContent = newCount;
                if (btn) { btn.style.color = '#960317'; btn.title = 'Quitar like'; }
                // showToast('¡Me gusta!', 'success');
            }
        } catch (err) {
            console.error('upvotePost error:', err);
            showToast(err.message, 'error');
        } finally {
            if (btn) btn.style.pointerEvents = 'auto';
        }
    };

    // ─── TOGGLE COMMENTS ─────────────────────────────────────────────────────
    window.toggleComments = (postId) => {
        const section = document.getElementById(`comments-section-${postId}`);
        if (!section) return;

        const isHidden = section.style.display === 'none' || section.style.display === '';
        section.style.display = isHidden ? 'block' : 'none';

        if (isHidden) {
            window.loadComments(postId);
        }
    };

    // ─── LOAD COMMENTS ───────────────────────────────────────────────────────
    window.loadComments = async (postId) => {
        const list = document.getElementById(`comments-list-${postId}`);
        const counter = document.getElementById(`comment-count-${postId}`);
        if (!list) return;

        list.innerHTML = '<p style="font-size:11px;color:#a1a1aa;text-align:center;padding:12px 0;">Cargando...</p>';

        try {
            // 1. Fetch comments
            const { data: comments, error } = await supabaseClient
                .from('comments')
                .select('id, content, created_at, author_id')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (counter) counter.textContent = comments.length;

            if (comments.length === 0) {
                list.innerHTML = '<p style="font-size:11px;color:#a1a1aa;text-align:center;padding:16px 0;">Sin comentarios aún. ¡Sé el primero!</p>';
                return;
            }

            // 2. Fetch profiles for all unique author_ids
            const authorIds = [...new Set(comments.map(c => c.author_id).filter(Boolean))];
            let profilesMap = {};
            if (authorIds.length > 0) {
                const { data: profiles } = await supabaseClient
                    .from('profiles')
                    .select('id, first_name, last_name')
                    .in('id', authorIds);
                if (profiles) profiles.forEach(p => { profilesMap[p.id] = p; });
            }

            // 3. Render
            list.innerHTML = comments.map(c => {
                const profile = profilesMap[c.author_id];
                const authorName = profile
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Miliciano'
                    : 'Miliciano';
                const initial = authorName.charAt(0).toUpperCase() || 'M';
                const timeAgo = formatTimeAgo(new Date(c.created_at));
                return `<div style="display:flex;gap:10px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #f4f4f5;">
                    <div style="width:32px;height:32px;border-radius:50%;background:#fef2f2;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#960317;flex-shrink:0;">${initial}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px;">
                            <span style="font-size:11px;font-weight:700;color:#18181b;">${authorName}</span>
                            <span style="font-size:10px;color:#a1a1aa;">${timeAgo}</span>
                        </div>
                        <p style="margin:0;font-size:13px;color:#3f3f46;line-height:1.5;word-break:break-word;">${c.content}</p>
                    </div>
                </div>`;
            }).join('');
        } catch (err) {
            console.error('loadComments error:', err);
            list.innerHTML = `<p style="font-size:11px;color:#ef4444;text-align:center;padding:12px 0;">Error: ${err.message}</p>`;
            showToast('Error al cargar comentarios: ' + err.message, 'error');
        }
    };

    // ─── POST COMMENT ────────────────────────────────────────────────────────
    window.postComment = async (postId) => {
        console.log('[postComment] called for', postId);
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) { showToast('Ingresa para comentar.', 'info'); return; }

        const input = document.getElementById(`comment-input-${postId}`);
        if (!input) { console.error('[postComment] input not found for', postId); return; }

        const content = input.value.trim();
        if (!content) { showToast('Escribe algo antes de comentar.', 'info'); return; }

        const btn = document.getElementById(`comment-btn-${postId}`);
        if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }

        try {
            console.log('[postComment] inserting comment...');
            const { error } = await supabaseClient.from('comments').insert({
                post_id: postId,
                author_id: user.id,
                content
            });
            if (error) throw error;

            console.log('[postComment] success, reloading comments');
            input.value = '';
            // showToast('Comentario publicado.', 'success');
            await window.loadComments(postId);
        } catch (err) {
            console.error('[postComment] error:', err);
            showToast('Error al comentar: ' + err.message, 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        }
    };

    // ─── DELETE POST ─────────────────────────────────────────────────────────
    window.deletePost = async (postId, imageUrl) => {
        if (!confirm('¿Eliminar esta publicación?')) return;
        try {
            const { error } = await supabaseClient.from('posts').delete().eq('id', postId);
            if (error) throw error;
            if (imageUrl) {
                try {
                    const path = imageUrl.split('/').pop();
                    await supabaseClient.storage.from('milicianos-media').remove([`posts/${path}`]);
                } catch (e) { console.warn('Could not delete image from storage', e); }
            }
            showToast('Publicación eliminada.', 'success');
            loadPosts();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    // Monitor Auth State
    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            updateAuthUI(session);
        });
        // Initial check
        supabaseClient.auth.getSession().then(({ data }) => updateAuthUI(data.session));
    }

    const navbar = document.querySelector("nav");

    // Sticky navbar effect enhancement
    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            navbar.classList.add("shadow-md", "bg-white/90", "dark:bg-zinc-950/90");
            navbar.classList.remove("bg-white/70", "dark:bg-zinc-950/70");
        } else {
            navbar.classList.add("bg-white/70", "dark:bg-zinc-950/70");
            navbar.classList.remove("shadow-md", "bg-white/90", "dark:bg-zinc-950/90");
        }
    });

    // Auth Button Events
    const loginBtns = Array.from(document.querySelectorAll("button")).filter(btn => btn.innerText.trim() === "Login");
    const joinBtns = Array.from(document.querySelectorAll("button")).filter(btn => btn.innerText.trim() === "Unirse");

    loginBtns.forEach(btn => btn.addEventListener("click", () => openAuth('login')));
    joinBtns.forEach(btn => btn.addEventListener("click", () => openAuth('signup')));

    // Mock click events for Demo (only on other buttons)


    function updateAuthUI(session) {
        const authContainers = document.querySelectorAll('.flex.items-center.gap-4 .hidden.md\\:flex');
        const createPostContainer = document.getElementById('create-post-container');
        // Mobile menu auth section
        const mobileAuthSection = document.getElementById('mobile-menu-auth');

        if (session) {
            const user = session.user;
            const name = user.user_metadata.first_name || user.email.split('@')[0];
            authContainers.forEach(container => {
                container.innerHTML = `
                    <div class="flex items-center gap-4">
                        <div class="text-right">
                            <p class="text-[10px] font-extrabold text-zinc-400 uppercase tracking-[0.2em]">Miliciano</p>
                            <p class="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 tracking-tight">${name}</p>
                        </div>
                        <button id="logout-btn" class="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:text-[#960317] hover:border-[#960317] transition-all shadow-sm">
                            <span class="material-symbols-outlined text-lg">logout</span>
                        </button>
                    </div>
                `;
                document.getElementById('logout-btn')?.addEventListener('click', () => supabaseClient.auth.signOut());
            });

            // Mobile menu: show user info + logout
            if (mobileAuthSection) {
                mobileAuthSection.innerHTML = `
                    <div class="w-full px-2 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Miliciano</p>
                            <p class="font-bold text-zinc-800 dark:text-zinc-100 text-lg">${name}</p>
                        </div>
                        <button id="mobile-logout-btn" class="p-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:text-[#960317] hover:border-[#960317] transition-all shadow-sm">
                            <span class="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                `;
                document.getElementById('mobile-logout-btn')?.addEventListener('click', () => supabaseClient.auth.signOut());
            }

            // Show post creation for logged in users
            if (createPostContainer) createPostContainer.classList.remove('hidden');

            // Check role for Note creation
            const createNoteBtn = document.getElementById('create-note-btn');
            if (createNoteBtn) {
                supabaseClient.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
                    if (data && (data.role === 'admin' || data.role === 'redactor')) {
                        createNoteBtn.classList.remove('hidden');
                    }
                });
            }
        } else {
            authContainers.forEach(container => {
                container.innerHTML = `
                    <button class="px-6 py-2.5 rounded-xl text-zinc-600 font-semibold hover:opacity-80 transition-transform active:scale-95" onclick="openAuth('login')">Login</button>
                    <button class="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95" onclick="openAuth('signup')">Unirse</button>
                `;
            });

            // Mobile menu: show login/join buttons
            if (mobileAuthSection) {
                mobileAuthSection.innerHTML = `
                    <button onclick="openAuth('login')" class="w-full py-4 rounded-2xl text-zinc-800 dark:text-zinc-100 font-semibold border border-zinc-200 dark:border-zinc-700 text-lg bg-zinc-50 dark:bg-zinc-900 active:scale-95 transition-transform">Login</button>
                    <button onclick="openAuth('signup')" class="w-full py-4 rounded-2xl bg-gradient-to-br from-[#960317] to-[#b9252b] text-white font-bold text-lg shadow-lg active:scale-95 transition-transform">Unirse</button>
                `;
            }

            // Hide post creation for guests
            if (createPostContainer) createPostContainer.classList.add('hidden');

            const createNoteBtn = document.getElementById('create-note-btn');
            if (createNoteBtn) createNoteBtn.classList.add('hidden');
        }
    }
    // Auto-scroll logic for Carousels with Visibility optimization
    const carousels = document.querySelectorAll(".auto-scroll-carousel");

    carousels.forEach(carousel => {
        let isHovered = false;
        let isVisible = false;

        // Visibility Observer to pause off-screen loops
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0.1 });
        observer.observe(carousel);

        carousel.addEventListener("mouseenter", () => isHovered = true);
        carousel.addEventListener("mouseleave", () => isHovered = false);
        carousel.addEventListener("touchstart", () => isHovered = true);
        carousel.addEventListener("touchend", () => {
            setTimeout(() => isHovered = false, 2000);
        });

        let scrollSpeed = 0.6;
        let currentScroll = carousel.scrollLeft;

        function smoothScroll() {
            if (isVisible && !isHovered) {
                currentScroll += scrollSpeed;
                const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
                if (currentScroll >= maxScrollLeft - 1) {
                    currentScroll = 0;
                }
                carousel.scrollLeft = currentScroll;
            } else if (isHovered) {
                currentScroll = carousel.scrollLeft;
            }
            requestAnimationFrame(smoothScroll);
        }

        requestAnimationFrame(smoothScroll);
    });

    // Mobile Menu Logic
    const mobileMenuBtns = document.querySelectorAll(".mobile-menu-btn");
    const mobileMenuClose = document.querySelectorAll(".mobile-menu-close");
    const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");

    if (mobileMenuOverlay) {
        mobileMenuBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                mobileMenuOverlay.style.display = "flex";
                mobileMenuOverlay.classList.remove("hidden");
                setTimeout(() => {
                    mobileMenuOverlay.classList.remove("opacity-0");
                }, 10);
                document.body.style.overflow = "hidden";
            });
        });

        mobileMenuClose.forEach(btn => {
            btn.addEventListener("click", () => {
                mobileMenuOverlay.classList.add("opacity-0");
                setTimeout(() => {
                    mobileMenuOverlay.style.display = "none";
                    mobileMenuOverlay.classList.add("hidden");
                }, 300);
                document.body.style.overflow = "";
            });
        });
    }

    // --- Lenis Smooth Scroll Initialization ---
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // --- Vanilla ScrollStack Implementation ---
    class VanillaScrollStack {
        constructor(options = {}) {
            this.container = document.querySelector('.scroll-stack-inner');
            this.cards = Array.from(document.querySelectorAll('.scroll-stack-card'));
            this.endElement = document.querySelector('.scroll-stack-end');

            if (!this.container || this.cards.length === 0) return;

            this.settings = {
                itemDistance: 100,
                itemScale: 0.04,
                itemStackDistance: 40,
                stackPosition: 0.15,
                scaleEndPosition: 0.05,
                baseScale: 0.85,
                blurAmount: 2,
                ...options
            };

            this.offsets = {
                cards: [],
                end: 0
            };

            this.lastTransforms = new Map();
            this.isVisible = false;
            this.init();
        }

        init() {
            this.cards.forEach((card, i) => {
                if (i < this.cards.length - 1) {
                    card.style.marginBottom = `${this.settings.itemDistance}px`;
                }
                card.style.willChange = 'transform, filter';
                card.style.transformOrigin = 'top center';
                card.style.zIndex = 10 + i;
            });

            // Visibility switch for scroll listener
            const observer = new IntersectionObserver((entries) => {
                this.isVisible = entries[0].isIntersecting;
                if (this.isVisible) this.attachEvents();
                else this.detachEvents();
            }, { threshold: 0.05, rootMargin: '200px' });
            observer.observe(this.container);

            this.refreshOffsets();

            window.addEventListener('resize', this.debounce(() => {
                this.refreshOffsets();
                this.update();
            }, 150));

            this.update();
        }

        debounce(func, wait) {
            let timeout;
            return function () {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(), wait);
            };
        }

        attachEvents() {
            if (lenis) {
                lenis.on('scroll', this.updateBind = () => this.update());
            } else {
                window.addEventListener('scroll', this.updateBind = () => this.update());
            }
        }

        detachEvents() {
            if (lenis) {
                lenis.off('scroll', this.updateBind);
            } else {
                window.removeEventListener('scroll', this.updateBind);
            }
        }

        refreshOffsets() {
            this.offsets.cards = this.cards.map(card => {
                const rect = card.getBoundingClientRect();
                return rect.top + window.scrollY;
            });

            if (this.endElement) {
                const rect = this.endElement.getBoundingClientRect();
                this.offsets.end = rect.top + window.scrollY;
            }
        }

        calculateProgress(scrollTop, start, end) {
            if (scrollTop < start) return 0;
            if (scrollTop > end) return 1;
            return (scrollTop - start) / (end - start);
        }

        update() {
            const scrollTop = window.scrollY;
            const containerHeight = window.innerHeight;

            const stackPos = containerHeight * this.settings.stackPosition;
            const scaleEndPos = containerHeight * this.settings.scaleEndPosition;
            const pinEnd = this.offsets.end - (containerHeight / 2);

            // Determine topCardIndex once to avoid redundant checks
            let topCardIndex = -1;
            this.offsets.cards.forEach((cardTop, i) => {
                const triggerStart = cardTop - stackPos - (this.settings.itemStackDistance * i);
                if (scrollTop >= triggerStart) {
                    topCardIndex = i;
                }
            });

            this.cards.forEach((card, i) => {
                const cardTop = this.offsets.cards[i];
                const triggerStart = cardTop - stackPos - (this.settings.itemStackDistance * i);
                const triggerEnd = cardTop - scaleEndPos;

                const scaleProgress = this.calculateProgress(scrollTop, triggerStart, triggerEnd);
                const targetScale = this.settings.baseScale + (i * this.settings.itemScale);
                const scale = 1 - (scaleProgress * (1 - targetScale));

                // Blur logic using pre-calculated topCardIndex
                let blur = 0;
                if (i < topCardIndex) {
                    blur = Math.min(10, (topCardIndex - i) * this.settings.blurAmount);
                }

                // Translate logic (Pinning)
                let translateY = 0;
                if (scrollTop >= triggerStart && scrollTop <= pinEnd) {
                    translateY = scrollTop - cardTop + stackPos + (this.settings.itemStackDistance * i);
                } else if (scrollTop > pinEnd) {
                    translateY = pinEnd - cardTop + stackPos + (this.settings.itemStackDistance * i);
                }

                const transform = `translate3d(0, ${Math.floor(translateY)}px, 0) scale(${Math.round(scale * 1000) / 1000})`;
                const filter = blur > 0 ? `blur(${Math.round(blur * 10) / 10}px)` : 'none';

                if (this.lastTransforms.get(i) !== transform + filter) {
                    card.style.transform = transform;
                    card.style.filter = filter;
                    this.lastTransforms.set(i, transform + filter);
                }
            });
        }
    }

    // Initialize the stack
    new VanillaScrollStack();

    // --- Promises Carousel Circular Navigation ---
    const pCarousel = document.getElementById('promises-carousel');
    const pNextBtns = [document.getElementById('promises-next'), document.getElementById('promises-next-mobile')];
    const pPrevBtns = [document.getElementById('promises-prev'), document.getElementById('promises-prev-mobile')];

    if (pCarousel) {
        let scrollStep = 344; // Cache to avoid DOM queries per click

        const updateStep = () => {
            const firstCard = pCarousel.firstElementChild;
            if (firstCard) scrollStep = firstCard.offsetWidth + 24;
        };
        updateStep();
        window.addEventListener('resize', updateStep);

        const handleNext = (e) => {
            if (e) e.preventDefault();
            const maxScroll = pCarousel.scrollWidth - pCarousel.clientWidth;
            // Native smooth scroll often fights with snap-mandatory, but snap-proximity is safer
            if (pCarousel.scrollLeft >= maxScroll - 30) {
                pCarousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                pCarousel.scrollBy({ left: scrollStep, behavior: 'smooth' });
            }
        };

        const handlePrev = (e) => {
            if (e) e.preventDefault();
            if (pCarousel.scrollLeft <= 30) {
                const maxScroll = pCarousel.scrollWidth - pCarousel.clientWidth;
                pCarousel.scrollTo({ left: maxScroll, behavior: 'smooth' });
            } else {
                pCarousel.scrollBy({ left: -scrollStep, behavior: 'smooth' });
            }
        };

        pNextBtns.forEach(btn => btn && btn.addEventListener('click', handleNext));
        pPrevBtns.forEach(btn => btn && btn.addEventListener('click', handlePrev));
    }


    // --- Forum Logic ---
    const postsFeed = document.getElementById('posts-feed');
    const createPostForm = document.getElementById('create-post-form');
    const imageInput = document.getElementById('post-image');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image');

    function resetDropzone() {
        const dropzone = document.getElementById('note-image-dropzone');
        if (!dropzone) return;
        dropzone.style.backgroundImage = '';
        dropzone.innerHTML = `
            <span class="material-symbols-outlined text-3xl">cloud_upload</span>
            <span id="note-image-name" class="text-xs font-bold text-center">Arrastra tu imagen aquí o haz clic</span>
            <input type="file" id="note-image-file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
        `;
        document.getElementById('note-image-file').addEventListener('change', (ev) => {
            if (ev.target.files[0]) handleImageFile(ev.target.files[0]);
        });
    }

    function handleImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dropzone = document.getElementById('note-image-dropzone');
            dropzone.style.backgroundImage = `url(${e.target.result})`;
            dropzone.style.backgroundSize = 'cover';
            dropzone.style.backgroundPosition = 'center';
            dropzone.innerHTML = `
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span class="text-white font-bold text-xs">Cambiar Imagen</span>
                </div>
                <button type="button" id="clear-note-image" class="absolute top-2 right-2 p-1 bg-white/20 hover:bg-red-500 text-white rounded-full transition-all z-10">
                    <span class="material-symbols-outlined text-sm">close</span>
                </button>
                <input type="file" id="note-image-file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            `;
            document.getElementById('clear-note-image').onclick = (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                resetDropzone();
            };
            document.getElementById('note-image-file').addEventListener('change', (ev) => {
                if (ev.target.files[0]) handleImageFile(ev.target.files[0]);
            });
        };
        reader.readAsDataURL(file);
    }

    const initialInput = document.getElementById('note-image-file');
    if (initialInput) {
        initialInput.addEventListener('change', (e) => {
            if (e.target.files[0]) handleImageFile(e.target.files[0]);
        });
    }

    // Handle Image Preview
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            imageInput.value = '';
            imagePreviewContainer.classList.add('hidden');
            imagePreview.src = '';
        });
    }

    async function uploadFile(file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { data, error } = await supabaseClient.storage
            .from('milicianos-media')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabaseClient.storage
            .from('milicianos-media')
            .getPublicUrl(filePath);

        return publicUrl;
    }

    function formatTimeAgo(date) {
        if (!date || isNaN(date.getTime())) return 'fecha desconocida';
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 0) return 'recién';
        if (diffInSeconds < 60) return 'hace un momento';
        if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
        if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} d`;
        
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }



    async function loadPosts() {
        if (!postsFeed) {
            console.warn("postsFeed element not found");
            return;
        }

        console.log("loadPosts starting...");
        try {
            const { data, error } = await supabaseClient
                .from('posts')
                .select(`
                    *,
                    profiles:author_id (first_name, last_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log(`loadPosts: successfully fetched ${data.length} posts`);

            if (data.length === 0) {
                postsFeed.innerHTML = `
                    <div class="text-center py-20">
                        <span class="material-symbols-outlined text-5xl text-zinc-300 mb-4">folder_open</span>
                        <p class="text-zinc-500 font-medium">No hay transmisiones aún. Sé el primero.</p>
                    </div>
                `;
                return;
            }

            const { data: { user } } = await supabaseClient.auth.getUser();
            let isAdmin = false;
            if (user) {
                const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single();
                isAdmin = profile?.role === 'admin';
            }

            postsFeed.innerHTML = data.map(post => {
                const authorName = post.profiles ? `@${post.profiles.first_name}_${post.profiles.last_name}`.toLowerCase() : '@sin_nombre';
                const date = new Date(post.created_at);
                const timeAgo = formatTimeAgo(date);
                const category = (post.category || 'MILICIANOS').toLowerCase();
                const canDelete = user && (user.id === post.author_id || isAdmin);

                let youtubeHtml = '';
                if (post.youtube_url) {
                    const embedUrl = getYouTubeEmbedUrl(post.youtube_url);
                    if (embedUrl) {
                        youtubeHtml = `
                            <div class="mb-4 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-900">
                                <iframe class="w-full h-full" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                            </div>
                        `;
                    }
                }

                let pollHtml = '';
                if (post.poll_data) {
                    pollHtml = getPollHtml(post, user);
                }

                const voteCount = post.vote_count || 0;

                return `
                <article style="background:#fff;border-radius:20px;border:1px solid #e4e4e7;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <!-- Header -->
                    <div style="padding:20px 24px 0;display:flex;align-items:center;justify-content:space-between;gap:12px;">
                        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                            <span style="font-size:10px;font-weight:800;letter-spacing:0.12em;color:#960317;background:#fff1f0;padding:3px 10px;border-radius:20px;border:1px solid #fecaca;text-transform:uppercase;">m/${category}</span>
                            <span style="font-size:11px;color:#a1a1aa;font-weight:600;">${authorName} · ${timeAgo}</span>
                        </div>
                        ${canDelete ? `<button onclick="deletePost('${post.id}', '${post.image_url || ''}')" title="Eliminar" style="padding:6px;background:none;border:none;cursor:pointer;color:#d4d4d8;border-radius:8px;display:flex;align-items:center;justify-content:center;" onmouseover="this.style.color='#ef4444';this.style.background='#fef2f2';" onmouseout="this.style.color='#d4d4d8';this.style.background='none';"><span class="material-symbols-outlined" style="font-size:18px;">delete</span></button>` : ''}
                    </div>

                    <!-- Body -->
                    <div style="padding:16px 24px 20px;">
                        <h3 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#18181b;line-height:1.3;font-family:'Sora',sans-serif;">${post.title}</h3>
                        ${youtubeHtml}
                        ${post.image_url ? `<div style="margin-bottom:16px;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;"><img src="${post.image_url}" style="width:100%;height:auto;max-height:420px;object-fit:cover;display:block;"></div>` : ''}
                        <div class="ql-editor" style="padding:0;font-size:14px;color:#3f3f46;line-height:1.7;margin-bottom:8px;">${post.content}</div>
                        ${pollHtml}
                    </div>

                    <!-- Footer Actions -->
                    <div style="padding:12px 24px 16px;border-top:1px solid #f4f4f5;display:flex;align-items:center;gap:16px;">
                        <!-- Upvote (toggle, 1 per user) -->
                        <button type="button" id="like-btn-${post.id}" onclick="event.preventDefault();window.upvotePost('${post.id}');" title="Me gusta" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-family:inherit;padding:6px 10px;border-radius:10px;transition:background 0.2s;color:#71717a;" onmouseover="this.style.background='#fff1f0';" onmouseout="this.style.background='none';">
                            <span class="material-symbols-outlined" style="font-size:18px;color:inherit;">favorite</span>
                            <span id="vote-count-${post.id}" style="font-size:12px;font-weight:700;">${voteCount}</span>
                        </button>

                        <!-- Comments toggle -->
                        <button type="button" onclick="window.toggleComments('${post.id}')" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-family:inherit;padding:6px 10px;border-radius:10px;transition:background 0.2s;" onmouseover="this.style.background='#f4f4f5';" onmouseout="this.style.background='none';">
                            <span class="material-symbols-outlined" style="font-size:18px;color:#71717a;">chat_bubble</span>
                            <span style="font-size:12px;font-weight:600;color:#71717a;">Comentar</span>
                            <span id="comment-count-${post.id}" style="font-size:11px;font-weight:700;color:#fff;background:#71717a;padding:1px 7px;border-radius:20px;">0</span>
                        </button>
                    </div>

                    <!-- Comments Section (hidden by default) -->
                    <div id="comments-section-${post.id}" style="display:none;border-top:1px solid #f4f4f5;padding:16px 24px 20px;background:#fafafa;">
                        <!-- Comment list -->
                        <div id="comments-list-${post.id}" style="max-height:320px;overflow-y:auto;margin-bottom:16px;">
                            <p style="font-size:11px;color:#a1a1aa;text-align:center;padding:12px 0;">Cargando...</p>
                        </div>
                        <!-- Comment input -->
                        <div style="display:flex;gap:10px;align-items:center;background:#fff;border:1.5px solid #e4e4e7;border-radius:14px;padding:8px 12px;">
                            <input type="text" id="comment-input-${post.id}" placeholder="Escribe un comentario..." style="flex:1;border:none;outline:none;font-size:13px;font-family:inherit;background:transparent;color:#18181b;" onfocus="this.parentElement.style.borderColor='#960317';" onblur="this.parentElement.style.borderColor='#e4e4e7';" onkeydown="if(event.key==='Enter'){event.preventDefault();window.postComment('${post.id}');}">
                            <button type="button" id="comment-btn-${post.id}" onclick="event.preventDefault();event.stopPropagation();window.postComment('${post.id}');" style="width:36px;height:36px;background:#960317;color:#fff;border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85';" onmouseout="this.style.opacity='1';">
                                <span class="material-symbols-outlined" style="font-size:16px;">send</span>
                            </button>
                        </div>
                    </div>
                </article>`;
            }).join('');

            // Animate poll bars
            setTimeout(() => {
                document.querySelectorAll('.poll-bar').forEach(bar => {
                    bar.style.width = (bar.getAttribute('data-percent') || 0) + '%';
                });
            }, 100);

            // Load comment counts for all visible posts
            data.forEach(post => {
                // Load comment counts
                supabaseClient
                    .from('comments')
                    .select('id', { count: 'exact', head: true })
                    .eq('post_id', post.id)
                    .then(({ count }) => {
                        const el = document.getElementById(`comment-count-${post.id}`);
                        if (el && count > 0) el.textContent = count;
                    });

                // Mark liked posts for current user
                if (user) {
                    supabaseClient
                        .from('post_likes')
                        .select('user_id')
                        .eq('post_id', post.id)
                        .eq('user_id', user.id)
                        .maybeSingle()
                        .then(({ data: like }) => {
                            if (like) {
                                const btn = document.getElementById(`like-btn-${post.id}`);
                                if (btn) { btn.style.color = '#960317'; btn.title = 'Quitar like'; }
                            }
                        });
                }
            });

        } catch (err) {
            console.error('Error loading posts:', err);
            if (postsFeed) postsFeed.innerHTML = `<p style="color:#ef4444;text-align:center;padding:40px 0;font-weight:600;">Error al sincronizar el feed.<br><span style="font-size:12px;font-weight:400;">${err.message}</span></p>`;
        }
    }

    if (createPostForm) {
        const ytBtn = document.getElementById('toggle-youtube-btn');
        const ytContainer = document.getElementById('youtube-input-container');
        const ytRemove = document.getElementById('remove-youtube-btn');
        const ytInput = document.getElementById('post-youtube-url');

        const pollBtn = document.getElementById('toggle-poll-btn');
        const pollContainer = document.getElementById('poll-input-container');
        const pollRemove = document.getElementById('remove-poll-btn');
        const addPollOptBtn = document.getElementById('add-poll-option-btn');
        const pollOptsContainer = document.getElementById('poll-options-container');

        if (ytBtn) ytBtn.addEventListener('click', () => ytContainer.classList.remove('hidden'));
        if (ytRemove) ytRemove.addEventListener('click', () => {
            ytContainer.classList.add('hidden');
            ytInput.value = '';
        });

        if (pollBtn) pollBtn.addEventListener('click', () => pollContainer.classList.remove('hidden'));
        if (pollRemove) pollRemove.addEventListener('click', () => {
            pollContainer.classList.add('hidden');
            document.getElementById('poll-question').value = '';
            pollOptsContainer.innerHTML = `
                <input type="text" placeholder="Opción 1" class="poll-option-input w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm">
                <input type="text" placeholder="Opción 2" class="poll-option-input w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm">
            `;
        });

        if (addPollOptBtn) addPollOptBtn.addEventListener('click', () => {
            const count = pollOptsContainer.querySelectorAll('.poll-option-input').length + 1;
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Opción ${count}`;
            input.className = 'poll-option-input w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm mt-2';
            pollOptsContainer.appendChild(input);
        });

        createPostForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = createPostForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;

            try {
                console.log("Iniciando publicación de post...");
                if (!supabaseClient) {
                    throw new Error("El motor de base de datos no está inicializado.");
                }

                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) {
                    showToast("Debes ingresar para participar.", "info");
                    return;
                }

                const title = document.getElementById('post-title')?.value.trim();
                const content = forumQuill ? forumQuill.root.innerHTML.trim() : '';
                const category = document.getElementById('post-category')?.value || 'General';

                if (!title || content === '<p><br></p>' || !content) {
                    showToast("El título y el contenido son obligatorios.", "info");
                    return;
                }

                submitBtn.disabled = true;
                submitBtn.innerText = "Sincronizando...";

                let imageUrl = null;
                const file = imageInput?.files[0];
                if (file) {
                    console.log("Subiendo imagen...");
                    imageUrl = await uploadFile(file);
                }

                let youtubeUrl = null;
                if (ytContainer && !ytContainer.classList.contains('hidden')) {
                    youtubeUrl = ytInput.value.trim() || null;
                }

                let pollData = null;
                if (pollContainer && !pollContainer.classList.contains('hidden')) {
                    const question = document.getElementById('poll-question').value.trim();
                    const options = Array.from(pollOptsContainer.querySelectorAll('.poll-option-input'))
                        .map(inp => inp.value.trim())
                        .filter(val => val !== '');
                    if (question && options.length >= 2) {
                        pollData = {
                            question: question,
                            options: options.map((opt, i) => ({ id: i, text: opt, votes: [] })),
                            voters: [],
                            show_results_to: []
                        };
                    }
                }

                console.log("Insertando en Supabase...");
                const { error } = await supabaseClient.from('posts').insert({
                    author_id: user.id,
                    title,
                    content,
                    category,
                    image_url: imageUrl,
                    youtube_url: youtubeUrl,
                    poll_data: pollData
                });

                if (error) throw error;

                console.log("Publicación exitosa.");
                createPostForm.reset();
                if (forumQuill) forumQuill.setContents([]);
                if (imagePreviewContainer) imagePreviewContainer.classList.add('hidden');
                if (ytContainer) { ytContainer.classList.add('hidden'); ytInput.value = ''; }
                if (pollContainer) {
                    pollContainer.classList.add('hidden');
                    document.getElementById('poll-question').value = '';
                    pollOptsContainer.innerHTML = `
                        <input type="text" placeholder="Opción 1" class="poll-option-input w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm">
                        <input type="text" placeholder="Opción 2" class="poll-option-input w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm">
                    `;
                }
                await loadPosts();
                showToast("Transmisión publicada exitosamente.", "success");

            } catch (error) {
                console.error("Error en publicación:", error);
                showToast(error.message || "Error desconocido al publicar.", "error");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            }
        });
    }


    // --- Vanguardia Notes Pro Logic ---
    const notesFeed = document.getElementById('notes-feed');
    const noteModal = document.getElementById('note-modal');
    const noteReader = document.getElementById('note-reader');
    const noteForm = document.getElementById('note-form');
    const createNoteBtn = document.getElementById('create-note-btn');
    const noteSearch = document.getElementById('note-search');
    const noteImageInput = document.getElementById('note-image-file');

    let allNotes = []; // Cache for searching

    // Helper: Markdown Formatting
    window.formatNote = (type) => {
        const textarea = document.getElementById('note-content');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        let replacement = '';

        switch (type) {
            case 'bold': replacement = `**${selectedText || 'texto'}**`; break;
            case 'italic': replacement = `_${selectedText || 'texto'}_`; break;
            case 'list': replacement = `\n- ${selectedText || 'item'}`; break;
        }

        textarea.value = text.substring(0, start) + replacement + text.substring(end);
        textarea.focus();
    };

    // Helper: YouTube ID Extraction & Formatting
    function getYouTubeID(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }


    // Helper: Reading Time
    function calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }


    // Helper: Image Upload
    async function uploadNoteImage(file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `notes/${fileName}`;

        const { error } = await supabaseClient.storage
            .from('milicianos-media')
            .upload(filePath, file);

        if (error) throw error;

        const { data } = supabaseClient.storage
            .from('milicianos-media')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    async function loadNotes(query = '') {
        console.log("loadNotes() function called with query:", query);
        if (!notesFeed) {
            console.warn("notesFeed element not found in DOM");
            return;
        }

        console.log("loadNotes starting...");
        try {
            const { data, error } = await supabaseClient
                .from('notes')
                .select('id, author_id, type, title, image_url, created_at, keywords, reading_time_min, status, slug, profiles(first_name, last_name)')
                .or('status.eq.published,status.is.null')
                .order('created_at', { ascending: false });

            if (error) throw error;
            allNotes = data;

            filterAndRenderNotes(query);

        } catch (err) {
            console.error("Error loading notes:", err);
            if (notesFeed) notesFeed.innerHTML = '<p class="text-xs text-red-500 text-center">Error al cargar notas</p>';
        }
    }

    function filterAndRenderNotes(query) {
        if (!notesFeed) return;

        const filtered = allNotes.filter(note => {
            const searchStr = (note.title + (note.keywords || []).join(' ')).toLowerCase();
            return searchStr.includes(query.toLowerCase());
        });

        if (filtered.length === 0) {
            notesFeed.innerHTML = `<p class="text-xs text-center py-10 text-zinc-400 font-bold uppercase tracking-widest">No se encontraron notas</p>`;
            return;
        }

        notesFeed.innerHTML = '';
        filtered.forEach((note, index) => {
            const authorName = note.profiles ? `${note.profiles.first_name} ${note.profiles.last_name}` : 'Miliciano';
            // Use metadata reading time or fallback to 1 min since we don't have content here
            const readTime = note.reading_time_min || 1;
            const card = document.createElement('div');

            if (index === 0 && !query) {
                card.className = "group relative overflow-hidden rounded-2xl bg-zinc-900 shadow-xl h-72 cursor-pointer transition-all hover:-translate-y-1 mb-8 border border-white/10";
                card.innerHTML = `
                    <img class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" src="${note.image_url || 'https://images.unsplash.com/photo-1455390582262-044cdead277a'}" />
                    <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 p-6 z-20 w-full">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="px-2.5 py-1 bg-[#960317] text-white text-[9px] font-black rounded-full backdrop-blur-md uppercase tracking-wider">${note.type}</span>
                            <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                <span class="material-symbols-outlined text-xs">schedule</span> ${readTime} min lectura
                            </span>
                        </div>
                        <h3 class="text-xl font-bold text-white leading-tight font-['Sora'] group-hover:text-red-400 transition-colors">${note.title}</h3>
                        <p class="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-widest">Por ${authorName}</p>
                    </div>
                `;
            } else {
                card.className = "bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm group hover:shadow-lg hover:border-[#960317]/20 transition-all cursor-pointer mb-4";
                card.innerHTML = `
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-[9px] font-black text-[#960317] tracking-[0.2em] uppercase">${note.type}</span>
                        <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">${readTime} min</span>
                    </div>
                    <h4 class="text-sm font-bold mb-4 leading-snug text-zinc-900 font-['Sora'] group-hover:text-[#960317] transition-colors">${note.title}</h4>
                    <div class="flex items-center gap-3">
                        <div class="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-500 border border-zinc-200">
                            ${authorName[0]}
                        </div>
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Por ${authorName}</span>
                    </div>
                `;
            }

            card.onclick = () => viewNote(note);
            notesFeed.appendChild(card);
        });
    }

    async function viewNote(metadata) {
        if (!noteReader) return;

        try {
            // Show reader and initial loading state
            noteReader.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            const contentArea = document.getElementById('reader-content');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-20 opacity-50">
                        <div class="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sincronizando contenido...</p>
                    </div>
                `;
            }

            // Fetch full note content including content and profiles
            const { data: note, error } = await supabaseClient
                .from('notes')
                .select('*, profiles(first_name, last_name, avatar_url)')
                .eq('id', metadata.id)
                .single();

            if (error) throw error;
            if (!note) return;

            const authorName = note.profiles ? `${note.profiles.first_name} ${note.profiles.last_name}` : 'Miliciano';
            const readTime = calculateReadingTime(note.content || '');

            document.getElementById('reader-type').innerText = note.type;
            document.getElementById('reader-title').innerText = note.title;
            document.getElementById('reader-author-name').innerText = authorName;
            document.getElementById('reader-author-avatar').innerText = authorName[0];
            document.getElementById('reader-date').innerText = new Date(note.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) + ` • ${readTime} min lectura`;

            // HTML Rendering
            if (contentArea) {
                let htmlContent = '';
                try {
                    const parsed = JSON.parse(note.content);
                    if (parsed.blocks && typeof edjsHTML !== 'undefined') {
                        // Custom Parser for our specific List/Checklist structure
                        const edjsParser = edjsHTML({
                            list: ({ data }) => {
                                const isChecklist = data.style === 'checklist';
                                const tag = data.style === 'ordered' ? 'ol' : 'ul';
                                
                                const renderItems = (items) => {
                                    return items.map(item => {
                                        const content = typeof item === 'string' ? item : (item.content || '');
                                        const meta = item.meta || {};
                                        const subItems = item.items && item.items.length > 0 ? `<${tag} class="pl-6 mt-2">${renderItems(item.items)}</${tag}>` : '';
                                        
                                        if (isChecklist) {
                                            return `
                                                <li class="flex items-start gap-3 mb-3 list-none group">
                                                    <div class="mt-1 w-5 h-5 rounded-md border-2 ${meta.checked ? 'bg-primary border-primary' : 'border-zinc-300'} flex items-center justify-center transition-colors">
                                                        ${meta.checked ? '<span class="material-symbols-outlined text-white text-[14px]">check</span>' : ''}
                                                    </div>
                                                    <div class="flex-1">
                                                        <span class="${meta.checked ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-300'} font-medium transition-all">${content}</span>
                                                        ${subItems}
                                                    </div>
                                                </li>`;
                                        }
                                        return `<li class="mb-2">${content}${subItems}</li>`;
                                    }).join('');
                                };

                                return `<${tag} class="${isChecklist ? 'space-y-1 p-0' : 'list-disc pl-5 space-y-2'}">${renderItems(data.items)}</${tag}>`;
                            }
                        });
                        htmlContent = `<div class="ce-reader font-['Plus_Jakarta_Sans'] text-base md:text-lg text-zinc-800 dark:text-zinc-200">${edjsParser.parse(parsed).join('')}</div>`;
                    } else {
                        throw new Error("No blocks found");
                    }
                } catch (e) {
                    // Fallback to legacy HTML
                    if (note.content && note.content.includes('<')) {
                        htmlContent = `<div class="ql-editor">${note.content}</div>`;
                    } else if (typeof marked !== 'undefined') {
                        htmlContent = marked.parse(note.content || '');
                    } else {
                        htmlContent = (note.content || '').split('\n').map(p => p.trim() ? `<p class="mb-6">${p}</p>` : '').join('');
                    }
                }
                contentArea.innerHTML = htmlContent;

                // Keywords
                if (note.keywords && note.keywords.length > 0) {
                    contentArea.innerHTML += `
                        <div class="flex flex-wrap gap-2 mt-12 pt-8 border-t border-zinc-100">
                            ${note.keywords.map(k => `<span class="px-3 py-1 bg-zinc-50 text-zinc-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">#${k.trim()}</span>`).join('')}
                        </div>
                    `;
                }

                // Suggestions Engine
                const suggestions = allNotes.filter(n => n.id !== note.id).slice(0, 2);
                if (suggestions.length > 0) {
                    let suggestionsHtml = `
                        <div class="mt-16 bg-zinc-50 rounded-3xl p-8">
                            <h3 class="font-['Sora'] font-black text-sm uppercase tracking-widest text-zinc-400 mb-6">Sugerencias de Vanguardia</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    `;

                    suggestions.forEach(s => {
                        suggestionsHtml += `
                            <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm cursor-pointer hover:border-[#960317]/30 transition-all group" onclick="closeNoteReader(); setTimeout(() => viewNote(${JSON.stringify(s).replace(/"/g, '&quot;')}), 300)">
                                <span class="text-[8px] font-black text-[#960317] tracking-widest uppercase mb-2 block">${s.type}</span>
                                <h4 class="text-sm font-bold font-['Sora'] group-hover:text-[#960317] transition-colors leading-tight">${s.title}</h4>
                            </div>
                        `;
                    });

                    suggestionsHtml += `</div></div>`;
                    contentArea.innerHTML += suggestionsHtml;
                }
            }

            const img = document.getElementById('reader-image');
            if (note.image_url) {
                img.src = note.image_url;
                document.getElementById('reader-image-container').classList.remove('hidden');
            } else {
                document.getElementById('reader-image-container').classList.add('hidden');
            }

            // Check if current user is owner to show delete button
            const { data: { user } } = await supabaseClient.auth.getUser();
            const deleteBtn = document.getElementById('delete-note-btn');
            if (deleteBtn) {
                if (user && (user.id === note.author_id)) {
                    deleteBtn.classList.remove('hidden');
                    deleteBtn.onclick = () => deleteVanguardiaNote(note.id);
                } else {
                    deleteBtn.classList.add('hidden');
                }
            }

        } catch (err) {
            console.error("Error viewNote:", err);
            showToast("Error al cargar la nota", "error");
        }
    }

    window.deleteVanguardiaNote = async (id) => {
        if (!confirm("¿ESTÁS SEGURO? Esta acción eliminará permanentemente la nota de la Vanguardia.")) return;
        
        const { error } = await supabaseClient.from('notes').delete().eq('id', id);
        if (error) {
            showToast("Error al eliminar la nota.", "error");
            return;
        }
        
        showToast("Nota eliminada correctamente.", "success");
        closeNoteReader();
        loadNotes();
    };

    window.closeNoteReader = () => {
        noteReader.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };

    // --- Note Creator Logic ---

    let editor;
    if (document.getElementById('editor-container') && typeof EditorJS !== 'undefined') {
        try {
            let toolsConfig = {};
            if (typeof Header !== 'undefined') {
                toolsConfig.header = {
                    class: Header,
                    config: {
                        placeholder: 'Título (H1, H2, H3)',
                        levels: [1, 2, 3],
                        defaultLevel: 1
                    }
                };
            }
            if (typeof EditorjsList !== 'undefined') {
                toolsConfig.list = { class: EditorjsList, inlineToolbar: true };
            } else if (typeof List !== 'undefined') {
                toolsConfig.list = { class: List, inlineToolbar: true };
            } else if (typeof NestedList !== 'undefined') {
                toolsConfig.list = { class: NestedList, inlineToolbar: true };
            }
            if (typeof Quote !== 'undefined') {
                toolsConfig.quote = {
                    class: Quote,
                    inlineToolbar: true,
                    config: {
                        quotePlaceholder: 'Escribe una cita...',
                        captionPlaceholder: 'Autor'
                    }
                };
            }
            if (typeof Embed !== 'undefined') {
                toolsConfig.embed = {
                    class: Embed,
                    config: { services: { youtube: true } }
                };
            }

            editor = new EditorJS({
                holder: 'editor-container',
                placeholder: 'Escribe tu nota aquí. Usa + para añadir bloques o pega enlaces...',
                tools: toolsConfig,
                onChange: () => {
                    triggerAutoSave();
                }
            });
        } catch (e) {
            console.warn("Error initializing EditorJS:", e);
        }
    }

    let forumQuill;
    if (document.getElementById('forum-editor') && typeof Quill !== 'undefined') {
        try {
            forumQuill = new Quill('#forum-editor', {
            theme: 'snow',
            placeholder: 'Escribe tu mensaje estratégico...',
            modules: {
                toolbar: '#forum-toolbar'
            }
        });

        // Smart Paste for Forum
        forumQuill.root.addEventListener('paste', (e) => {
            const text = e.clipboardData.getData('text/plain');
            const embedUrl = getYouTubeEmbedUrl(text);
            if (embedUrl) {
                e.preventDefault();
                const range = forumQuill.getSelection();
                const index = range ? range.index : forumQuill.getLength();
                forumQuill.insertEmbed(index, 'video', embedUrl);
            }
        });
        } catch (e) {
            console.warn("Error initializing Forum Quill editor:", e);
        }
    }

    const publishNoteBtn = document.getElementById('publish-note-btn');
    function validateNoteForm() {
        if (!publishNoteBtn) return;
        const title = document.getElementById('note-title')?.value.trim();
        const type = document.getElementById('note-type')?.value;
        
        if (title && type) {
            publishNoteBtn.disabled = false;
        } else {
            publishNoteBtn.disabled = true;
        }
    }

    function generateSlug(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    const noteTitleInput = document.getElementById('note-title');
    const slugPreview = document.getElementById('slug-preview');
    if (noteTitleInput && slugPreview) {
        noteTitleInput.addEventListener('input', () => {
            const currentTitle = noteTitleInput.value.trim();
            slugPreview.innerText = currentTitle ? `enlace: /n/${generateSlug(currentTitle)}` : 'enlace: /n/...';
            validateNoteForm();
            triggerAutoSave();
        });
    }

    // Auto-save & Drafts
    let autoSaveTimeout;
    let currentDraftId = null;
    const draftStatus = document.getElementById('draft-status');

    async function saveDraft() {
        if (!editor) return;
        const title = document.getElementById('note-title').value.trim();
        const type = document.getElementById('note-type').value;
        
        let contentData = {};
        try {
            contentData = await editor.save();
        } catch (e) {
            console.error("Error saving blocks:", e);
        }
        
        const content = JSON.stringify(contentData);
        const keywords = document.getElementById('note-keywords').value.split(',').map(k => k.trim()).filter(k => k);

        if (!title && contentData.blocks && contentData.blocks.length === 0) {
            if (draftStatus) {
                draftStatus.classList.remove('bg-yellow-500');
                draftStatus.classList.add('bg-transparent');
            }
            return;
        }

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const noteData = {
            author_id: user.id,
            title: title || 'Borrador sin título',
            type: type,
            content: content,
            keywords: keywords,
            status: 'draft',
            slug: generateSlug(title || `draft-${Date.now()}`)
        };

        if (currentDraftId) {
            await supabaseClient.from('notes').update(noteData).eq('id', currentDraftId);
        } else {
            const { data, error } = await supabaseClient.from('notes').insert([noteData]).select('id').single();
            if (data && data.id) currentDraftId = data.id;
        }

        if (draftStatus) {
            draftStatus.classList.remove('bg-yellow-500');
            draftStatus.classList.add('bg-green-500');
            setTimeout(() => {
                draftStatus.classList.remove('bg-green-500');
                draftStatus.classList.add('bg-zinc-300', 'dark:bg-zinc-700');
            }, 2000);
        }
    }

    function triggerAutoSave() {
        clearTimeout(autoSaveTimeout);
        if (draftStatus) {
            draftStatus.classList.remove('bg-transparent', 'bg-zinc-300', 'dark:bg-zinc-700', 'bg-green-500');
            draftStatus.classList.add('bg-yellow-500');
        }
        autoSaveTimeout = setTimeout(saveDraft, 2000);
        validateNoteForm();
    }

    async function loadLastDraft() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const { data } = await supabaseClient.from('notes')
            .select('*')
            .eq('author_id', user.id)
            .eq('status', 'draft')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (data) {
            currentDraftId = data.id;
            document.getElementById('note-title').value = data.title !== 'Borrador sin título' ? data.title : '';
            document.getElementById('note-type').value = data.type || 'MILICIANOS';
            document.getElementById('note-keywords').value = (data.keywords || []).join(', ');
            selectedTags = data.keywords || [];
            renderTags();
            if (editor && data.content) {
                try {
                    const parsed = JSON.parse(data.content);
                    if (parsed.blocks) {
                        await editor.render(parsed);
                    }
                } catch (e) {
                    console.warn("No se pudo cargar el JSON de Editor.js (posible HTML antiguo)");
                }
            }
            validateNoteForm();
            if (draftStatus) {
                draftStatus.classList.remove('bg-yellow-500', 'bg-transparent');
                draftStatus.classList.add('bg-green-500');
                setTimeout(() => {
                    draftStatus.classList.remove('bg-green-500');
                    draftStatus.classList.add('bg-zinc-300', 'dark:bg-zinc-700');
                }, 2000);
            }
        }
    }

    // --- Smart Tags Logic ---
    const keywordsContainer = document.getElementById('keywords-container');
    const keywordInput = document.getElementById('keyword-input');
    const keywordsDropdown = document.getElementById('keywords-dropdown');
    const noteKeywordsHidden = document.getElementById('note-keywords');
    
    let existingTags = [];
    let selectedTags = [];

    async function loadExistingTags() {
        if (!supabaseClient) return;
        try {
            const { data, error } = await supabaseClient.from('notes').select('keywords');
            if (error) throw error;
            const allKeywords = data.flatMap(n => n.keywords || []);
            existingTags = [...new Set(allKeywords.map(k => k.trim().toLowerCase()).filter(k => k))];
        } catch (err) {
            console.warn("Failed to load tags:", err);
        }
    }

    function renderTags() {
        if (!keywordsContainer || !noteKeywordsHidden) return;
        keywordsContainer.innerHTML = '';
        
        selectedTags.forEach(tag => {
            const chip = document.createElement('div');
            chip.className = 'flex items-center gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm';
            chip.innerHTML = `
                <span>${tag}</span>
                <span class="material-symbols-outlined text-[14px] cursor-pointer hover:text-[#960317] transition-colors ml-1 remove-tag" data-tag="${tag}">close</span>
            `;
            keywordsContainer.appendChild(chip);
        });

        keywordsContainer.appendChild(keywordInput);
        noteKeywordsHidden.value = selectedTags.join(', ');
        
        document.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tagToRemove = e.target.getAttribute('data-tag');
                selectedTags = selectedTags.filter(t => t !== tagToRemove);
                renderTags();
                triggerAutoSave();
            });
        });
    }

    function addTag(tag) {
        tag = tag.trim().toLowerCase();
        if (tag && !selectedTags.includes(tag)) {
            selectedTags.push(tag);
            renderTags();
            keywordInput.value = '';
            keywordsDropdown.classList.add('hidden');
            triggerAutoSave();
        }
    }

    if (keywordInput && keywordsContainer && keywordsDropdown) {
        keywordInput.addEventListener('focus', () => {
            if (existingTags.length === 0) loadExistingTags();
        });

        keywordInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toLowerCase();
            if (val.endsWith(',')) {
                addTag(val.slice(0, -1));
                return;
            }

            keywordsDropdown.innerHTML = '';
            if (val.length > 0) {
                const matches = existingTags.filter(t => t.includes(val) && !selectedTags.includes(t));
                if (matches.length > 0) {
                    matches.forEach(match => {
                        const div = document.createElement('div');
                        div.className = 'px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors border-b border-zinc-100 dark:border-zinc-800/50 last:border-0';
                        div.innerText = match;
                        div.onmousedown = (e) => { e.preventDefault(); addTag(match); };
                        keywordsDropdown.appendChild(div);
                    });
                    keywordsDropdown.classList.remove('hidden');
                } else {
                    keywordsDropdown.classList.add('hidden');
                }
            } else {
                keywordsDropdown.classList.add('hidden');
            }
        });

        keywordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (keywordInput.value.trim()) addTag(keywordInput.value);
            } else if (e.key === 'Backspace' && keywordInput.value === '' && selectedTags.length > 0) {
                selectedTags.pop();
                renderTags();
                triggerAutoSave();
            }
        });

        keywordInput.addEventListener('blur', () => {
            if (keywordInput.value.trim()) addTag(keywordInput.value);
            setTimeout(() => keywordsDropdown.classList.add('hidden'), 200);
        });

        keywordsContainer.addEventListener('click', () => keywordInput.focus());
    }

    // Editor.js handles slash commands natively or via block tools.

    // Form Event Listeners
    document.getElementById('note-title')?.addEventListener('input', triggerAutoSave);
    document.getElementById('note-type')?.addEventListener('change', triggerAutoSave);
    document.getElementById('note-keywords')?.addEventListener('input', triggerAutoSave);

    // Modal Events
    createNoteBtn?.addEventListener('click', () => {
        noteModal.classList.remove('hidden');
        if (!currentDraftId) loadLastDraft();
    });
    document.getElementById('close-note-modal')?.addEventListener('click', () => {
        noteModal.classList.add('hidden');
    });
    if (document.getElementById('cancel-note')) {
        document.getElementById('cancel-note').addEventListener('click', () => {
            noteModal.classList.add('hidden');
        });
    }
    if (document.getElementById('cancel-note-bottom')) {
        document.getElementById('cancel-note-bottom').addEventListener('click', () => {
            noteModal.classList.add('hidden');
        });
    }

    // Custom Video Insertion Logic for Notes
    const customVideoBtn = document.getElementById('custom-video-btn');
    const videoInsertModal = document.getElementById('video-insert-modal');
    const videoInsertCard = document.getElementById('video-insert-card');
    const closeVideoModal = document.getElementById('close-video-modal');
    const cancelVideoInsert = document.getElementById('cancel-video-insert');
    const confirmVideoInsert = document.getElementById('confirm-video-insert');
    const videoUrlInput = document.getElementById('video-url-input');
    const videoPreviewContainer = document.getElementById('video-preview-container');
    const videoPreviewIframe = document.getElementById('video-preview-iframe');

    if (customVideoBtn) {
        customVideoBtn.addEventListener('click', () => {
            videoInsertModal.classList.remove('hidden');
            setTimeout(() => {
                videoInsertModal.classList.remove('opacity-0');
                videoInsertCard.classList.remove('scale-95');
            }, 10);
        });
    }

    function closeVideoDialog() {
        videoInsertModal.classList.add('opacity-0');
        videoInsertCard.classList.add('scale-95');
        setTimeout(() => {
            videoInsertModal.classList.add('hidden');
            videoUrlInput.value = '';
            videoPreviewContainer.classList.add('hidden');
            videoPreviewIframe.src = '';
            confirmVideoInsert.disabled = true;
        }, 300);
    }

    if (closeVideoModal) closeVideoModal.addEventListener('click', closeVideoDialog);
    if (cancelVideoInsert) cancelVideoInsert.addEventListener('click', closeVideoDialog);

    let extractedThumbnailUrl = null;

    if (videoUrlInput) {
        videoUrlInput.addEventListener('input', (e) => {
            const embedUrl = getYouTubeEmbedUrl(e.target.value);
            if (embedUrl) {
                videoPreviewIframe.src = embedUrl;
                videoPreviewContainer.classList.remove('hidden');
                confirmVideoInsert.disabled = false;
            } else {
                videoPreviewContainer.classList.add('hidden');
                videoPreviewIframe.src = '';
                confirmVideoInsert.disabled = true;
            }
        });
    }

    if (confirmVideoInsert) {
        confirmVideoInsert.addEventListener('click', () => {
            const rawUrl = videoUrlInput.value;
            const embedUrl = getYouTubeEmbedUrl(rawUrl);
            if (embedUrl) {
                const extractThumb = document.getElementById('extract-thumbnail');
                if (extractThumb && extractThumb.checked) {
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                    const match = rawUrl.match(regExp);
                    if (match && match[2].length === 11) {
                        extractedThumbnailUrl = `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
                        const dropzone = document.getElementById('note-image-dropzone');
                        if (dropzone) {
                            dropzone.style.backgroundImage = `url(${extractedThumbnailUrl})`;
                            dropzone.style.backgroundSize = 'cover';
                            dropzone.style.backgroundPosition = 'center';
                            dropzone.innerHTML = `
                                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <span class="material-symbols-outlined text-white text-3xl">edit</span>
                                </div>
                            `;
                        }
                    }
                }
                
                closeVideoDialog();
            }
        });
    }
    document.getElementById('close-note-reader')?.addEventListener('click', closeNoteReader);

    // Image Input & Drag and Drop
    const dropzone = document.getElementById('note-image-dropzone');
    if (dropzone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
        });
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.add('border-[#960317]', 'bg-[#960317]/5'), false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.remove('border-[#960317]', 'bg-[#960317]/5'), false);
        });
        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            if (dt.files && dt.files.length > 0) {
                noteImageInput.files = dt.files;
                document.getElementById('note-image-name').innerText = dt.files[0].name;
                triggerAutoSave();
            }
        }, false);
    }

    noteImageInput?.addEventListener('change', (e) => {
        const name = e.target.files[0]?.name || "Arrastra tu imagen aquí o haz clic";
        document.getElementById('note-image-name').innerText = name;
        triggerAutoSave();
    });

    // Search Logic
    noteSearch?.addEventListener('input', (e) => {
        filterAndRenderNotes(e.target.value);
    });

    // Submission logic with storage
    noteForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('publish-note-btn');
        const originalText = submitBtn.innerText;

        try {
            submitBtn.disabled = true;
            submitBtn.innerText = "Publicando...";

            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) throw new Error("Debes iniciar sesión");

            let imageUrl = '';
            if (noteImageInput.files.length > 0) {
                imageUrl = await uploadNoteImage(noteImageInput.files[0]);
                extractedThumbnailUrl = null; // override extracted thumbnail
            } else if (extractedThumbnailUrl) {
                imageUrl = extractedThumbnailUrl;
            }

            const keywords = document.getElementById('note-keywords').value
                .split(',')
                .map(k => k.trim())
                .filter(k => k !== '');
            let contentJSON = '{}';
            if (editor) {
                const contentData = await editor.save();
                contentJSON = JSON.stringify(contentData);
            }

            const title = document.getElementById('note-title').value.trim();
            const noteData = {
                author_id: user.id,
                title: title,
                slug: generateSlug(title),
                type: document.getElementById('note-type').value,
                content: contentJSON,
                keywords: keywords,
                status: 'published'
            };

            if (imageUrl) {
                noteData.image_url = imageUrl;
            }

            if (currentDraftId) {
                const { error } = await supabaseClient.from('notes').update(noteData).eq('id', currentDraftId);
                if (error) throw error;
            } else {
                const { error } = await supabaseClient.from('notes').insert([noteData]);
                if (error) throw error;
            }

            showToast("Nota de Vanguardia publicada.", "success");
            noteModal.classList.add('hidden');
            noteForm.reset();
            if (quill) quill.setContents([]);
            currentDraftId = null;
            document.getElementById('note-image-name').innerText = "Arrastra tu imagen aquí o haz clic";
            loadNotes();

        } catch (error) {
            showToast(error.message, "error");
            submitBtn.disabled = false;
        } finally {
            submitBtn.innerText = originalText;
        }
    });

    if (postsFeed) {
        loadPosts();
    }
    if (notesFeed) {
        loadNotes();
    }

    // --- Home Page Enhancements (Hero, Map, Countdown) ---

    // 1. Hero Carousel Logic
    const heroItems = document.querySelectorAll('#hero-carousel .carousel-item');
    let currentHeroIndex = 0;

    if (heroItems.length > 0) {
        setInterval(() => {
            heroItems[currentHeroIndex].classList.remove('active');
            currentHeroIndex = (currentHeroIndex + 1) % heroItems.length;
            heroItems[currentHeroIndex].classList.add('active');
        }, 5000);
    }

    // 2. Countdown Logic (Campamento Nacional Jan 16, 2027)
    function updateCountdown() {
        const targetDate = new Date('January 16, 2027 00:00:00').getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0) {
            const d = Math.floor(difference / (1000 * 60 * 60 * 24));
            const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');

            if (daysEl) daysEl.innerText = d.toString().padStart(2, '0');
            if (hoursEl) hoursEl.innerText = h.toString().padStart(2, '0');
            if (minutesEl) minutesEl.innerText = m.toString().padStart(2, '0');
        }
    }

    if (document.getElementById('countdown')) {
        updateCountdown();
        setInterval(updateCountdown, 60000);
    }

    // 3. Mapa Interactivo Logic
    const rucaData = {
        'Ciudad de Buenos Aires': [
            { name: 'Agrupación Milicianos Nehuen', contact: '@milicianos.nehuen', type: 'Combatientes / Vanguardia' },
            { name: 'Agrupación Milicianos Palermo', contact: '@milicianos.palermo', type: 'Mixta' },
            { name: 'Agrupación Milicianos Pampero', contact: '@milicianos.pampero', type: 'Combatientes' }
        ],
        'Buenos Aires': [
            { name: 'Agrupación Milicianos Mar del Plata', contact: '@milicianos.mdq', type: 'Combatientes' }
        ],
        'Córdoba': [
            { name: 'Agrupación Milicianos Champaqui', contact: '@milicianos.cba', type: 'Vanguardia' },
            { name: 'Agrupación Milicianos Zona Sur', contact: '@milicianos.zonasur', type: 'Combatientes' },
            { name: 'Agrupación Milicianos Chapelco', contact: '@milicianos.chapelco', type: 'Combatientes' },
            { name: 'Agrupación Milicianos San Francisco', contact: '@milicianos.sanpancho', type: 'Mixta' }
        ],
        'Mendoza': [
            { name: 'Agrupación Milicianos Cura', contact: '@milicianos.mendoza', type: 'Combatientes' },
            { name: 'Agrupación Milicianos Llahué', contact: '@milicianos.llahue', type: 'Vanguardia' }
        ],
        'San Juan': [
            { name: 'Agrupación Milicianos Choroy', contact: '@milicianos.sanjuan', type: 'Mixta' }
        ],
        'Santa Fe': [
            { name: 'Agrupación Milicianos Rosario', contact: '@milicianos.rosario', type: 'Mixta' }
        ],
        'Tucumán': [
            { name: 'Agrupación Milicianos Takay', contact: '@milicianos.tuc', type: 'Combatientes' },
            { name: 'Agrupación Milicianos Ayllú', contact: '@milicianos.ayllu', type: 'Vanguardia' },
            { name: 'Agrupación Milicianos Boisdron', contact: '@milicianos.boisdron', type: 'Mixta' },
            { name: 'Agrupación Milicianos Allumine', contact: '@milicianos.allumine', type: 'Vanguardia' }
        ],
        'Chaco': [
            { name: 'Agrupación Milicianos Cupai Pora', contact: '@milicianos.chaco', type: 'Mixta' }
        ],
        'Jujuy': [
            { name: 'Agrupación Milicianos Cunumi', contact: '@milicianos.jujuy', type: 'Mixta' }
        ],
        'Salta': [
            { name: 'Agrupación Milicianos Aitue', contact: '@milicianos.salta', type: 'Mixta' }
        ],
        'Catamarca': [
            { name: 'Agrupación Milicianos Del Valle', contact: '@milicianos.catamarca', type: 'Mixta' }
        ]
    };

    const mapContainer = document.getElementById('argentina-map-svg');
    if (mapContainer) {
        // En un entorno productivo, cargaríamos el SVG mediante fetch
        // Por ahora, inyectamos un marcador de posición y el script lo llenará
        mapContainer.innerHTML = 'Cargando visualización...';

        // Simulo la carga del SVG (inyectando solo las provincias clave para validar)
        fetch('ar.svg').then(r => r.text()).then(svg => {
            mapContainer.innerHTML = svg;
            initMapEvents();
        }).catch(() => {
            // Fallback: Si el fetch falla (común en local sin server), inyecto el SVG manualmente
            // Nota: El usuario proporcionó el SVG en C:/Users/juani/Downloads/ar.svg
            // Para este entorno, intentaré inyectar el contenido que vi antes.
        });
    }

    function initMapEvents() {
        const provinces = document.querySelectorAll('#features path');
        const emptyState = document.getElementById('ruca-empty-state');
        const detailsPanel = document.getElementById('ruca-details');
        const rucaList = document.getElementById('ruca-list');
        const provinceLabel = document.getElementById('province-name');

        provinces.forEach(p => {
            const name = p.getAttribute('name');
            p.classList.add('hover:opacity-70', 'transition-all', 'cursor-pointer');

            p.addEventListener('click', () => {
                showRucaInfo(name, p);
            });
        });

        function showRucaInfo(province, element) {
            // Reset styles
            provinces.forEach(path => path.setAttribute('fill', '#ececec'));
            element.setAttribute('fill', '#960317');

            emptyState.classList.add('hidden');
            detailsPanel.classList.remove('hidden');
            provinceLabel.innerText = province;

            const rucas = rucaData[province] || [];
            if (rucas.length === 0) {
                rucaList.innerHTML = `<p class="text-zinc-500 italic text-sm py-8 border-2 border-dashed border-white/5 rounded-2xl">Aún no tenemos agrupaciones registradas en esta provincia.</p>`;
            } else {
                rucaList.innerHTML = rucas.map(r => `
                    <div class="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all">
                        <div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <span class="material-symbols-outlined">fort</span>
                        </div>
                        <div>
                            <h5 class="text-white font-bold">${r.name}</h5>
                            <p class="text-zinc-500 text-xs mb-2">${r.type}</p>
                            <span class="text-primary text-xs font-bold">${r.contact}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    // --- Initial Data Load ---
    if (typeof loadPosts === 'function') loadPosts();
    if (typeof loadNotes === 'function') loadNotes();
});
