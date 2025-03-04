import { createAuth0 } from '@auth0/auth0-vue'

const env = import.meta.env
export const auth = createAuth0({
  domain: env.VITE_AUTH_DOMAIN,
  clientId: env.VITE_AUTH_CLIENT_ID,
  authorizationParams: { redirect_uri: window.location.origin },
})
