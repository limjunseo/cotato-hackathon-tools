import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { createMergeRacePlugin } from './vite-plugins/merge-race'
import { resolveGithubToken } from './vite-plugins/merge-race/github-token'

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

type CommandResult = {
  code: number | null
  stdout: string
  stderr: string
}

function runCommand(command: string, args: string[]): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', reject)
    child.on('close', (code) => {
      resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() })
    })
  })
}

async function installWorkspaceDependencies() {
  const nodeDirectory = path.dirname(process.execPath)
  const corepackCandidates = process.platform === 'win32'
    ? [path.join(nodeDirectory, 'node_modules', 'corepack', 'dist', 'corepack.js')]
    : [
        path.resolve(nodeDirectory, '../lib/node_modules/corepack/dist/corepack.js'),
        path.join(nodeDirectory, 'node_modules', 'corepack', 'dist', 'corepack.js'),
      ]

  for (const corepack of corepackCandidates) {
    try {
      await access(corepack)
      return runCommand(process.execPath, [corepack, 'pnpm', 'install', '--frozen-lockfile'])
    } catch {
      continue
    }
  }

  return runCommand('pnpm', ['install', '--frozen-lockfile'])
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
          const branchResult = await runCommand(git, ['rev-parse', '--abbrev-ref', 'HEAD'])

          if (branchResult.code !== 0) {
            throw new Error(branchResult.stderr || 'Failed to detect branch.')
          }

          const branch = branchResult.stdout
          const pullResult = await runCommand(git, ['pull', '--ff-only', 'origin', branch])

          if (pullResult.code !== 0) {
            response.statusCode = 500
            response.setHeader('content-type', 'application/json; charset=utf-8')
            response.end(JSON.stringify({ ok: false, error: pullResult.stderr || pullResult.stdout || 'git pull failed' }))
            return
          }

          const installResult = await installWorkspaceDependencies()

          if (installResult.code !== 0) {
            response.statusCode = 500
            response.setHeader('content-type', 'application/json; charset=utf-8')
            response.end(JSON.stringify({ ok: false, error: installResult.stderr || installResult.stdout || 'Workspace dependency installation failed' }))
            return
          }

          response.statusCode = 200
          response.setHeader('content-type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ ok: true, branch, output: pullResult.stdout, installOutput: installResult.stdout }))
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
        token: resolveGithubToken(repoRoot, process.env.GITHUB_TOKEN || environment.GITHUB_TOKEN),
      }),
    ],
    server: {
      fs: {
        allow: ['../..'],
      },
    },
  }
})
