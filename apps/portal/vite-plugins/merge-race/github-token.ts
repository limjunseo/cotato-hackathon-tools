import { readFileSync } from 'node:fs'
import path from 'node:path'

const ENV_FILES = ['.env.local', '.env']

function parseEnvValue(content: string, key: string) {
  const pattern = new RegExp(`^\\s*${key}\\s*=\\s*(.*)\\s*$`)

  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith('#')) {
      continue
    }

    const match = line.match(pattern)
    if (!match) {
      continue
    }

    const rawValue = match[1].trim()
    if (!rawValue) {
      return ''
    }

    if (
      (rawValue.startsWith('"') && rawValue.endsWith('"'))
      || (rawValue.startsWith('\'') && rawValue.endsWith('\''))
    ) {
      return rawValue.slice(1, -1)
    }

    return rawValue
  }

  return null
}

export function resolveGithubToken(repoRoot: string, envToken: string | undefined) {
  if (envToken) {
    return envToken
  }

  for (const fileName of ENV_FILES) {
    const filePath = path.join(repoRoot, fileName)
    try {
      const content = readFileSync(filePath, 'utf8')
      const token = parseEnvValue(content, 'GITHUB_TOKEN')
      if (token) {
        return token
      }
    } catch {
      // Ignore missing local env files and keep falling back.
    }
  }

  return undefined
}

export { parseEnvValue }
