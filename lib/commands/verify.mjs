import { deps } from 'wdepres'
import { resolveWorkspaces } from '../workspace.mjs'
import { checkIfPackagesArePublished, checkOnMainMasterBranch } from '../git.mjs'
import { convertDependenciesToProjects } from '../project.mjs'
import { processTasks, getListOfTasks } from '../task.mjs'

export async function verify({ prefix, workspace }) {
  await checkOnMainMasterBranch()

  const workspaces = resolveWorkspaces(workspace, prefix)
  const dependencies = await deps(prefix)
  const projects = convertDependenciesToProjects(dependencies)
  const tasks = getListOfTasks(workspaces, projects).filter(task => !(workspaces || []).includes(task.path))

  let untagged = 0
  await processTasks(tasks, async chunk => { untagged += await checkIfPackagesArePublished(chunk) })

  if (untagged > 0) process.exit(1)
}
