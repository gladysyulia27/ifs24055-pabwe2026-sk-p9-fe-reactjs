const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'https://ifs24055-pabwe2026-sk-p9-be-golang-gin.s1if.cloud/api'
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  let payload = {}
  try { payload = await response.json() } catch { /* non-JSON response */ }
  if (!response.ok || payload.status === 'error' || payload.status === 'fail') {
    throw new Error(payload.message || `Request failed (${response.status})`)
  }
  return payload.data
}
