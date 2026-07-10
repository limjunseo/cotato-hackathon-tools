import path from 'node:path'
import type { Plugin } from 'vite'
import { MergePoller } from './merge-poller'

type MergeRacePluginOptions = {
  repoRoot: string
  token: string | undefined
}

export function createMergeRacePlugin(options: MergeRacePluginOptions): Plugin {
  const poller = new MergePoller({
    runtimeStateFile: path.join(options.repoRoot, '.runtime', 'merge-race-state.json'),
    token: options.token,
  })

  return {
    name: 'merge-race-endpoint',
    configureServer(server) {
      void poller.start()
      server.httpServer?.once('close', () => poller.stop())

      server.middlewares.use('/__merge-race/state', (request, response) => {
        response.setHeader('content-type', 'application/json; charset=utf-8')
        response.setHeader('cache-control', 'no-store')

        if (request.method !== 'GET') {
          response.statusCode = 405
          response.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }))
          return
        }

        response.statusCode = 200
        response.end(JSON.stringify(poller.getState()))
      })
    },
  }
}
