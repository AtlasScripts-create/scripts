(function() {
    window.va_ativo = false;
    let respostas = [];

    // Interceptador de Fetch (Versão Silenciosa)
    const nativeFetch = window.fetch;
    window.fetch = function() {
        return nativeFetch.apply(this, arguments).then(res => {
            if (res.ok && arguments[0] && arguments[0].includes("graphql")) {
                res.clone().json().then(json => {
                    const itemData = json.data?.assessmentItem?.item?.itemData;
                    if (itemData) {
                        const parsed = JSON.parse(itemData);
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
                            window.va_updateStatus("QUESTÃO PRONTA", "#0f0");
                            if (window.va_ativo) setTimeout(resolver, 500);
                        }
                    }
                }).catch(()=>{});
            }
            return res;
        });
    };

    function resolver() {
        if (!window.va_ativo || respostas.length === 0) return;
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
            const btn = document.querySelector('button[data-testid="exercise-check-answer"]');
            if (btn) btn.click();
        }, 500);
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === "F4") {
            window.va_ativo = !window.va_ativo;
            window.va_updateStatus(window.va_ativo ? "AUTO-MODE ON" : "AUTO-MODE OFF", window.va_ativo ? "#0f0" : "#f00");
        }
    });
})();
