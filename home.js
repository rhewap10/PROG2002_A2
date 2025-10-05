document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('events-grid');
    const err = document.getElementById('error-banner');
    try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('Network error');
        const json = await res.json();
        grid.innerHTML = '';
        if (!json.data || json.data.length === 0) {
            grid.innerHTML = '<p>No upcoming events found.</p>';
            return;
        }
        
        for (const ev of json.data) {


            const card = createCardForEvent(ev);
            grid.appendChild(card);
        }
    } catch (e) {
        console.error(e);
        err.textContent = 'Unable to load events. Check your server or database.';
    }
});
