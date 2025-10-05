document.addEventListener('DOMContentLoaded', async () => {
    const detail = document.getElementById('event-detail');
    const err = document.getElementById('event-error');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || ''; 
    if (!id) {
        detail.innerHTML = '<p>Select an event from Home or Search, or provide an id via ?id=1</p>';
        return;
    }

    try {
        const r = await fetch('/api/events/' + encodeURIComponent(id));
        if (!r.ok) {
            if (r.status === 404) err.textContent = 'Event not found';
            else err.textContent = 'Failed to load event';
            return;
        }
        const ev = await r.json();
        const start = new Date(ev.start_datetime);
        const end = ev.end_datetime ? new Date(ev.end_datetime) : null;
        const progressPct = ev.goal_amount ? Math.round((ev.progress_amount / ev.goal_amount) * 100) : 0;

        detail.innerHTML = `
      <article>
        <h2>${escapeHtml(ev.name)}</h2>
        <div class="event-meta">${start.toLocaleString()}${end ? ' — ' + end.toLocaleString() : ''} · ${escapeHtml(ev.location || '')}</div>
        <p>${escapeHtml(ev.full_description || ev.short_description || '')}</p>

        <h4>Ticket</h4>
        <p>Price: ${ev.ticket_price ? ('$' + ev.ticket_price.toFixed(2)) : 'Free'}</p>

        <h4>Goal vs Progress</h4>
        <p>Raised: $${Number(ev.progress_amount || 0).toFixed(2)} of $${Number(ev.goal_amount || 0).toFixed(2)}</p>
        <div class="progress" aria-hidden="true"><i style="width:${progressPct}%"></i></div>

        <div style="margin-top:12px">
          <button id="registerBtn">Register</button>
        </div>
      </article>
    `;

        document.getElementById('registerBtn').addEventListener('click', () => {
            alert('This feature is currently under construction.');
        });

    } catch (e) {
        console.error(e);
        err.textContent = 'Unable to load event details';
    }
});
