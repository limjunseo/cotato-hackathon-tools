import { mkdtempSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { describe, expect, it } from 'vitest'
import { parseEnvValue, resolveGithubToken } from './github-token'

describe('github token resolution', () => {
  it('reads token values from env file content', () => {
    expect(parseEnvValue('# comment\nGITHUB_TOKEN = "abc123"\nOTHER=value', 'GITHUB_TOKEN')).toBe('abc123')
    expect(parseEnvValue("GITHUB_TOKEN='xyz789'", 'GITHUB_TOKEN')).toBe('xyz789')
    expect(parseEnvValue('MISSING=value', 'GITHUB_TOKEN')).toBeNull()
  })

  it('falls back to local env files when process env is empty', () => {
    const repoRoot = mkdtempSync(path.join(os.tmpdir(), 'cotato-github-token-'))
    writeFileSync(path.join(repoRoot, '.env.local'), 'GITHUB_TOKEN=local-token\n', 'utf8')

    expect(resolveGithubToken(repoRoot, undefined)).toBe('local-token')
  })
})
