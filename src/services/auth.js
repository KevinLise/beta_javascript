// ============================================================
// SERVICIO DE AUTENTICACIÓN
// Maneja login, logout y persistencia de sesión con localStorage.
// Los datos del usuario se guardan sin la contraseña por seguridad.
// ============================================================
import { usersAPI } from './api.js'

class AuthService {

    /**
     * Intenta autenticar al usuario comparando email y password
     * contra los usuarios registrados en json-server.
     * Si coincide, guarda la sesión en localStorage.
     * @param {string} email
     * @param {string} password
     * @returns {{ success: boolean, user?: object, error?: string }}
     */
    async login(email, password) {
        try {
            const users = await usersAPI.getAll()

            // Busca el usuario que coincida con email Y password
            const user = users.find(u => u.email === email && u.password === password)

            if (user) {
                // Desestructura para excluir la contraseña antes de guardar
                const { password: _, ...safe } = user
                localStorage.setItem('user', JSON.stringify(safe))
                localStorage.setItem('isAuthenticated', 'true')
                return { success: true, user: safe }
            }

            return { success: false, error: 'Invalid email or password' }
        } catch {
            return { success: false, error: 'Login failed. Please try again.' }
        }
    }

    /**
     * Cierra la sesión eliminando los datos del localStorage.
     */
    logout() {
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
    }

    /**
     * Verifica si hay una sesión activa.
     * @returns {boolean}
     */
    isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true'
    }

    /**
     * Obtiene el usuario actual desde localStorage.
     * @returns {object|null} - Objeto usuario o null si no hay sesión
     */
    getCurrentUser() {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    }

    /**
     * Verifica si el usuario actual tiene un rol específico.
     * @param {string} role - 'manager' o 'collaborator'
     * @returns {boolean}
     */
    hasRole(role) {
        const user = this.getCurrentUser()
        return user?.role === role
    }
}

// Exporta una única instancia del servicio (Singleton)
export const authService = new AuthService()
