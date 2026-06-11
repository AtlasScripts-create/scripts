(function() {
    const menu = document.createElement('div');
    menu.id = 'va-menu';
    Object.assign(menu.style, {
        position: 'fixed', top: '15px', right: '15px', padding: '12px',
        backgroundColor: '#000', color: '#0f0', borderRadius: '4px',
        border: '1px solid #008489', zIndex: '999999', fontFamily: 'monospace',
        fontSize: '12px', display: 'none', boxShadow: '0 0 15px rgba(0,132,137,0.4)'
    });

    menu.innerHTML = `
        <div style="font-weight:bold; border-bottom:1px solid #333; margin-bottom:8px">VOID ATLAS v5.1</div>
        <div id="va-status">STATUS: STANDBY</div>
        <div style="margin-top:8px; font-size:10px; color:#666">F2: OCULTAR | F4: AUTO-MODE</div>
    `;
    document.body.appendChild(menu);

    window.va_updateStatus = (msg, color = "#0f0") => {
        const s = document.getElementById('va-status');
        if(s) { s.innerText = "STATUS: " + msg; s.style.color = color; }
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === "F2") menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
})();
