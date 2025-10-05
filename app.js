function createCardForEvent(ev) {
    const div = document.createElement('div');
    div.className = 'event-card';
    const start = new Date(ev.start_datetime);
    div.innerHTML = `
    <h3>${escapeHtml(ev.name)}</h3>
    <div class="event-meta">${start.toLocaleString()} · ${escapeHtml(ev.city || '')} · ${escapeHtml(ev.category || '')}</div>
    <p>${escapeHtml(ev.short_description || '')}</p>
    <div class="progress" aria-hidden="true"><i style="width:${getProgressPercent(ev)}%"></i></div>
    <p><a href="event.html?id=${ev.id}">View details</a></p>
  `;
    return div;
}

function getProgressPercent(ev) {
    const goal = Number(ev.goal_amount || 0);
    const progress = Number(ev.progress_amount || 0);
    if (!goal) return 0;
    const pct = Math.round((progress / goal) * 100);
    return Math.min(100, Math.max(0, pct));
}

function escapeHtml(s) {
    if (!s && s !== 0) return '';
    return String(s).replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
}
