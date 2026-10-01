# Running the imported project

This project keeps its original React/Vite frontend, Express/TypeScript backend,
and bundled SQLite database. Node.js 24 is used for compatibility with the
imported dependencies.

## Start

Use the **Start application** workflow, or run `npm run dev` from the project root.
This starts both services together:

- Frontend: `0.0.0.0:5000`, shown in Replit Preview.
- Backend: port `3000`.
- Vite proxies relative `/api` requests to the backend, including Excel uploads
  and downloads.

## Install dependencies

The root, backend, and frontend have separate dependency files and lockfiles:

```sh
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

## Check builds

```sh
npm run build --prefix frontend
backend/node_modules/.bin/tsc --project backend/tsconfig.json --noEmit
```

The backend reads `backend/resource/databases/regionru.db` and
`backend/resource/templates/template.xlsx`, both included in the repository.
No credentials or external services are needed to run the current app.
This workflow is for development; publishing configuration is not part of this setup.