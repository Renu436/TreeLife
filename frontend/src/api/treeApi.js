const BASE = ''

export async function searchTree(query) {
  const r = await fetch(BASE + '/api/trees/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ search_query: query })
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function getForest() {
  const r = await fetch(BASE + '/api/forest')
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function getTree(id) {
  const r = await fetch(BASE + `/api/trees/${id}`)
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function chatWithTree(tree_id, message) {
  const r = await fetch(BASE + '/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tree_id, message })
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}
