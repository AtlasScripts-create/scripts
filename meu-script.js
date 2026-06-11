(function() {
    let ativo = false;
    let visivel = true;
    let respostasEncontradas = [];

    // --- 1. INTERFACE VOID ATLAS V4 (Limpa) ---
    const menu = document.createElement('div');
    Object.assign(menu.style, {
        position: 'fixed', bottom: '20px', left: '20px', padding: '15px',
        backgroundColor: '#111', color: '#0f0', borderRadius: '8px',
        border: '2px solid #008489', zIndex: '1000000', fontFamily: 'sans-serif',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)', width: '180px'
    });

    menu.innerHTML = `
        <div style="text-align:center; font-weight:bold; margin-bottom:10px; color:#008489">VOID ATLAS V4</div>
        <button id="btn-toggle-hack" style="width:100%; padding:10px; cursor:pointer; background:#222; color:#0f0; border:1px solid #0f0; border-radius:4px; font-weight:bold">ATIVAR</button>
        <div id="log-status" style="font-size:10px; margin-top:10px; text-align:center; color:#888">Aguardando questão...</div>
        <div style="font-size:9px; margin-top:5px; text-align:center; color:#555">F2 para Ocultar</div>
    `;
    document.body.appendChild(menu);

    const updateStatus = (msg, color = "#888") => {
        const s = document.getElementById('log-status');
        s.innerText = msg;
        s.style.color = color;
    };

    // --- 2. INTERCEPTADOR SEGURO (Não quebra o site) ---
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const result = await originalFetch(...args);
        
        // Se for uma requisição de dados do Khan, analisamos uma cópia
        if (args[0] && args[0].includes("graphql")) {
            const clone = result.clone();
            clone.json().then(data => {
                try {
                    const itemData = data.data?.assessmentItem?.item?.itemData;
                    if (itemData) {
                        const questao = JSON.parse(itemData);
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
                        if (respostasEncontradas.length > 0) {
                            updateStatus("✅ Resposta pronta!", "#0f0");
                            if (ativo) setTimeout(aplicarRespostas, 500);
                        }
                    }
                } catch (e) {}
            }).catch(() => {});
        }
        return result;
    };

    // --- 3. APLICADOR DE RESPOSTAS ---
    function aplicarRespostas() {
        if (!ativo || respostasEncontradas.length === 0) return;
        
        respostasEncontradas.forEach(r => {
            if (r.type === 'radio') {
                const opcoes = document.querySelectorAll('[role="radio"], input[type="radio"]');
                if (opcoes[r.index]) opcoes[r.index].click();
            } else if (r.type === 'text') {
                const inputs = document.querySelectorAll('input[type="text"], input[type="tel"]');
                if (inputs[0]) {
                    inputs[0].value = r.value;
                    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });

        // Clica no botão Verificar
        setTimeout(() => {
            const btn = document.querySelector('button[data-testid="exercise-check-answer"]') || 
                        Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("Verificar"));
            if (btn) btn.click();
        }, 500);
    }

    // --- 4. CONTROLES ---
    const btn = document.getElementById('btn-toggle-hack');
    btn.onclick = () => {
        ativo = !ativo;
        btn.innerText = ativo ? "DESATIVAR" : "ATIVAR";
        btn.style.background = ativo ? "#0f0" : "#222";
        btn.style.color = ativo ? "#000" : "#0f0";
        if (ativo) {
            updateStatus("Hack Ligado", "#0f0");
            aplicarRespostas();
        } else {
            updateStatus("Hack Desligado", "#888");
        }
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === "F2") {
            visivel = !visivel;
            menu.style.display = visivel ? 'block' : 'none';
        }
    });
})();
