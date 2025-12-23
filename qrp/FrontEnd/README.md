# Robel Studio QR Album

Modern wedding QR album: create albums, upload photos (via Django backend), generate a QR that opens a beautiful mobile gallery. Frontend: React + Tailwind. Backend: Django REST Framework.

## Features
- Create album (names, date, description, photos)
- Upload images to backend (saved under /media)
- Store metadata in Django (SQLite by default)
- Generate QR that links to `/albums/:slug`
- Responsive, elegant UI
- **Guestbook**: Leave messages for the couple

## Frontend (React + Vite)

1) Install deps

```powershell
cd "c:\Users\Abiy\Desktop\qrp"
npm install
```

2) Configure env

Copy `.env.example` to `.env` (or `.env.local`) and set API base URL (default backend is http://localhost:8000).

3) Run dev server

```powershell
npm run dev
```

## Backend (Django + DRF)

1) Create virtual env and install packages

```powershell
cd "c:\Users\Abiy\Desktop\qrp\backend"
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -U pip
pip install -r requirements.txt
```

2) Migrate and run

```powershell
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## API
- POST `/api/albums/` body: `{ names, date, description, photos: [url, ...] }`
- GET `/api/albums/:slug/`
- POST `/api/albums/:slug/messages/` body: `{ name, message }`

## Notes
- File uploads are handled by the backend and stored locally in development under `backend/media/`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
