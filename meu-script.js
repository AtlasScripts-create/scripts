(function() {
    let ativo = false;
    let visivel = true;

    // 1. Criar o Menu (Interface)
    const menu = document.createElement('div');
    menu.id = 'meu-menu-khan';
    Object.assign(menu.style, {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        padding: '20px',
        backgroundColor: '#1a1a1a',
        color: 'white',
        borderRadius: '12px',
        border: '2px solid #008489', // Cor oficial do Khan Academy
        zIndex: '99999',
        fontFamily: 'sans-serif',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        textAlign: 'center',
        minWidth: '150px'
    });

    menu.innerHTML = `
        <h3 style="margin:0 0 10px 0; color:#008489">VOID ATLAS</h3>
        <p style="font-size:12px; margin-bottom:15px;">Status: <span id="status-texto" style="color:red">Desativado</span></p>
        <button id="btn-ativar" style="padding:8px 15px; cursor:pointer; background:#008489; color:white; border:none; border-radius:5px; font-weight:bold; width:100%">ATIVAR</button>
        <p style="font-size:10px; margin-top:10px; color:#aaa">Pressione F2 para esconder</p>
    `;

    document.body.appendChild(menu);

    // 2. Lógica do Botão Ativar/Desativar
    const btn = document.getElementById('btn-ativar');
    const statusTxt = document.getElementById('status-texto');

    btn.onclick = () => {
        ativo = !ativo;
        if (ativo) {
            btn.innerText = "DESATIVAR";
            btn.style.background = "#ff4d4d";
            statusTxt.innerText = "Ativado";
            statusTxt.style.color = "#00ff00";
            iniciarAutomacao();
        } else {
            btn.innerText = "ATIVAR";
            btn.style.background = "#008489";
            statusTxt.innerText = "Desativado";
            statusTxt.style.color = "red";
        }
    };

    // 3. Atalho F2 para esconder/mostrar
    window.addEventListener('keydown', (e) => {
        if (e.key === "F2") {
            visivel = !visivel;
            menu.style.display = visivel ? 'block' : 'none';
        }
    });

    // 4. Lógica de Resposta (A parte difícil)
    // Nota: Resolver questões automaticamente exige encontrar os dados internos do site.
    // Para começar, vamos fazer algo que detecta se há uma questão na tela.
    function iniciarAutomacao() {
        if (!ativo) return;

        console.log("VOID ATLAS: Buscando respostas...");
        
        // Exemplo: Tenta encontrar o botão "Verificar" e clica se estiver ativo
        const botoes = document.querySelectorAll('button');
        botoes.forEach(b => {
            if (b.innerText.includes("Verificar") || b.innerText.includes("Próxima")) {
                console.log("Botão encontrado!");
                // Aqui no futuro adicionaremos a lógica para marcar a opção correta
            }
        });

        // Repete a busca a cada 2 segundos se estiver ativado
        if (ativo) setTimeout(iniciarAutomacao, 2000);
    }

})();
