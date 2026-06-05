// ============================================================
// SERVICIO DE API
// Centraliza todas las llamadas HTTP a json-server usando Axios.
// Usa interceptores para manejar errores de forma global.
// ============================================================
import axios from 'axios'

// Instancia de Axios con la URL base de la API
const api = axios.create({
    baseURL: '/api', // El proxy de Vite redirige /api → http://localhost:3000
    headers: { 'Content-Type': 'application/json' }
})

// Interceptor de respuesta: si hay un error HTTP lo lanza para que
// cada llamada pueda manejarlo con try/catch
api.interceptors.response.use(
    (response) => response.data, // Extrae directamente el body de la respuesta
    (error) => {
        console.error('API Error:', error)
        throw error
    }
)

// ── Endpoints de proyectos ─────────────────────────────────
export const projectsAPI = {
    getAll:  ()           => api.get('/projects'),           // GET todos los proyectos
    getById: (id)         => api.get(`/projects/${id}`),     // GET un proyecto por ID
    create:  (data)       => api.post('/projects', data),    // POST crear proyecto
    update:  (id, data)   => api.put(`/projects/${id}`, data),   // PUT reemplaza proyecto completo
    patch:   (id, data)   => api.patch(`/projects/${id}`, data), // PATCH actualiza campos específicos
    delete:  (id)         => api.delete(`/projects/${id}`)   // DELETE eliminar proyecto
}

// ── Endpoints de usuarios ──────────────────────────────────
export const usersAPI = {
    getAll:  ()   => api.get('/users'),          // GET todos los usuarios
    getById: (id) => api.get(`/users/${id}`)     // GET un usuario por ID
}

export default api
