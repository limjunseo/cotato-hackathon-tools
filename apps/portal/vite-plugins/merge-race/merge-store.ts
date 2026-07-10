import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { RuntimeState } from './types'

export async function loadRuntimeState(filePath: string): Promise<RuntimeState | null> {
  try {
    const content = await readFile(filePath, 'utf8')
    const state = JSON.parse(content) as RuntimeState
    return state.schemaVersion === 1 ? state : null
  } catch {
    return null
  }
}

export async function saveRuntimeState(filePath: string, state: RuntimeState) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}
