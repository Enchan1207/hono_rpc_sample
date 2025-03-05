/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
  readonly VITE_AUTH_DOMAIN: string
  readonly VITE_AUTH_CLIENT_ID: string
  readonly VITE_AUTH_AUDIENCE: string
}

interface ImportMeta { readonly env: ImportMetaEnv }
