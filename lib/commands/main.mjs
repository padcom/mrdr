import { deps } from 'wdepres'
import { resolveWorkspaces } from '../workspace.mjs'
import { convertDependenciesToProjects } from '../project.mjs'
import { logger } from '../logger.mjs'
import { processTasks, getListOfTasks } from '../task.mjs'
import { installViteJsReloadHack } from '../vite.mjs'
import { runWorkspaceScript, startWorkspaceScript } from '../executor.mjs'
import { waitForResources } from '../resources.mjs'

function getAdditionalArgs({ quiet }) {
  const args = []
  if (quiet) args.push('--silent')

  return args
}

async function sleep(ms) {
  return new Promise(resolve => { setTimeout(resolve, ms) })
}

async function executeTask(task, script, { clean, verbose, quiet, lead, delay, timeout, wait }) {
  if (clean && task.scripts[clean]) {
    await runWorkspaceScript(task.path, clean || 'clean', {
      verbose,
      logger: task.logger.info,
      args: getAdditionalArgs({ quiet }),
    })
  }
  startWorkspaceScript(task.path, script, {
    verbose,
    logger: task.logger.info,
    args: getAdditionalArgs({ quiet }),
  })

  if (wait) {
    await sleep(lead)
    try {
      await waitForResources(task.resources, { verbose, delay, timeout })
    } catch (e) {
      console.error(e.message)
      process.exit(1)
    }
  }
}

function executeTasks(tasks, script, { clean, verbose, quiet, lead, delay, timeout, wait }) {
  return Promise.all(tasks.map(task => executeTask(task, script, { clean, verbose, quiet, lead, delay, timeout, wait })))
}

export async function main(script, {
  prefix,
  leadDelay: lead,
  delay,
  timeout,
  quiet,
  verbose,
  viteReloadHack,
  workspace,
  clean,
  wait,
} = {}) {
  if (quiet) logger.level = 2
  if (verbose) logger.level = 5

  // `clean` can either be a boolean (in which case we default to 'clean')
  clean = clean ? (typeof clean === 'string' ? clean : 'clean') : false
  // timeout is given in seconds and everywhere we use time values it is in ms
  timeout = timeout * 1000
  // workspace, if specified, is given without prefix (as it is defined in package.json)
  const workspaces = resolveWorkspaces(workspace, prefix)

  // collect workspace dependencies
  const dependencies = await deps(prefix)

  // convert dependencies into projects list
  const projects = convertDependenciesToProjects(dependencies).map(project => ({
    ...project,
    logger: logger(`${project.name}:${script}:`)
  }))

  // collect list of tasks from projects to execute
  const tasks = getListOfTasks(workspaces, projects)

  // main loop - repeat until there is something to execute
  await processTasks(tasks, chunk => executeTasks(chunk, script, { clean, verbose, quiet, lead, delay, timeout, wait }))

  if (viteReloadHack) installViteJsReloadHack(dependencies.map(dep => dep.path))
}
