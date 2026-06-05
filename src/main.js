// ============================================================
// PUNTO DE ENTRADA DE LA APLICACIÓN
// Importa estilos, router y servicio de autenticación
// ============================================================
import './style.css'
import router from './router.js'
import { authService } from './services/auth.js'

/**
 * Verifica si el usuario tiene sesión activa y redirige según corresponda.
 * - Sin sesión → va a /login
 * - Con sesión en /login → va a /dashboard (manager) o /projects (collaborator)
 */
const checkAuth = () => {
    const currentPath      = window.location.pathname
    const isAuthenticated  = authService.isAuthenticated()

    if (!isAuthenticated && currentPath !== '/login') {
        router.navigate('/login')
    } else if (isAuthenticated && currentPath === '/login') {
        const user = authService.getCurrentUser()
        router.navigate(user.role === 'manager' ? '/dashboard' : '/projects')
    }
}

// Inicializa el router y valida autenticación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    router.init()
    checkAuth()
})

// Re-valida autenticación cuando el usuario navega con el botón atrás/adelante
window.addEventListener('popstate', () => {
    router.handleRoute()
    checkAuth()
})
