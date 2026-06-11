(async function() {
    // Configuração do seu repositório (Vou usar o seu link do GitHub)
    const baseUrl = "https://raw.githubusercontent.com/AtlasScripts-create/scripts/main/";
    
    console.log("VOID ATLAS: Iniciando carregamento modular..." );

    async function loadModule(path) {
        try {
            const response = await fetch(baseUrl + path);
            const script = await response.text();
            eval(script);
            console.log(`Módulo [${path}] carregado.`);
        } catch (e) {
            console.error(`Erro ao carregar ${path}:`, e);
        }
    }

    // Carrega os módulos em ordem
    await loadModule("modules/ui.js");
    await loadModule("modules/solver.js");
})();
