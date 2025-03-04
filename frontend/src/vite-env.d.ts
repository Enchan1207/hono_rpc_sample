/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
  readonly AUTH_DOMAIN: string
  readonly AUTH_CLIENT_ID: string
}

interface ImportMeta { readonly env: ImportMetaEnv }
