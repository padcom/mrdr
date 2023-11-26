#!/usr/bin/env node

import { program } from 'commander'
import { deps } from 'wdepres'
import { logger } from './lib/logger.mjs'

import { collectResources, waitForResources } from './lib/resources.mjs'
import { runWorkspaceScript, startWorkspaceScript } from './lib/executor.mjs'
import { installViteJsReloadHack } from './lib/vite.mjs'

import pkg from './package.json' assert { type: 'json' }

function getTasksWithNoDependencies(tasks) {
  return tasks.filter(task => task.deps.length === 0)
}

function getAdditionalArgs({ quiet }) {
  const args = []
  if (quiet) args.push('--silent')

  return args
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
} = {}) {
  if (quiet) logger.level = 2
  if (verbose) logger.level = 5

  // `clean` can either be a boolean (in which case we default to 'clean')
  clean = clean ? (typeof clean === 'string' ? clean : 'clean') : false
  // timeout is given in seconds and everywhere we use time values it is in ms
  timeout = timeout * 1000

  const dependencies = await deps(prefix)

  const tasks = dependencies
    // filter out dependencies that don't have the selected script
    // thus will not produce anything
    .filter(dependency => (dependency.package.scripts || {})[script])
    // create a list of data structures that are appropriate for the task at hand
    .map(dependency => ({
      name: dependency.package.name,
      path: dependency.path,
      scripts: dependency.package.scripts || {},
      resources: collectResources(dependency.path, dependency.package),
      deps: dependency.package.workspaceDependencies.map(d => d.package.name),
      logger: logger(`${dependency.package.name}:${script}:`),
    }))

  while (tasks.length > 0) {
    const current = tasks.filter(task => task.deps.length === 0)

    await Promise.all(current.map(async task => {
      if (clean && task.scripts[clean]) {
        await runWorkspaceScript(task.path, clean || 'clean', {
          verbose,
          logger: task.logger.info,
        })
      }
      startWorkspaceScript(task.path, script, {
        verbose,
        logger: task.logger.info,
        args: getAdditionalArgs({ quiet }),
      })
      await waitForResources(task.resources, { verbose, delay, timeout })
    }))

    removeDependencyToCurrentTasks(tasks, current)
    removeCurrentTasks(tasks, current)
  }

  if (viteReloadHack) installViteJsReloadHack(dependencies.map(dep => dep.path))
}

program
  .name(pkg.name)
  .version(pkg.version)
  .argument('[script]', 'Script to execute', 'dev')
  .option('-q, --quiet', 'Be quiet')
  .option('-v, --verbose', 'Be verbose')
  .option('-P, --prefix <path>', 'Workspaces root', '.')
  .option('-d, --delay <ms>', 'Additional miliseconds to wait after the resource is created', 200)
  .option('-t, --timeout <s>', 'Max time in seconds to wait for resources to be generated', 30)
  .option('-w, --workspace <workspace>', 'Run only the given workspace and its dependencies', '')
  .option('-C, --clean [task]', 'Call the "clean" task before building a project; defaults to "clean" task')
  .option('--vite-reload-hack', 'Install a hack that kicks dependent projects when a dependency is rebuilt')
  .action(main)
  .parse(process.argv)
