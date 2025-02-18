import { join } from 'node:path'

/**
 * Returns a list of workspaces from a comma-separated workspace list or empty
 * if no workspace was specified
 *
 * @param {String} workspaces comma-separated string of workspaces
 * @param {String} prefix root folder of the project
 * @returns {String[]} list of workspaces
 */
export function resolveWorkspaces(workspaces, prefix) {
  // workspace, if specified, is given without prefix (as it is defined in package.json)
  return workspaces
    ? workspaces.split(',').map(workspace => join(prefix, workspace.trim()))
    : []
}
