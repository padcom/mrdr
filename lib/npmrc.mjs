import { parse, resolve, join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import ini from 'ini'

function load(path) {
  const npmRcFileName = join(path, '.npmrc')
  if (existsSync(npmRcFileName)) {
    const buffer = readFileSync(npmRcFileName)
    const text = buffer.toString()
    const config = ini.parse(text)

    return { ...config }
  }

  return {}
}

function update(result, data) {
  Object.entries(data).forEach(([name, value]) => {
    if (!Object.hasOwn(result, name)) {
      result[name] = value
    }
  })
}

/**
 * Load NPM configuration
 *
 * @param {string} path path to .npmrc file
 * @param {boolean} traverse if set to true it will load all .nprc files up to home folder or root of the disk
 */
export async function loadNpmRc(path, { traverse = false } = {}) {
  const result = load(path)

  if (traverse) {
    const homePath = homedir()
    const root = parse(process.cwd()).root

    let parentPath = resolve(path, '..')
    while (parentPath !== resolve(homePath, '..') && parentPath !== root) {
      const parent = load(parentPath)
      update(result, parent)
      parentPath = resolve(parentPath, '..')
    }

    const user = load(homePath)
    update(result, user)
  }

  return result
}
