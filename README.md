# Try RPC feature of Hono

HonoとCloudflareでいい感じのWebAppを作ってみるサンプル

## Overview

Tech stack:

- authentication/authorization: Auth0
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

### Boot dev server

1. open command pallete
2. select `Tasks: Run Task`
    1. choose `frontend server`
    2. open another shell and choose `backend server`

### Deployment configuration

see #46

## License

This repository is published under [MIT License](LICENSE).
