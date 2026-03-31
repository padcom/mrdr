import { join } from 'node:path'
import { statSync } from 'node:fs'
import { waitFor } from '@padcom/wait-for'

/**
 * Collect a list of resources that should be the output of the build
 *
 * @param {String} workspace path to the workspace
 * @param {Object} pkg object defining `exports`, `main` and `module` (package.json) of the project to get the list of resources of
 * @returns {String[]} list of resources of the workspace
 */
export function collectResources(workspace, pkg = {}) {
  // Return a list of resources that need to be compiled
  // for this package to be considered fully built.
  // The list of resources is collected based on the package's
  // `exports`, `main` and `module` fields

  const exported = Object
    .keys(pkg.exports || {})
    .flatMap(item => {
      if (typeof pkg.exports[item] === 'string') {
        return [pkg.exports[item]]
      } else if (typeof pkg.exports[item] === 'object') {
        return Object.values(pkg.exports[item])
      } else {
        console.error('ERROR: unknown export type', typeof pkg.exports[item], '; expected string or object')
        process.exit(1)
      }
    })

  return [...exported, pkg.main, pkg.module]
    .nonEmpty()
    .map(path => join(workspace, path))
    .uniq()
}

/**
 * Wait for the given resources
 *
 * @param {String|String[]} resources list of resources to wait for
 * @param {Number} delay delay in ms to wait after the resources have been created
 * @param {Number} timeout timeout when waiting for resources
*/
export async function waitForResources(
  resources,
  {
    delay = 100,
    timeout = 30000,
  } = {}
) {
  resources = [resources].flat()

  const sleep = result => new Promise(resolve => setTimeout(() => resolve(result), delay))
  const exists = resource => statSync(resource, { throwIfNoEntry: false }) || null
  const resourceToStat = resource => waitFor(() => exists(resource), { timeout })

  if (resources.length > 0) {
    return Promise.all(resources.map(resourceToStat)).then(sleep)
  }
}
