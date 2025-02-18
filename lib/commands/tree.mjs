import { resolve } from 'node:path'
import printTree from 'print-tree'
import { deps } from "wdepres"
import { resolveWorkspaces } from '../workspace.mjs'

export async function tree({ prefix, workspace }) {
  // workspace, if specified, is given without prefix (as it is defined in package.json)
  const workspaces = resolveWorkspaces(workspace, prefix)
  const dependencies = await deps(prefix)

  const root = workspaces.length > 0
    ? workspaces.flatMap(workspace => [dependencies.find(prj => resolve(prj.path) === resolve(workspace))]).uniq()
    : dependencies

  printTree(
    { package: { name: prefix, workspaceDependencies: root } },
    node => node?.package?.name + (node?.package?.version ? `@${node?.package?.version}` : '') || '',
    node => node?.package?.workspaceDependencies || [],
  )
}
