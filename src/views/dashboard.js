// ============================================================
// VISTA DE DASHBOARD (solo Manager)
// Muestra estadísticas generales de proyectos y los 3 más recientes.
// ============================================================
import Navbar from './components/navbar.js'
import { projectsAPI } from '../services/api.js'
import router from '../router.js'

export default class DashboardView {

    /**
     * Retorna el HTML del dashboard con tarjetas de estadísticas
     * y una lista de proyectos recientes.
     */
    async render() {
        return `
        ${await Navbar.render()}
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-8">Dashboard</h1>

            <!-- Tarjetas de estadísticas -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="card text-center">
                    <p class="text-gray-500 dark:text-gray-400 mb-1">Total Projects</p>
                    <p id="totalProjects" class="text-4xl font-bold text-blue-600">—</p>
                </div>
                <div class="card text-center">
                    <p class="text-gray-500 dark:text-gray-400 mb-1">Active Projects</p>
                    <p id="activeProjects" class="text-4xl font-bold text-green-600">—</p>
                </div>
                <div class="card text-center">
                    <p class="text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                    <p id="completedProjects" class="text-4xl font-bold text-purple-600">—</p>
                </div>
            </div>

            <!-- Proyectos recientes -->
            <div class="card">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800 dark:text-white">Recent Projects</h2>
                    <button id="viewAllBtn" class="btn-primary">View All</button>
                </div>
                <div id="projectsList" class="space-y-4">
                    <p class="text-gray-400">Loading...</p>
                </div>
            </div>
        </div>`
    }

    /**
     * Se ejecuta después del render.
     * Monta la navbar, el botón de navegación y carga los datos.
     */
    async mounted() {
        await Navbar.mounted()

        // Botón para navegar a la lista completa de proyectos
        const viewAllBtn = document.getElementById('viewAllBtn')
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => router.navigate('/projects'))
        }

        await this.loadData()
    }

    /**
     * Carga los proyectos desde la API y actualiza las estadísticas
     * y la lista de proyectos recientes en el DOM.
     */
    async loadData() {
        try {
            const projects = await projectsAPI.getAll()

            // Actualiza los contadores de las tarjetas de estadística
            document.getElementById('totalProjects').textContent     = projects.length
            document.getElementById('activeProjects').textContent    = projects.filter(p => p.status !== 'Completed').length
            document.getElementById('completedProjects').textContent = projects.filter(p => p.status === 'Completed').length

            // Muestra los 3 proyectos más recientes (últimos creados)
            const recent = projects.slice(-3).reverse()
            const list   = document.getElementById('projectsList')
            if (!list) return

            if (recent.length === 0) {
                list.innerHTML = '<p class="text-gray-400">No projects yet.</p>'
                return
            }

            list.innerHTML = recent.map(p => `
                <div class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <h3 class="font-semibold text-gray-800 dark:text-white">${p.name}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${p.description}</p>
                    <span class="mt-2 inline-block px-2 py-1 text-xs rounded-full ${this.statusColor(p.status)}">
                        ${p.status}
                    </span>
                </div>
            `).join('')

        } catch (err) {
            console.error('Dashboard load error:', err)
        }
    }

    /**
     * Retorna clases de Tailwind según el estado del proyecto.
     * @param {string} status - 'Planning' | 'In Progress' | 'Completed'
     * @returns {string} - Clases CSS de color
     */
    statusColor(status) {
        return {
            'Planning':    'bg-yellow-100 text-yellow-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            'Completed':   'bg-green-100 text-green-800'
        }[status] ?? 'bg-gray-100 text-gray-800'
    }
}
