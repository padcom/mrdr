import { deps } from 'wdepres'
import { checkOnMainMasterBranch } from '../git.mjs'
import { resolveWorkspaces } from '../workspace.mjs'
import { convertDependenciesToProjects } from '../project.mjs'

import { verify } from './verify.mjs'

export async function version(level, { prefix, workspace, validate }) {
  if (validate) {
    await verify({ prefix, workspace })
  } else {
    await checkOnMainMasterBranch()
  }

  console.log('level:', level)

  const workspaces = resolveWorkspaces(workspace, prefix)

  console.log('workspaces:', workspaces)

  const dependencies = await deps(prefix)
  const projects = convertDependenciesToProjects(dependencies)

  console.log('projects:', projects)
}
