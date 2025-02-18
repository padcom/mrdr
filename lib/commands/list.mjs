import { deps } from 'wdepres'
import { convertDependenciesToProjects } from '../project.mjs'
import { processTasks, getListOfTasks } from '../task.mjs'
import { resolveWorkspaces } from '../workspace.mjs'

export async function list({ prefix, workspace, listPaths }) {
  const workspaces = resolveWorkspaces(workspace, prefix)
  const dependencies = await deps(prefix)
  const projects = convertDependenciesToProjects(dependencies)
  const tasks = getListOfTasks(workspaces, projects)

  await processTasks(tasks, chunk => {
    if (listPaths) {
      console.log(chunk.map(task => task.path).join('\n'))
    } else {
      console.log(chunk.map(task => `${task.name}@${task.version}`).join('\n'))
    }
  })
}
