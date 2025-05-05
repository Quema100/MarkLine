const header = () => {
    const toggle = document.getElementById('mode-toggle');
    const body = document.body;

    let savedMode = localStorage.getItem('mode') || 'light-mode';


    body.classList.add(savedMode);
    toggle.checked = savedMode === 'dark-mode';

    toggle.addEventListener('change', () => {
        const newMode = toggle.checked ? 'dark-mode' : 'light-mode';
        body.classList.replace(savedMode, newMode);
        localStorage.setItem('mode', newMode);
        savedMode = newMode;
    });
};

window.onload = () => { header(), Eventlist(), bookmark(), timeline(), renderLists() };
