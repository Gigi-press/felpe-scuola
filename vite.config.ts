import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

/** Legge un'informazione da git (solo per le build in locale). */
function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return ''
  }
}

// Su Vercel queste variabili esistono durante la build; in locale si usa git.
const onVercel = !!process.env.VERCEL
const commit = (process.env.VERCEL_GIT_COMMIT_SHA || git('rev-parse HEAD')).slice(0, 7) || 'sconosciuta'
const message = (process.env.VERCEL_GIT_COMMIT_MESSAGE || git('log -1 --pretty=%s')).split('\n')[0]

export default defineConfig({
  plugins: [react()],
  // Versione e data mostrate nel pannello admin (vedi src/buildInfo.ts)
  define: {
    __BUILD_INFO__: JSON.stringify({
      commit,
      message,
      builtAt: new Date().toISOString(),
      source: onVercel ? 'online' : 'locale',
    }),
  },
})
