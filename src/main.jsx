import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.jsx'

// ── Admin token on every same-origin API write ───────────────────────────
// The API routes in this tool used to accept writes from anyone. They now
// require NC_ADMIN_TOKEN. Rather than thread a header through every call
// site in app.jsx / AddProject.jsx, patch fetch once: same-origin /api/
// requests that are not GET carry the token, and a 401 prompts for it and
// retries exactly once so a wrong paste doesn't loop.
const TOKEN_KEY = 'nc_admin_token'
const isApiWrite = (input, init) => {
  const url = typeof input === 'string' ? input : (input && input.url) || ''
  const method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase()
  return url.startsWith('/api/') && method !== 'GET'
}
const withToken = (init, token) => {
  const headers = new Headers((init && init.headers) || {})
  headers.set('x-nc-token', token || '')
  return { ...(init || {}), headers }
}
const nativeFetch = window.fetch.bind(window)
window.fetch = async (input, init) => {
  if (!isApiWrite(input, init)) return nativeFetch(input, init)
  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    token = window.prompt('Admin token (set once, stored in this browser):') || ''
    if (token) localStorage.setItem(TOKEN_KEY, token)
  }
  let res = await nativeFetch(input, withToken(init, token))
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY)
    const retry = window.prompt('That token was rejected. Try again:') || ''
    if (!retry) return res
    localStorage.setItem(TOKEN_KEY, retry)
    res = await nativeFetch(input, withToken(init, retry))
  }
  return res
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
