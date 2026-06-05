// ============================================================
// VISTA DE PROYECTOS
// Muestra la lista de proyectos con búsqueda y filtros.
// Manager: puede crear, editar y eliminar proyectos.
// Collaborator: solo ve sus proyectos y puede cambiar el estado.
// ============================================================
import Navbar from './components/navbar.js'
import { projectsAPI, usersAPI } from '../services/api.js'
import { authService } from '../services/auth.js'

export default class ProjectsView {
    constructor() {
        this.currentProject = null  // Proyecto siendo editado (null = modo creación)
        this.searchTerm     = ''    // Término de búsqueda actual
        this.statusFilter   = ''    // Filtro de estado actual
        this.allProjects    = []    // Cache de proyectos cargados
        this.users          = []    // Lista de usuarios para el selector
    }

    /**
     * Retorna el HTML de la vista de proyectos.
     * El botón "Create Project" solo aparece para managers.
     */
    async render() {
        const isManager = authService.hasRole('manager')
        return `
        ${await Navbar.render()}
        <div class="container mx-auto px-4 py-8">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Projects</h1>
                <!-- Solo el manager puede crear proyectos -->
                ${isManager ? '<button id="createProjectBtn" class="btn-primary">+ Create Project</button>' : ''}
            </div>

            <!-- Barra de búsqueda y filtro por estado -->
            <div class="card mb-6">
                <div class="flex flex-col md:flex-row gap-4">
                    <input type="text" id="searchInput" placeholder="Search projects..." class="input-field flex-1">
                    <select id="statusFilter" class="input-field md:w-48">
                        <option value="">All Status</option>
                        <option value="Planning">Planning</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            <!-- Spinner de carga -->
            <div id="loadingSpinner" class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <!-- Grid de tarjetas de proyectos -->
            <div id="projectsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hidden"></div>
        </div>

        <!-- Modal de crear/editar proyecto -->
        <div id="projectModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="card w-full max-w-md mx-4 max-h-screen overflow-y-auto">
                <h2 id="modalTitle" class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Create Project</h2>
                <form id="projectForm">
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
                        <input type="text" id="projectName" class="input-field" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea id="projectDescription" rows="3" class="input-field" required></textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <select id="projectStatus" class="input-field">
                            <option value="Planning">Planning</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div class="mb-6">
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Assign To</label>
                        <select id="projectAssignedTo" class="input-field"></select>
                    </div>
                    <div class="flex gap-2">
                        <button type="submit" class="btn-primary flex-1">Save</button>
                        <button type="button" id="closeModal" class="btn-danger">Cancel</button>
                    </div>
                </form>
            </div>
        </div>`
    }

    /**
     * Se ejecuta después del render.
     * Carga usuarios, proyectos y configura los event listeners.
     */
    async mounted() {
        await Navbar.mounted()

        // Carga los usuarios para el selector del modal
        try {
            this.users = await usersAPI.getAll()
            this.populateUsersSelect()
        } catch { this.users = [] }

        await this.loadProjects()
        this.setupEvents()
    }

    /**
     * Llena el select de usuarios en el formulario del modal.
     */
    populateUsersSelect() {
        const select = document.getElementById('projectAssignedTo')
        if (!select) return
        select.innerHTML = this.users.map(u =>
            `<option value="${u.id}">${u.name} (${u.role})</option>`
        ).join('')
    }

