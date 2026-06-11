(async function() {
    // Link base para o seu repositório no GitHub
    const baseUrl = "https://raw.githubusercontent.com/AtlasScripts-create/scripts/main/";
    
    console.log("VOID ATLAS: Carregando módulos..." );

    async function loadModule(path) {
        try {
            const response = await fetch(baseUrl + path + "?t=" + Date.now());
            const script = await response.text();
            eval(script);
        } catch (e) {
            console.error("Erro ao carregar módulo:", path, e);
        }
    }

    // Carrega a interface e o sistema de respostas
    await loadModule("modules/ui.js");
    await loadModule("modules/solver.js");
})();
