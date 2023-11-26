import { join } from 'node:path'
import { utimes } from 'node:fs/promises'
import { existsSync } from 'node:fs'

import { events } from './events.mjs'

async function touch(file) {
  const now = new Date()
  await utimes(file, now, now)
}

/**
 * Watches for build events in the given workspaces and if one is detected
 * then touch the vite config file in all dependent workspaces to trigger
 * a full reload/rebuild
 */
export function installViteJsReloadHack(workspaces) {
  const KNOWN_VITE_CONFIG_FILES = ['vite.config.js', 'vite.config.ts']

  // now that the initial build is done we can track changes
  // to projects and kick those dependent ones if they are apps
  // managed with vite
  workspaces
    .map(workspace => KNOWN_VITE_CONFIG_FILES.map(file => join(workspace, file)))
    .map(viteConfigFiles => viteConfigFiles.filter(viteConfigFile => existsSync(viteConfigFile)))
    .filter(viteConfigFiles => viteConfigFiles.length > 0)
    .forEach(viteConfigFiles => {
      events.on('rebuilt', () => {
        viteConfigFiles.forEach(viteConfigFile => touch(viteConfigFile))
      })
    })
}