    /**
     * Obtiene los proyectos desde la API y aplica filtros según:
     * - Rol del usuario (collaborator solo ve los suyos)
     * - Término de búsqueda
     * - Filtro de estado
     */
    async loadProjects() {
        const spinner = document.getElementById('loadingSpinner')
        const grid    = document.getElementById('projectsGrid')
        spinner?.classList.remove('hidden')
        grid?.classList.add('hidden')

        try {
            let projects = await projectsAPI.getAll()
            const user   = authService.getCurrentUser()

            // Los collaborators solo ven sus proyectos asignados
            if (user?.role === 'collaborator') {
                projects = projects.filter(p => p.assignedTo === user.id)
            }

            // Filtro por texto de búsqueda (nombre o descripción)
            if (this.searchTerm) {
                const q = this.searchTerm.toLowerCase()
                projects = projects.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
                )
            }

            // Filtro por estado del proyecto
            if (this.statusFilter) {
                projects = projects.filter(p => p.status === this.statusFilter)
            }

            this.renderProjects(projects)
        } catch (err) {
            console.error(err)
            this.showToast('Error loading projects', 'error')
        } finally {
            spinner?.classList.add('hidden')
            grid?.classList.remove('hidden')
        }
    }

    /**
     * Construye las tarjetas de proyecto en el grid.
     * - Manager ve botones de editar/eliminar
     * - Collaborator ve un select para cambiar el estado
     * @param {Array} projects - Lista de proyectos a renderizar
     */
    renderProjects(projects) {
        const grid      = document.getElementById('projectsGrid')
        if (!grid) return
        const isManager = authService.hasRole('manager')

        // Mapa id → nombre de usuario para mostrar en las tarjetas
        const userMap = Object.fromEntries(this.users.map(u => [u.id, u.name]))

        if (projects.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-8 text-gray-400">No projects found.</div>`
            return
        }

        grid.innerHTML = projects.map(p => `
            <div class="card hover:shadow-lg transition-shadow">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${p.name}</h3>
                    <!-- Botones de acción solo para managers -->
                    ${isManager ? `
                        <div class="flex gap-3 text-sm">
                            <button data-action="edit"   data-id="${p.id}" class="text-blue-600 hover:underline cursor-pointer">Edit</button>
                            <button data-action="delete" data-id="${p.id}" class="text-red-600 hover:underline cursor-pointer">Delete</button>
                        </div>` : ''}
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">${p.description}</p>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-500">Status:</span>
                        <!-- Collaborator puede cambiar el estado con un select -->
                        ${!isManager ? `
                            <select data-action="status" data-id="${p.id}"
                                    class="px-2 py-1 text-xs rounded border border-gray-300 dark:bg-gray-700 dark:text-white">
                                <option value="Planning"    ${p.status==='Planning'    ?'selected':''}>Planning</option>
                                <option value="In Progress" ${p.status==='In Progress' ?'selected':''}>In Progress</option>
                                <option value="Completed"   ${p.status==='Completed'   ?'selected':''}>Completed</option>
                            </select>` :
                            `<span class="px-2 py-1 text-xs rounded-full ${this.statusColor(p.status)}">${p.status}</span>`
                        }
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Assigned to:</span>
                        <span class="text-gray-700 dark:text-gray-300">${userMap[p.assignedTo] ?? 'Unassigned'}</span>
                    </div>
                    ${p.createdAt ? `
                    <div class="flex justify-between">
                        <span class="text-gray-500">Created:</span>
                        <span class="text-gray-700 dark:text-gray-300">${new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>` : ''}
                </div>
            </div>
        `).join('')

        // Usa event delegation en lugar de onclick global para evitar memory leaks
        grid.querySelectorAll('[data-action="edit"]').forEach(btn =>
            btn.addEventListener('click', () => this.editProject(Number(btn.dataset.id)))
        )
        grid.querySelectorAll('[data-action="delete"]').forEach(btn =>
            btn.addEventListener('click', () => this.deleteProject(Number(btn.dataset.id)))
        )
        grid.querySelectorAll('[data-action="status"]').forEach(sel =>
            sel.addEventListener('change', () => this.updateStatus(Number(sel.dataset.id), sel.value))
        )
    }

    /**
     * Registra todos los event listeners de la vista:
     * botón crear, cerrar modal, formulario, búsqueda, filtro.
     */
    setupEvents() {
        // Abre el modal en modo creación
        document.getElementById('createProjectBtn')
            ?.addEventListener('click', () => this.openModal())

        // Cierra el modal
        document.getElementById('closeModal')
            ?.addEventListener('click', () => this.closeModal())

        // Envío del formulario (crear o editar)
        document.getElementById('projectForm')
            ?.addEventListener('submit', e => this.handleSubmit(e))

        // Búsqueda en tiempo real al escribir
        document.getElementById('searchInput')
            ?.addEventListener('input', e => { this.searchTerm = e.target.value; this.loadProjects() })

        // Filtro por estado al cambiar el select
        document.getElementById('statusFilter')
            ?.addEventListener('change', e => { this.statusFilter = e.target.value; this.loadProjects() })

        // Cierra el modal si el usuario hace clic en el fondo oscuro
        document.getElementById('projectModal')
            ?.addEventListener('click', e => { if (e.target.id === 'projectModal') this.closeModal() })
    }

    /**
     * Abre el modal de formulario.
     * @param {object|null} project - Si se pasa, entra en modo edición; si no, en modo creación.
     */
    openModal(project = null) {
        this.currentProject = project
        document.getElementById('modalTitle').textContent = project ? 'Edit Project' : 'Create Project'

        if (project) {
            // Rellena el formulario con los datos del proyecto a editar
            document.getElementById('projectName').value        = project.name
            document.getElementById('projectDescription').value = project.description
            document.getElementById('projectStatus').value      = project.status
            document.getElementById('projectAssignedTo').value  = project.assignedTo
        } else {
            document.getElementById('projectForm').reset()
        }

        const modal = document.getElementById('projectModal')
        modal.classList.remove('hidden')
        modal.classList.add('flex')
    }

    /** Cierra y limpia el modal de formulario. */
    closeModal() {
        const modal = document.getElementById('projectModal')
        modal.classList.add('hidden')
        modal.classList.remove('flex')
        this.currentProject = null
    }

    /**
     * Maneja el submit del formulario.
     * Decide si hace POST (crear) o PUT (editar) según currentProject.
     */
    async handleSubmit(e) {
        e.preventDefault()
        const data = {
            name:        document.getElementById('projectName').value.trim(),
            description: document.getElementById('projectDescription').value.trim(),
            status:      document.getElementById('projectStatus').value,
            assignedTo:  parseInt(document.getElementById('projectAssignedTo').value),
            createdAt:   this.currentProject?.createdAt ?? new Date().toISOString()
        }
        try {
            if (this.currentProject) {
                // Editar: combina datos existentes con los nuevos para no perder campos
                await projectsAPI.update(this.currentProject.id, { ...this.currentProject, ...data })
                this.showToast('Project updated!')
            } else {
                // Crear: POST con los datos del formulario
                await projectsAPI.create(data)
                this.showToast('Project created!')
            }
            this.closeModal()
            await this.loadProjects()
        } catch {
            this.showToast('Error saving project', 'error')
        }
    }

    /**
     * Carga un proyecto por ID y abre el modal en modo edición.
     * @param {number} id - ID del proyecto a editar
     */
    async editProject(id) {
        try {
            const projects = await projectsAPI.getAll()
            const project  = projects.find(p => p.id === id)
            if (project) this.openModal(project)
        } catch {
            this.showToast('Error loading project', 'error')
        }
    }

    /**
     * Elimina un proyecto tras confirmación del usuario.
     * @param {number} id - ID del proyecto a eliminar
     */
    async deleteProject(id) {
        if (!confirm('Delete this project?')) return
        try {
            await projectsAPI.delete(id)
            this.showToast('Project deleted!')
            await this.loadProjects()
        } catch {
            this.showToast('Error deleting project', 'error')
        }
    }

    /**
     * Actualiza solo el estado de un proyecto (usado por collaborators).
     * Usa PATCH para no sobreescribir los demás campos.
     * @param {number} id     - ID del proyecto
     * @param {string} status - Nuevo estado
     */
    async updateStatus(id, status) {
        try {
            await projectsAPI.patch(id, { status })
            this.showToast('Status updated!')
            await this.loadProjects()
        } catch {
            this.showToast('Error updating status', 'error')
        }
    }

    /**
     * Retorna clases de Tailwind según el estado del proyecto.
     * @param {string} status
     * @returns {string}
     */
    statusColor(status) {
        return {
            'Planning':    'bg-yellow-100 text-yellow-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            'Completed':   'bg-green-100 text-green-800'
        }[status] ?? 'bg-gray-100 text-gray-800'
    }

    /**
     * Muestra una notificación temporal en la esquina inferior derecha.
     * @param {string}  message - Texto a mostrar
     * @param {string}  type    - 'success' (verde) o 'error' (rojo)
     */
    showToast(message, type = 'success') {
        const t = document.createElement('div')
        t.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 text-white text-sm
                       ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`
        t.textContent = message
        document.body.appendChild(t)
        setTimeout(() => t.remove(), 3000) // Se elimina solo después de 3 segundos
    }
}
