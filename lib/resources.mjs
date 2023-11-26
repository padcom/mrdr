import { join } from 'node:path'
import waitOn from 'wait-on'

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
    .filter(x => x)
    .map(path => join(workspace, path))
    .filter((x, index, arr) => arr.indexOf(x) === index)
}

/**
 * Wait for the given resources
 *
 * @param {String[]} resources list of resources to wait for
 * @param {Boolean} verbose be verbose about the wait
 * @param {Number} delay delay in ms to wait after the resources have been created
 * @param {Number} timeout timeout when waiting for resources
*/
export async function waitForResources(
  resources,
  {
    verbose = false,
    delay = 100,
    timeout = 30000,
  } = {}
) {
  if (resources.length > 0) {
    await waitOn({ resources, delay, timeout, log: verbose })
  }
}
