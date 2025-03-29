import * as fs from 'fs/promises'
import { generateSpecs } from 'hono-openapi'

import app from '@/presentations'

const main = async () => {
  const schema = await generateSpecs(app, {
    documentation: {
      info: {
        title: 'api.hono-rpc-sample.enchan.me',
        version: '0.0.0',
        description: 'API for hono-rpc-sample',
      },
      servers: [
        {
          url: 'http://localhost:8787',
          description: 'Local server',
        },
        {
          url: 'https://api.hono-rpc-sample.enchan.me',
          description: 'Production server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  }, {
    version: '3.0.3',
    components: {},
  })

  const schemeString = JSON.stringify(schema, undefined, 2)
  const filePath = `./${process.argv.at(2) ?? 'openapi.json'}`

  await fs.writeFile(filePath, schemeString)
}

main().catch(() => process.exit(1))
