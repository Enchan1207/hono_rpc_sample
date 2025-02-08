# Try RPC feature of Hono

HonoとCloudflareでいい感じのWebAppを作ってみるサンプル

## Overview

Tech stack:

- frontend
  - implementation
    - Vue 3
    - Vuetify
    - vite
    - Hono
  - infrastructure
    - Cloudflare Pages
- backend
  - implementation
    - Hono
  - infrastructure
    - Cloudflare Workers
    - Cloudflare D1

## Usage

### The easiest way: VSCode tasks

1. open command pallete
2. select `Tasks: Run Task`
    1. choose `frontend server`
    2. open another shell and choose `backend server`

### Manual setup

If you want to use non-default (frontend:5173, backend:8787) port, you can boot server manually.

For example:

- frontend: 60001
- backend: 60002

1. configure backend
    1. create `backend/.dev.vars` (it'll be git-ignored):
       ```ini
       CORS_ALLOW_ORIGINS = "http://localhost:60001"
       ```
    1. boot server:
       ```sh
       npm run -w backend dev -- --port 60002
       ```
1. configure frontend
    1. create `frontend/.env.development.local` (it'll be git-ignored):
       ```ini
       VITE_BACKEND_URL="http://localhost:60002"
       ```
    1. boot server:
       ```sh
       npm run -w frontend dev -- --port 60001
       ```

## License

This repository is published under [MIT License](LICENSE).
