# 🚀 Guía de Instalación — Project Manager

## 📋 Requisitos previos

Antes de empezar necesitas tener instalado en tu computador:

| Herramienta | Para qué sirve | Cómo verificar si ya lo tienes |
|-------------|---------------|-------------------------------|
| **Node.js** (v18 o superior) | Ejecutar JavaScript fuera del navegador | `node -v` |
| **npm** | Instalar paquetes (viene con Node.js) | `npm -v` |

> Si al correr esos comandos ves un número de versión, ya los tienes instalados. Si no, descarga Node.js desde [https://nodejs.org](https://nodejs.org) — escoge la versión **LTS**.

---

## 📦 ¿Qué es cada herramienta?

### 🔷 Vite
Es la herramienta que arranca el servidor de desarrollo local. Cada vez que guardas un archivo, Vite actualiza el navegador automáticamente sin que tengas que recargar la página manualmente.

### 🔷 JSON Server
Simula una API REST real usando un archivo `db.json` como base de datos. Nos permite hacer peticiones GET, POST, PUT, PATCH y DELETE sin necesidad de un backend real.

### 🔷 Axios
Librería para hacer las peticiones HTTP a la API de forma más sencilla que el `fetch` nativo.

### 🔷 Tailwind CSS
Framework de CSS que permite aplicar estilos directamente en el HTML usando clases predefinidas.

---

## 🛠️ Instalación paso a paso

### Paso 1 — Descomprimir el proyecto

Descomprime el archivo ZIP que descargaste. Verás una carpeta llamada `project-manager`.

### Paso 2 — Abrir la terminal en la carpeta del proyecto

**En Windows:**
1. Abre la carpeta `project-manager` en el Explorador de archivos
2. Haz clic en la barra de dirección arriba
3. Escribe `cmd` y presiona Enter

**En VS Code:**
1. Abre la carpeta con VS Code (`Archivo → Abrir carpeta`)
2. Abre la terminal integrada con `Ctrl + ñ` o `View → Terminal`

### Paso 3 — Instalar las dependencias

Este comando lee el archivo `package.json` y descarga todos los paquetes necesarios (Vite, Axios, Tailwind, JSON Server, etc.) dentro de una carpeta llamada `node_modules`.

```bash
npm install
```

> ⏳ Esto puede tardar entre 30 segundos y 2 minutos dependiendo de tu conexión. Es normal.

Verás algo como esto al terminar:
```
added 232 packages in 55s
```

---

## ▶️ Cómo correr el proyecto

Necesitas **dos terminales abiertas al mismo tiempo** porque son dos servidores distintos.

### Terminal 1 — Iniciar la API (JSON Server)

```bash
npm run server
```

Verás esto en pantalla:
```
\{^_^}/ hi!

  Loading database/db.json
  Done

  Resources
  http://localhost:3000/users
  http://localhost:3000/projects

  Home
  http://localhost:3000
```

Esto significa que tu API está corriendo en el puerto **3000**. No cierres esta terminal.

### Terminal 2 — Iniciar la aplicación (Vite)

Abre una segunda terminal en la misma carpeta y ejecuta:

```bash
npm run dev
```

Verás algo como esto:
```
  VITE v5.0.0  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abre tu navegador y ve a: **http://localhost:5173**

---

## 👤 Usuarios de prueba

| Rol | Email | Contraseña | Permisos |
|-----|-------|-----------|---------|
| Manager | manager@test.com | 123456 | Ver, crear, editar y eliminar proyectos |
| Collaborator | user@test.com | 123456 | Ver sus proyectos y cambiar estado |

---

## 🗂️ Estructura del proyecto explicada

```
project-manager/
│
├── 📄 index.html          → Página HTML principal (punto de entrada)
├── 📄 package.json        → Lista de dependencias y scripts npm
├── 📄 vite.config.js      → Configuración de Vite (proxy hacia la API)
├── 📄 tailwind.config.js  → Configuración de Tailwind CSS
├── 📄 postcss.config.js   → Necesario para que Tailwind funcione
├── 📄 db.json             → Base de datos simulada (usuarios y proyectos)
│
└── 📁 src/
    ├── 📄 main.js          → Punto de entrada JavaScript. Inicia el router
    ├── 📄 router.js        → Maneja la navegación sin recargar la página
    ├── 📄 style.css        → Estilos globales con Tailwind
    │
    ├── 📁 services/
    │   ├── 📄 api.js       → Todas las llamadas HTTP a json-server
    │   └── 📄 auth.js      → Login, logout y sesión con localStorage
    │
    └── 📁 views/
        ├── 📄 login.js     → Pantalla de inicio de sesión
        ├── 📄 dashboard.js → Estadísticas (solo Manager)
        ├── 📄 projects.js  → CRUD de proyectos
        └── 📁 components/
            └── 📄 navbar.js → Barra de navegación superior
```

---

## ⚙️ Scripts disponibles

Todos se corren con `npm run <nombre>`:

| Script | Comando completo | Para qué sirve |
|--------|-----------------|----------------|
| `npm run dev` | `vite` | Inicia el servidor de desarrollo en localhost:5173 |
| `npm run server` | `json-server --watch db.json --port 3000` | Inicia la API simulada en localhost:3000 |
| `npm run build` | `vite build` | Genera los archivos optimizados para producción |
| `npm run preview` | `vite preview` | Previsualiza el build de producción localmente |

---

## ❌ Errores comunes y soluciones

### "command not found: npm"
Node.js no está instalado. Descárgalo desde [https://nodejs.org](https://nodejs.org)

### "ENOTEMPTY" o "EPERM" al instalar
Windows tiene bloqueados los archivos. Abre PowerShell **como Administrador** y ejecuta:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### La app carga pero no muestra proyectos
El JSON Server no está corriendo. Abre una terminal y ejecuta `npm run server` primero.

### Puerto 3000 en uso
Otro proceso está usando ese puerto. Ciérralo o cambia el puerto en `package.json`:
```json
"server": "json-server --watch db.json --port 3001"
```
Y actualiza también `vite.config.js` → cambia `3000` por `3001`.

### Puerto 5173 en uso
Vite automáticamente usará el siguiente disponible (5174, 5175...). Revisa la terminal para ver cuál asignó.

---

## 🔄 Flujo de la aplicación

```
Usuario abre http://localhost:5173
        │
        ▼
¿Tiene sesión en localStorage?
        │
    NO ─┤─ Redirige a /login
        │
   SÍ ─┤
        │
¿Es Manager o Collaborator?
        │
 Manager ──→ /dashboard (estadísticas + proyectos)
        │
 Collaborator ──→ /projects (solo sus proyectos)
```

---

## 💾 ¿Cómo funciona la "base de datos"?

JSON Server lee el archivo `db.json` y expone sus colecciones como endpoints REST:

```json
{
  "users":    [...],   →  GET /users
  "projects": [...]    →  GET /projects, POST /projects, etc.
}
```

Cualquier cambio que hagas (crear, editar, eliminar) se guarda automáticamente en `db.json`. Si reinicias el servidor, los datos persisten.

---

*Documentación generada para Project Manager SPA — Vanilla JS + Vite + TailwindCSS + JSON Server*
