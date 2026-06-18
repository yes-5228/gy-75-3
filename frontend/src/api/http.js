const API_BASE = import.meta.env.VITE_API_BASE || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = `Request failed: ${response.status}`
    try {
      const data = await response.json()
      if (data.error) {
        message = data.error
      } else if (data.message) {
        message = data.message
      } else if (typeof data === 'string' && data) {
        message = data
      }
    } catch {
      const text = await response.text()
      if (text) {
        message = text
      }
    }
    throw new Error(message)
  }

  return response.json()
}

export function get(path) {
  return request(path)
}

export function post(path, payload) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function patch(path, payload) {
  return request(path, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
