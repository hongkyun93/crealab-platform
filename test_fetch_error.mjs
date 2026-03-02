fetch('http://localhost:3000/api/moment-proposals/update', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        id: '20c4c4af-f67f-44a5-927b-28f09d854df1',
        updates: {},
        conditionUpdates: { content_final_approved_at: new Date().toISOString() },
        workspaceId: '123'
    })
}).then(r => r.json().then(j => console.log(r.status, j))).catch(e => console.error(e))
