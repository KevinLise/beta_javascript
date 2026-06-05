// ============================================================
// COMPONENTE NAVBAR
// Barra de navegación superior con links según el rol del usuario,
// botón de dark mode y botón de logout.
// Es una clase con métodos estáticos porque no necesita instanciarse.
// ============================================================
import { authService } from '../../services/auth.js'
import router from '../../router.js'

export default class Navbar {

    /**
     * Retorna el HTML de la navbar.
     * Los links se filtran según el rol del usuario actual.
     */
    static async render() {
        const user      = authService.getCurrentUser()
        const isManager = user?.role === 'manager'

        return `
        <nav class="bg-white dark:bg-gray-800 shadow-md">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-6">
                        <span class="text-xl font-bold text-gray-800 dark:text-white">Project Manager</span>
                        <div class="hidden md:flex space-x-4">
                            <!-- El Dashboard solo aparece para managers -->
                            ${isManager
                                ? '<a href="#" data-link="/dashboard" class="text-gray-600 dark:text-gray-300 hover:text-blue-600">Dashboard</a>'
                                : ''}
                            <a href="#" data-link="/projects" class="text-gray-600 dark:text-gray-300 hover:text-blue-600">Projects</a>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <!-- Muestra el nombre y rol del usuario logueado -->
                        <span class="text-sm text-gray-600 dark:text-gray-300">
                            ${user?.name ?? ''}
                            <span class="text-blue-500">(${user?.role ?? ''})</span>
                        </span>
                        <!-- Toggle de dark mode -->
                        <button id="darkModeToggle" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">🌙</button>
                        <!-- Cierra la sesión y redirige al login -->
                        <button id="logoutBtn" class="btn-danger px-3 py-1 text-sm">Logout</button>
                    </div>
                </div>
            </div>
        </nav>`
    }

    /**
     * Se ejecuta después del render.
     * Registra los event listeners de logout, navegación y dark mode.
     */
    static async mounted() {
        // Logout: limpia la sesión y redirige al login
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            authService.logout()
            router.navigate('/login')
        })

        // Links con data-link usan el router en lugar de recargar la página
        document.querySelectorAll('[data-link]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault()
                router.navigate(link.getAttribute('data-link'))
            })
        })

        // Dark mode: alterna la clase 'dark' en el html y guarda preferencia
        const toggle = document.getElementById('darkModeToggle')
        if (toggle) {
            const apply = (dark) => {
                document.documentElement.classList.toggle('dark', dark)
                toggle.textContent = dark ? '☀️' : '🌙'
            }

            // Carga la preferencia guardada al montar
            apply(localStorage.getItem('darkMode') === 'true')

            toggle.addEventListener('click', () => {
                const dark = !document.documentElement.classList.contains('dark')
                localStorage.setItem('darkMode', dark)
                apply(dark)
            })
        }
    }
}
