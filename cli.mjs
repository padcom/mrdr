#!/usr/bin/env node

import { join, resolve } from 'node:path'
import { program } from 'commander'
import { deps } from 'wdepres'
import printTree from 'print-tree'

import './lib/polyfill.mjs'
import { logger } from './lib/logger.mjs'
import { collectResources, waitForResources } from './lib/resources.mjs'
import { runWorkspaceScript, startWorkspaceScript } from './lib/executor.mjs'
import { installViteJsReloadHack } from './lib/vite.mjs'

import pkg from './package.json' assert { type: 'json' }

async function list({ prefix, workspace }) {
  // workspace, if specified, is given without prefix (as it is defined in package.json)
  const workspaces = workspace
    ? workspace.split(',').map(wrkspc => join(prefix, wrkspc.trim()))
    : false

  // collect workspace dependencies
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

function getTasksWithNoDependencies(tasks) {
  return tasks.filter(task => task.deps.length === 0)
}

function filterOutNotSelectedProjects(projects, workspace) {
  workspace = projects.find(project => project.path === workspace)
  if (!workspace) return []

  // guard from cyclic dependencies
  if (workspace.selected) return []
  workspace.selected = true

  return [workspace, ...workspace.depWorkspaces.flatMap(dep => filterOutNotSelectedProjects(projects, dep))]
}

function getAdditionalArgs({ quiet }) {
  const args = []
  if (quiet) args.push('--silent')

  return args
}

async function executeTask(task, script, { clean, verbose, quiet, delay, timeout, wait }) {
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

  if (wait) await waitForResources(task.resources, { verbose, delay, timeout })
}

function executeTasks(tasks, script, { clean, verbose, quiet, delay, timeout, wait }) {
  return Promise.all(tasks.map(task => executeTask(task, script, { clean, verbose, quiet, delay, timeout, wait })))
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

async function main(script, {
  prefix,
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
  workspace = workspace
    ? workspace.split(',').map(wrkspc => join(prefix, wrkspc.trim()))
    : false

  // collect workspace dependencies
  const dependencies = await deps(prefix)

  // convert dependencies into projects list
  const projects = dependencies
    // create a list of data structures that are appropriate for the task at hand
    .map(dependency => ({
      name: dependency.package.name,
      path: dependency.path,
      scripts: dependency.package.scripts || {},
      resources: collectResources(dependency.path, dependency.package),
      deps: dependency.package.workspaceDependencies.map(d => d.package.name),
      depWorkspaces: dependency.package.workspaceDependencies.map(d => d.path),
      logger: logger(`${dependency.package.name}:${script}:`),
    }))

  // collect list of tasks from projects to execute
  const tasks = workspace
    ? workspace.flatMap(wrkspc => filterOutNotSelectedProjects(projects, wrkspc)).uniq(wrkspc => wrkspc.path)
    : projects

  // main loop - repeat until there is something to execute
  while (tasks.length > 0) {
    const current = getTasksWithNoDependencies(tasks)
    await executeTasks(current, script, { clean, verbose, quiet, delay, timeout, wait })
    removeDependencyToCurrentTasks(tasks, current)
    removeCurrentTasks(tasks, current)
  }

  if (viteReloadHack) installViteJsReloadHack(dependencies.map(dep => dep.path))
}

program
  .name(pkg.name)
  .version(pkg.version)

program
  .command('run', { isDefault: true })
  .description('Run a task recursively within the monorepo')
  .argument('[script]', 'Script to execute', 'dev')
  .option('-q, --quiet', 'Be quiet')
  .option('-v, --verbose', 'Be verbose')
  .option('-P, --prefix <path>', 'Workspaces root', '.')
  .option('-d, --delay <ms>', 'Additional miliseconds to wait after the resource is created', 200)
  .option('-t, --timeout <s>', 'Max time in seconds to wait for resources to be generated', 30)
  .option('-w, --workspace <workspace>', 'Run only the given workspace and its dependencies', '')
  .option('-C, --clean [task]', 'Call the "clean" task before building a project; defaults to "clean" task')
  .option('--no-wait', 'Do not wait for resources to be created (useful for running the "clean" task alone)', true)
  .option('--vite-reload-hack', 'Install a hack that kicks dependent projects when a dependency is rebuilt')
  .action(main)

program
  .command('ls')
  .description('List dependencies between projects')
  .option('-w, --workspace <workspace>', 'List only the given workspace and its dependencies', '')
  .option('-P, --prefix <path>', 'Workspaces root', '.')
  .action(list)

program
  .parse(process.argv)
