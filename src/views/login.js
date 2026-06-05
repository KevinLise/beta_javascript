// ============================================================
// VISTA DE LOGIN
// Muestra el formulario de inicio de sesión y maneja
// el proceso de autenticación del usuario.
// ============================================================
import { authService } from '../services/auth.js'
import router from '../router.js'

export default class LoginView {

    /**
     * Retorna el HTML del formulario de login.
     * Se llama antes de montar los event listeners.
     */
    async render() {
        return `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div class="card w-full max-w-md mx-4">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Project Manager</h1>
                    <p class="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
                </div>

                <!-- Mensaje de error (oculto por defecto) -->
                <div id="errorMessage" class="hidden mb-4 p-3 bg-red-100 text-red-700 rounded-lg"></div>

                <form id="loginForm">
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="email" class="input-field" required>
                    </div>
                    <div class="mb-6">
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <input type="password" id="password" class="input-field" required>
                    </div>
                    <button type="submit" id="submitBtn" class="btn-primary w-full">Sign In</button>
                </form>

                <!-- Credenciales de prueba para facilitar el testing -->
                <div class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p>Manager: manager@test.com / 123456</p>
                    <p>Collaborator: user@test.com / 123456</p>
                </div>
            </div>
        </div>`
    }

    /**
     * Se ejecuta después de que el HTML está en el DOM.
     * Agrega el listener al formulario y maneja el submit.
     */
    async mounted() {
        const form      = document.getElementById('loginForm')
        const errorDiv  = document.getElementById('errorMessage')
        const submitBtn = document.getElementById('submitBtn')

        form.addEventListener('submit', async (e) => {
            e.preventDefault()

            const email    = document.getElementById('email').value
            const password = document.getElementById('password').value

            // Muestra estado de carga mientras se procesa
            submitBtn.textContent = 'Loading...'
            submitBtn.disabled    = true
            errorDiv.classList.add('hidden')

            const result = await authService.login(email, password)

            if (result.success) {
                // Redirige según el rol del usuario autenticado
                router.navigate(result.user.role === 'manager' ? '/dashboard' : '/projects')
            } else {
                // Muestra el error y rehabilita el botón
                errorDiv.textContent = result.error
                errorDiv.classList.remove('hidden')
                submitBtn.textContent = 'Sign In'
                submitBtn.disabled    = false
            }
        })
    }
}
