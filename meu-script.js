(function() {
    let ativo = false;
    let visivel = true;
    let respostasEncontradas = [];

    // --- 1. INTERFACE VOID ATLAS V3 ---
    const menu = document.createElement('div');
    Object.assign(menu.style, {
        position: 'fixed', bottom: '20px', left: '20px', padding: '15px',
        backgroundColor: '#000', color: '#0f0', borderRadius: '5px',
        border: '3px solid #0f0', zIndex: '1000000', fontFamily: 'monospace',
        boxShadow: '0 0 20px #0f0', width: '200px'
    });

    menu.innerHTML = `
        <div style="text-align:center; font-weight:bold; margin-bottom:10px; border-bottom: 1px solid #0f0">VOID ATLAS V3</div>
        <button id="btn-toggle-hack" style="width:100%; padding:10px; cursor:pointer; background:#000; color:#0f0; border:2px solid #0f0; font-family:monospace; font-weight:bold">HACK: OFF</button>
        <div id="log-area" style="font-size:9px; margin-top:10px; color:#0f0; height:40px; overflow:hidden; border:1px solid #333; padding:2px">Aguardando dados...</div>
        <div style="font-size:10px; margin-top:5px; text-align:center; color:#888">F2: OCULTAR | PARANÁ ED.</div>
    `;
    document.body.appendChild(menu);

    const log = (msg) => {
        const area = document.getElementById('log-area');
        area.innerText = msg;
        console.log("VOID ATLAS:", msg);
    };

    // --- 2. INTERCEPTADOR DE DADOS (Fetch e XHR) ---
    function processarDados(json) {
        try {
            // Tenta encontrar a estrutura da questão no JSON
            let itemDataString = "";
            
            // Estrutura comum do GraphQL do Khan
            if (json.data?.assessmentItem?.item?.itemData) {
                itemDataString = json.data.assessmentItem.item.itemData;
            } 
            
            if (itemDataString) {
                const questao = JSON.parse(itemDataString);
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
                    log("✅ Respostas prontas!");
                    if (ativo) setTimeout(aplicarRespostas, 1000);
                }
            }
        } catch (e) { }
    }

    // Intercepta Fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        if (args[0] && args[0].includes("graphql")) {
            const clone = response.clone();
            clone.json().then(data => processarDados(data));
        }
        return response;
    };

    // --- 3. APLICADOR DE RESPOSTAS ---
    function aplicarRespostas() {
        if (!ativo || respostasEncontradas.length === 0) return;
        
        log("🚀 Aplicando...");
        respostasEncontradas.forEach(r => {
            if (r.type === 'radio') {
                const opcoes = document.querySelectorAll('[role="radio"], input[type="radio"]');
                if (opcoes[r.index]) {
                    opcoes[r.index].click();
                }
            } else if (r.type === 'text') {
                const inputs = document.querySelectorAll('input[type="text"], input[type="tel"]');
                if (inputs[0]) {
                    inputs[0].value = r.value;
                    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });

        // Clica em Verificar
        setTimeout(() => {
            const btn = document.querySelector('button[data-testid="exercise-check-answer"]') || 
                        document.querySelector('button[role="button"]:contains("Verificar")') ||
                        Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("Verificar"));
            if (btn) btn.click();
        }, 500);
    }

    // --- 4. CONTROLES ---
    const btn = document.getElementById('btn-toggle-hack');
    btn.onclick = () => {
        ativo = !ativo;
        btn.innerText = ativo ? "HACK: ON" : "HACK: OFF";
        btn.style.backgroundColor = ativo ? "#0f0" : "#000";
        btn.style.color = ativo ? "#000" : "#0f0";
        log(ativo ? "Ativado - Resolvendo..." : "Desativado");
        if (ativo) aplicarRespostas();
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === "F2") {
            visivel = !visivel;
            menu.style.display = visivel ? 'block' : 'none';
        }
    });

    log("Aguardando questão...");
})();
