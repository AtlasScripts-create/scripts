(function() {
    // Cria um elemento de texto na tela
    const banner = document.createElement('div');
    banner.innerText = "VOID ATLAS";
    
    // Estiliza o texto para ficar bem visível e bonito
    Object.assign(banner.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 30px',
        backgroundColor: '#000',
        color: '#0f0', // Verde estilo hacker
        fontSize: '24px',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        borderRadius: '10px',
        border: '2px solid #0f0',
        zIndex: '10000',
        boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)',
        cursor: 'pointer'
    });

    // Faz o banner sumir quando você clica nele
    banner.onclick = () => banner.remove();

    // Adiciona na página
    document.body.appendChild(banner);
    
    // Opcional: mantém o efeito de inverter cores se você quiser
    const html = document.querySelector('html');
    html.style.filter = html.style.filter ? '' : 'invert(1) hue-rotate(180deg)';
})();
