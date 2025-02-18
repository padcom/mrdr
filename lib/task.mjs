/**
 * Filter out projects that have not been selected
 *
 * @param {import("./index.mjs").Project[]} projects
 * @param {String} workspace
 * @returns {import("./index.mjs").Project[]} filtered list of projects
 */
function filterOutNotSelectedProjects(projects, workspace) {
  const project = projects.find(project => project.path === workspace)
  if (!project) return []

  // guard from cyclic dependencies
  if (project._selected) return []
  project._selected = true

  return [project, ...project.depWorkspaces.flatMap(dep => filterOutNotSelectedProjects(projects, dep))]
}

/**
 * Return a list of tasks to perform during command execution
 *
 * @param {String[]} workspaces
 * @param {import("./index.mjs").Project[]} projects
 */
export function getListOfTasks(workspaces, projects) {
  if (workspaces.length > 0) {
    return workspaces
      .flatMap(workspace => filterOutNotSelectedProjects(projects, workspace))
      .uniq(workspace => workspace.path)
  } else {
    return projects
  }
}

function removeDependencyToCurrentTasks(tasks, current) {
  tasks.forEach(task => {
    current.forEach(item => {
      task.deps = task.deps.filter(dep => dep !== item.name)
    })
  })
}

function removeCurrentTasks(tasks, current) {
  current.forEach(task => {
    const index = tasks.indexOf(task)
    tasks.splice(index, 1)
  })
}

function getTasksWithNoDependencies(tasks) {
  return tasks.filter(task => task.deps.length === 0)
}

export async function processTasks(tasks, callback) {
  tasks = [...tasks]

  while (tasks.length > 0) {
    const chunk = getTasksWithNoDependencies(tasks)
    await callback(chunk)
    removeDependencyToCurrentTasks(tasks, chunk)
    removeCurrentTasks(tasks, chunk)
  }
}
