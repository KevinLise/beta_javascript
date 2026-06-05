// ============================================================
// ROUTER SPA (Single Page Application)
// Maneja la navegación sin recargar la página usando
// la History API del navegador (pushState)
// ============================================================
import LoginView    from './views/login.js'
import DashboardView from './views/dashboard.js'
import ProjectsView from './views/projects.js'
import { authService } from './services/auth.js'

class Router {
    constructor() {
        // Mapa de rutas: cada ruta apunta a su vista correspondiente
        this.routes = {
            '/login':     LoginView,
            '/dashboard': DashboardView,
            '/projects':  ProjectsView
        }
    }

    // Arranca el router renderizando la ruta actual
    init() {
        this.handleRoute()
    }

    /**
     * Lee la URL actual y renderiza la vista correspondiente.
     * También protege /dashboard para que solo accedan managers.
     */
    async handleRoute() {
        const path = window.location.pathname
        const app  = document.getElementById('app')
        if (!app) return

        // GUARDIA DE RUTA: /dashboard solo para managers
        if (path === '/dashboard') {
            const user = authService.getCurrentUser()
            if (!user || user.role !== 'manager') {
                this.navigate('/projects')
                return
            }
        }

        if (this.routes[path]) {
            // Crea una instancia de la vista, renderiza el HTML y ejecuta su lógica
            const ViewComponent = this.routes[path]
            const view          = new ViewComponent()
            const html          = await view.render()
            app.innerHTML       = html
            await view.mounted()
        } else {
            // Ruta desconocida → redirige según estado de sesión
            const isAuthenticated = authService.isAuthenticated()
            if (isAuthenticated) {
                const user = authService.getCurrentUser()
                this.navigate(user.role === 'manager' ? '/dashboard' : '/projects')
            } else {
                this.navigate('/login')
            }
        }
    }

    /**
     * Navega a una ruta sin recargar el navegador.
     * Usa pushState para actualizar la URL y luego renderiza la vista.
     * @param {string} path - Ruta destino, ej: '/projects'
     */
    navigate(path) {
        window.history.pushState({}, '', path)
        this.handleRoute()
    }
}

// Exporta una única instancia del router (Singleton)
export default new Router()
