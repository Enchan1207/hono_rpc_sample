import { env, fetchMock } from 'cloudflare:test'

import * as keys from './test_keys.json'

// NOTE: cf. https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/#cloudflaretest-module-definition
beforeAll(() => {
  fetchMock.activate()
  fetchMock.disableNetConnect()

  fetchMock.get(`https://${env.AUTH_DOMAIN}`).intercept({
    method: 'GET',
    path: '/.well-known/jwks.json',
  }).reply(200, { keys: keys.public_keys }).persist()

  env.TEST_PRIVATE_KEY = keys.private_key
})
