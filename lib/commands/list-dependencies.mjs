import { deps } from 'wdepres'
import { convertDependenciesToProjects } from '../project.mjs'
import { processTasks, getListOfTasks } from '../task.mjs'
import { resolveWorkspaces } from '../workspace.mjs'

// this command is virtually identical to `list` but it removes the requestes workspace
// from the output producing a list of dependent workspaces
export async function listDependencies({ prefix, workspace, listPaths }) {
  const dependencies = await deps(prefix)
  const workspaces = resolveWorkspaces(workspace, prefix)
  const projects = convertDependenciesToProjects(dependencies)
  const tasks = getListOfTasks(workspaces, projects).filter(task => !(workspaces || []).includes(task.path))

  await processTasks(tasks, chunk => {
    if (listPaths) {
      console.log(chunk.map(task => task.path).join('\n'))
    } else {
      console.log(chunk.map(task => `${task.name}@${task.version}`).join('\n'))
    }
  })
}
