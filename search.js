document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('search-form');
    const results = document.getElementById('search-results');
    const error = document.getElementById('search-error');
    const categorySelect = document.getElementById('category');


    try {
        const r = await fetch('/api/categories');
        const js = await r.json();
        js.data.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            categorySelect.appendChild(opt);
        });
    } catch (e) {
        console.warn('Failed to load categories', e);
    }

    document.getElementById('clear-filters').addEventListener('click', () => {
        form.reset();
        results.innerHTML = '';
        error.textContent = '';
    });

    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        results.innerHTML = '';
        error.textContent = '';
        const data = new FormData(form);
        const q = new URLSearchParams();
        if (data.get('date')) q.set('date', data.get('date'));
        if (data.get('city')) q.set('city', data.get('city'));
        if (data.get('category')) q.set('category', data.get('category'));
        const url = '/api/events/search?' + q.toString();
        try {
            const r = await fetch(url);
            if (!r.ok) throw new Error('Search failed');
            const js = await r.json();
            if (!js.data || js.data.length === 0) {
                results.innerHTML = '<p>No events match your filters.</p>';
                return;
            }
            js.data.forEach(evObj => {
                const card = createCardForEvent(evObj);
                results.appendChild(card);
            });
        } catch (e) {
            console.error(e);
            error.textContent = 'Search failed — try again later.';
        }
    });
});
