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

see issue [#46](https://github.com/Enchan1207/hono_rpc_sample/issues/46)

**NOTE** about D1 migration:

currently, D1 migration on GitHub Actions not working.
If there are any database modifitcation, exec following to apply:

```sh
# development (local)
npm run db:migrations:apply

# staging
DEPLOY_ENV=staging npm run db:migrations:apply -- --remote

# production
DEPLOY_ENV=production npm run db:migrations:apply -- --remote
```

## License

This repository is published under [MIT License](LICENSE).
