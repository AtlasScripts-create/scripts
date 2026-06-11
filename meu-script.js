(function() {
    'use strict';
    let ativo = false;
    let visivel = false; // Começa escondido para ser discreto
    let respostas = [];

    // --- 1. INTERFACE DISCRETA ---
    const painel = document.createElement('div');
    Object.assign(painel.style, {
        position: 'fixed', top: '10px', right: '10px', padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)', color: '#0f0', borderRadius: '4px',
        border: '1px solid #333', zIndex: '2147483647', fontFamily: 'monospace',
        fontSize: '12px', display: 'none', boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    });
    painel.innerHTML = `
        <div style="border-bottom:1px solid #333;margin-bottom:5px;padding-bottom:2px">VA-INTERNAL v5</div>
        <div id="va-status">STATUS: STANDBY</div>
        <div id="va-info" style="color:#888;font-size:10px">F2: TOGGLE</div>
    `;
    document.body.appendChild(painel);

    // --- 2. INTERCEPTOR ULTRA-SEGURO (Não quebra o site) ---
    const nativeFetch = window.fetch;
    window.fetch = function() {
        return nativeFetch.apply(this, arguments).then(res => {
            if (res.ok && arguments[0] && arguments[0].includes("graphql")) {
                res.clone().json().then(json => {
                    const data = json.data?.assessmentItem?.item?.itemData;
                    if (data) {
                        const parsed = JSON.parse(data);
                        respostas = [];
                        const widgets = parsed.question.widgets;
                        for (let k in widgets) {
                            const w = widgets[k];
                            if (w.type === "radio") {
                                w.options.choices.forEach((c, i) => { if (c.correct) respostas.push({t:'r', i:i}); });
                            } else if (w.type === "numeric-input") {
                                const c = w.options.answers.find(a => a.status === "correct");
                                if (c) respostas.push({t:'t', v:c.value});
                            }
                        }
                        if (respostas.length > 0) {
                            document.getElementById('va-status').innerText = "STATUS: READY";
                            if (ativo) setTimeout(executar, 600);
                        }
                    }
                }).catch(()=>{});
            }
            return res;
        });
    };

    // --- 3. EXECUÇÃO SILENCIOSA ---
    function executar() {
        if (!ativo || respostas.length === 0) return;
        respostas.forEach(r => {
            if (r.t === 'r') {
                const els = document.querySelectorAll('[role="radio"], input[type="radio"]');
                if (els[r.i]) els[r.i].click();
            } else if (r.t === 't') {
                const input = document.querySelector('input[type="text"], input[type="tel"]');
                if (input) {
                    input.value = r.v;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });
        setTimeout(() => {
            const btn = document.querySelector('button[data-testid="exercise-check-answer"]') || 
                        Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("Verificar"));
            if (btn) btn.click();
        }, 500);
    }

    // --- 4. COMANDOS DE TECLADO ---
    window.addEventListener('keydown', (e) => {
        if (e.key === "F2") {
            visivel = !visivel;
            painel.style.display = visivel ? 'block' : 'none';
        }
        if (e.key === "F4") { // Atalho rápido para ligar/desligar sem abrir menu
            ativo = !ativo;
            document.getElementById('va-status').innerText = ativo ? "STATUS: ACTIVE" : "STATUS: STANDBY";
            document.getElementById('va-status').style.color = ativo ? "#0f0" : "#f00";
        }
    });
})();
