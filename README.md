# Project Manager SPA

## Description
A Single Page Application for managing internal company projects, built with Vanilla JavaScript and Vite. Features role-based access control, session persistence, and full CRUD via a simulated REST API.

## Technologies
- **Vanilla JavaScript (ES6+)**
- **Vite** — build tool and dev server
- **TailwindCSS** — utility-first styling
- **Axios** — HTTP client
- **JSON Server** — mock REST API

## Installation
```bash
git clone <repo-url>
cd project-manager
npm install
```

## Running the Project
Open two terminals:

```bash
# Terminal 1 — Mock API
npm run server

# Terminal 2 — Dev server
npm run dev
```

## Running JSON Server
```bash
npm run server
# Runs on http://localhost:3000
```

## Test Users
| Role | Email | Password |
|------|-------|----------|
| Manager | manager@test.com | 123456 |
| Collaborator | user@test.com | 123456 |

## Project Structure
```
project-manager/
├── index.html
├── db.json
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── src/
    ├── main.js
    ├── style.css
    ├── router.js
    ├── services/
    │   ├── api.js
    │   └── auth.js
    └── views/
        ├── login.js
        ├── dashboard.js
        ├── projects.js
        └── components/
            └── navbar.js
```

## Role Permissions
| Action | Manager | Collaborator |
|--------|---------|--------------|
| View all projects | ✅ | ❌ |
| View assigned projects | ✅ | ✅ |
| Create project | ✅ | ❌ |
| Edit project | ✅ | ❌ |
| Delete project | ✅ | ❌ |
| Update own project status | ✅ | ✅ |
| Access dashboard | ✅ | ❌ |

## Technical Decisions
- **Custom SPA Router** using `history.pushState` for navigation without page reloads.
- **localStorage** for session persistence across browser restarts.
- **Axios interceptors** for centralized error handling.
- **Event delegation** on project cards to avoid memory leaks from inline `onclick`.
- **Role guard in router** redirects collaborators away from `/dashboard`.
- **Dark mode** toggled via Tailwind's `class` strategy, preference saved in localStorage.
