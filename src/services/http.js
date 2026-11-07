import axios from 'axios'

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

// Ajoute le JWT, sauf pour les routes publiques (lecture seule, sans compte)
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && !config.url.startsWith('/public') && config.url !== '/auth/login') {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Session expirée : retour à la connexion
http.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401 && !e.config.url.startsWith('/public') && e.config.url !== '/auth/login') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/connexion'
    }
    return Promise.reject(e)
  }
)

export default http