(function() {
    let ativo = false;
    let visivel = true;
    let respostasEncontradas = [];

    // --- 1. ESTILO "XCLOUD HIGH CONTRAST" ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* Cores vibrantes e fundo escuro total */
        html, body {
            background-color: #000000 !important;
            color: #ffffff !important;
        }
        /* Bordas nítidas em botões e inputs */
        button, input, select, [role="button"] {
            border: 2px solid #00ff00 !important; /* Verde XCloud */
            background-color: #111 !important;
            color: #00ff00 !important;
            font-weight: bold !important;
        }
        /* Links e textos de destaque */
        a, span, h1, h2, h3 {
            color: #00ff00 !important;
            text-shadow: 1px 1px 2px #000;
        }
        /* Esconde elementos de fundo que atrapalham o contraste */
        div[style*="background-color"] {
            background-color: #000 !important;
        }
    `;
    document.head.appendChild(style);

    // --- 2. INTERCEPTADOR DE RESPOSTAS ---
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        if (args[0] && args[0].includes("graphql")) {
            const clone = response.clone();
            clone.json().then(data => {
                try {
                    const item = data.data?.assessmentItem?.item?.itemData;
                    if (item) {
                        const questao = JSON.parse(item);
                        respostasEncontradas = [];
                        const widgets = questao.question.widgets;
                        for (let key in widgets) {
                            const w = widgets[key];
                            if (w.type === "radio") {
                                w.options.choices.forEach((c, i) => {
                                    if (c.correct) respostasEncontradas.push({ type: 'radio', index: i });
                                });
                            } else if (w.type === "numeric-input") {
                                const correct = w.options.answers.find(a => a.status === "correct");
                                if (correct) respostasEncontradas.push({ type: 'text', value: correct.value });
                            }
                        }
                        if (respostasEncontradas.length > 0 && ativo) {
                            setTimeout(aplicarRespostas, 800);
                        }
                    }
                } catch (e) {}
            });
        }
        return response;
    };

    function aplicarRespostas() {
        if (!ativo) return;
        respostasEncontradas.forEach(r => {
            if (r.type === 'radio') {
                const opcoes = document.querySelectorAll('[role="radiogroup"] [role="radio"], .perseus-widget-container input[type="radio"]');
                if (opcoes[r.index]) {
                    opcoes[r.index].click();
                    opcoes[r.index].dispatchEvent(new Event('click', { bubbles: true }));
                }
            } else if (r.type === 'text') {
                const inputs = document.querySelectorAll('input[type="text"], input[type="tel"]');
                inputs.forEach(i => { 
                    i.value = r.value; 
                    i.dispatchEvent(new Event('input', { bubbles: true }));
                    i.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
        });

        setTimeout(() => {
            const btnVerificar = document.querySelector('button[data-testid="exercise-check-answer"]');
            if (btnVerificar) btnVerificar.click();
        }, 600);
    }

    // --- 3. INTERFACE VOID ATLAS ---
    const menu = document.createElement('div');
    Object.assign(menu.style, {
        position: 'fixed', bottom: '20px', left: '20px', padding: '15px',
        backgroundColor: '#000', color: '#0f0', borderRadius: '5px',
        border: '3px solid #0f0', zIndex: '1000000', fontFamily: 'monospace',
        boxShadow: '0 0 20px #0f0'
    });

    menu.innerHTML = `
        <div style="text-align:center; font-weight:bold; margin-bottom:10px; border-bottom: 1px solid #0f0">VOID ATLAS V2</div>
        <button id="btn-toggle-hack" style="width:100%; padding:10px; cursor:pointer; background:#000; color:#0f0; border:2px solid #0f0; font-family:monospace">OFF</button>
        <div style="font-size:10px; margin-top:8px; text-align:center">F2: OCULTAR | CONTRASTE: ON</div>
    `;
    document.body.appendChild(menu);

    // Lógica corrigida do botão
    const btn = document.getElementById('btn-toggle-hack');
    btn.addEventListener('click', function() {
        ativo = !ativo;
        if (ativo) {
            btn.innerText = "HACK: ON";
            btn.style.backgroundColor = "#0f0";
            btn.style.color = "#000";
            console.log("VOID ATLAS: Ativado!");
        } else {
            btn.innerText = "HACK: OFF";
            btn.style.backgroundColor = "#000";
            btn.style.color = "#0f0";
            console.log("VOID ATLAS: Desativado!");
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === "F2") {
            visivel = !visivel;
            menu.style.display = visivel ? 'block' : 'none';
        }
    });
})();
