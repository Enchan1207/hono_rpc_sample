import { createAuth0 } from '@auth0/auth0-vue'

export type AccessTokenProvider = () => Promise<string>

const env = import.meta.env
export const auth = createAuth0({
  domain: env.VITE_AUTH_DOMAIN,
  clientId: env.VITE_AUTH_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: env.VITE_AUTH_AUDIENCE,
  },
})
