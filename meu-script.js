(function() {
    let ativo = false;
    let visivel = true;
    let respostasEncontradas = [];

    // --- 1. INTERCEPTADOR DE RESPOSTAS (O "Coração" do Script) ---
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const clone = response.clone();
        
        if (args[0] && args[0].includes("graphql")) {
            clone.json().then(data => {
                try {
                    // Procura por dados de questões (assessmentItem)
                    const item = data.data?.assessmentItem?.item?.itemData;
                    if (item) {
                        const questao = JSON.parse(item);
                        extrairRespostas(questao);
                    }
                } catch (e) {}
            });
        }
        return response;
    };

    function extrairRespostas(questao) {
        respostasEncontradas = [];
        const widgets = questao.question.widgets;
        for (let key in widgets) {
            const w = widgets[key];
            if (w.type === "radio") { // Múltipla escolha
                w.options.choices.forEach((c, i) => {
                    if (c.correct) respostasEncontradas.push({ type: 'radio', index: i });
                });
            } else if (w.type === "numeric-input") { // Número
                const correct = w.options.answers.find(a => a.status === "correct");
                if (correct) respostasEncontradas.push({ type: 'text', value: correct.value });
            }
        }
        if (respostasEncontradas.length > 0 && ativo) {
            console.log("VOID ATLAS: Respostas capturadas!", respostasEncontradas);
            setTimeout(aplicarRespostas, 500);
        }
    }

    // --- 2. APLICADOR DE RESPOSTAS (Preenche o site) ---
    function aplicarRespostas() {
        if (!ativo) return;

        respostasEncontradas.forEach(r => {
            if (r.type === 'radio') {
                const opcoes = document.querySelectorAll('[role="radiogroup"] [role="radio"], .perseus-widget-container input[type="radio"]');
                if (opcoes[r.index]) opcoes[r.index].click();
            } else if (r.type === 'text') {
                const inputs = document.querySelectorAll('input[type="text"], input[type="tel"]');
                inputs.forEach(i => { i.value = r.value; i.dispatchEvent(new Event('input', { bubbles: true })); });
            }
        });

        // Clica no botão "Verificar" automaticamente após preencher
        setTimeout(() => {
            const btnVerificar = document.querySelector('button[data-testid="exercise-check-answer"], button:contains("Verificar")');
            if (btnVerificar) btnVerificar.click();
        }, 500);
    }

    // --- 3. INTERFACE (Seu Menu) ---
    const menu = document.createElement('div');
    Object.assign(menu.style, {
        position: 'fixed', bottom: '20px', left: '20px', padding: '15px',
        backgroundColor: '#111', color: '#0f0', borderRadius: '10px',
        border: '2px solid #008489', zIndex: '100000', fontFamily: 'monospace'
    });

    menu.innerHTML = `
        <div style="text-align:center; font-weight:bold; margin-bottom:10px">VOID ATLAS V1.0</div>
        <button id="btn-toggle" style="width:100%; padding:5px; cursor:pointer; background:#222; color:#0f0; border:1px solid #0f0">ATIVAR HACK</button>
        <div style="font-size:10px; margin-top:5px; color:#888">F2 para Esconder | Auto-Check: ON</div>
    `;
    document.body.appendChild(menu);

    document.getElementById('btn-toggle').onclick = function() {
        ativo = !ativo;
        this.style.background = ativo ? "#0f0" : "#222";
        this.style.color = ativo ? "#000" : "#0f0";
        this.innerText = ativo ? "HACK ATIVADO" : "ATIVAR HACK";
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === "F2") {
            visivel = !visivel;
            menu.style.display = visivel ? 'block' : 'none';
        }
    });
})();
