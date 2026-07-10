import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { createMergeRacePlugin } from './vite-plugins/merge-race'

const portalDir = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = path.resolve(portalDir, '../..')

async function findGitExecutable() {
  const candidates = process.platform === 'win32'
    ? [process.env.GIT_EXE, 'C:\\Program Files\\Git\\cmd\\git.exe', 'C:\\Program Files\\Git\\bin\\git.exe', 'git']
    : [process.env.GIT_EXE, 'git']

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    if (candidate === 'git') {
      return candidate
    }

    try {
      await access(candidate)
      return candidate
    } catch {
      continue
    }
  }

  throw new Error('Git executable not found. Set GIT_EXE or install Git.')
}

function createManualSyncPlugin(): Plugin {
  return {
    name: 'manual-sync-endpoint',
    configureServer(server) {
      server.middlewares.use('/__sync/latest', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('content-type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }))
          return
        }

        try {
          const git = await findGitExecutable()
          const branch = await new Promise<string>((resolve, reject) => {
            const branchProcess = spawn(git, ['rev-parse', '--abbrev-ref', 'HEAD'], {
              cwd: repoRoot,
              windowsHide: true,
            })

            let stdout = ''
            let stderr = ''

            branchProcess.stdout.on('data', (chunk) => {
              stdout += chunk.toString()
            })

            branchProcess.stderr.on('data', (chunk) => {
              stderr += chunk.toString()
            })

            branchProcess.on('error', reject)
            branchProcess.on('close', (code) => {
              if (code !== 0) {
                reject(new Error(stderr.trim() || 'Failed to detect branch.'))
                return
              }

              resolve(stdout.trim())
            })
          })

          const pullResult = await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve, reject) => {
            const pullProcess = spawn(git, ['pull', '--ff-only', 'origin', branch], {
              cwd: repoRoot,
              windowsHide: true,
            })

            let stdout = ''
            let stderr = ''

            pullProcess.stdout.on('data', (chunk) => {
              stdout += chunk.toString()
            })

            pullProcess.stderr.on('data', (chunk) => {
              stderr += chunk.toString()
            })

            pullProcess.on('error', reject)
            pullProcess.on('close', (code) => {
              resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() })
            })
          })

          if (pullResult.code !== 0) {
            response.statusCode = 500
            response.setHeader('content-type', 'application/json; charset=utf-8')
            response.end(JSON.stringify({ ok: false, error: pullResult.stderr || pullResult.stdout || 'git pull failed' }))
            return
          }

          response.statusCode = 200
          response.setHeader('content-type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ ok: true, branch, output: pullResult.stdout }))
        } catch (error) {
          response.statusCode = 500
          response.setHeader('content-type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Unknown sync error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, repoRoot, '')

  return {
    plugins: [
      react(),
      createManualSyncPlugin(),
      createMergeRacePlugin({
        repoRoot,
        token: process.env.GITHUB_TOKEN || environment.GITHUB_TOKEN,
      }),
    ],
    server: {
      fs: {
        allow: ['../..'],
      },
    },
  }
})
