(function() {
    'use strict';
    // --- CONFIGURAÇÃO INTERNA ---
    let ativo = false;
    let visivel = false;
    let respostas = [];

    // --- 1. INTERFACE (UI) ---
    const menu = document.createElement('div');
    Object.assign(menu.style, {
        position: 'fixed', top: '15px', right: '15px', padding: '12px',
        backgroundColor: '#111', color: '#0f0', borderRadius: '4px',
        border: '1px solid #008489', zIndex: '999999', fontFamily: 'monospace',
        fontSize: '12px', display: 'none', boxShadow: '0 0 15px rgba(0,0,0,0.5)'
    });
    menu.innerHTML = `<div style="font-weight:bold;color:#008489">VOID ATLAS v6</div><div id="va-st">STANDBY</div><div style="font-size:9px;color:#666;margin-top:5px">F2: MENU | F4: AUTO</div>`;
    document.body.appendChild(menu);

    const setStatus = (m, c) => { const s = document.getElementById('va-st'); if(s){s.innerText = m; s.style.color = c;} };

    // --- 2. CAPTURA DE DADOS (SILENCIOSA) ---
    const _fetch = window.fetch;
    window.fetch = function() {
        return _fetch.apply(this, arguments).then(res => {
            if (res.ok && arguments[0] && arguments[0].includes("graphql")) {
                res.clone().json().then(json => {
                    const data = json.data?.assessmentItem?.item?.itemData;
                    if (data) {
                        const p = JSON.parse(data);
                        respostas = [];
                        const w = p.question.widgets;
                        for (let k in w) {
                            if (w[k].type === "radio") {
                                w[k].options.choices.forEach((c, i) => { if (c.correct) respostas.push({t:'r', i:i}); });
                            } else if (w[k].type === "numeric-input") {
                                const a = w[k].options.answers.find(x => x.status === "correct");
                                if (a) respostas.push({t:'t', v:a.value});
                            }
                        }
                        if (respostas.length > 0) {
                            setStatus("PRONTO", "#0f0");
                            if (ativo) setTimeout(resolver, 500);
                        }
                    }
                }).catch(()=>{});
            }
            return res;
        });
    };

    // --- 3. RESOLVEDOR ---
    function resolver() {
        if (!ativo || respostas.length === 0) return;
        respostas.forEach(r => {
            if (r.t === 'r') {
                const o = document.querySelectorAll('[role="radio"], input[type="radio"]');
                if (o[r.i]) o[r.i].click();
            } else if (r.t === 't') {
                const i = document.querySelector('input[type="text"], input[type="tel"]');
                if (i) { i.value = r.v; i.dispatchEvent(new Event('input', {bubbles:true})); }
            }
        });
        setTimeout(() => {
            const b = document.querySelector('button[data-testid="exercise-check-answer"]');
            if (b) b.click();
        }, 500);
    }

    // --- 4. TECLAS ---
    window.addEventListener('keydown', (e) => {
        if (e.key === "F2") menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        if (e.key === "F4") {
            ativo = !ativo;
            setStatus(ativo ? "AUTO-ON" : "AUTO-OFF", ativo ? "#0f0" : "#f00");
            if (ativo) resolver();
        }
    });
    console.log("VA Loaded.");
})();
