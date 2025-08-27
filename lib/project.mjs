import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { collectResources } from './resources.mjs'

/**
 * Converts a list of dependencies to list of projects
 *
 * @param {import('wdepres').Workspace[]} dependencies list of dependencies
 * @returns {import('./index.mjs').Project[]} list of projects
 */
export function convertDependenciesToProjects(dependencies) {
  return dependencies
    // create a list of data structures that are appropriate for the task at hand
    .map(dependency => ({
      name: dependency.package.name,
      version: dependency.package.version,
      path: dependency.path,
      scripts: dependency.package.scripts || {},
      resources: collectResources(dependency.path, dependency.package),
      deps: dependency.package.workspaceDependencies.map(d => d.package.name),
      depWorkspaces: dependency.package.workspaceDependencies.map(d => d.path),
    }))
}

/**
 * @param {string} path path to workspace (folder) or package.json (file)
 */
export function extractVersionForProject(path) {
  if (!path.endsWith('package.json')) {
    path = join(path, 'package.json')
  }

  return JSON.parse(readFileSync(path).toString()).version
}
