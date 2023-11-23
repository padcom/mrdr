#!/usr/bin/env node
import { readFile, utimes } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { exec, spawn } from 'node:child_process'
import readline from 'node:readline'
import { join } from 'node:path'
import waitOn from 'wait-on'
import { cwd } from 'node:process'
import { program } from 'commander'
import chalk from 'chalk'
import EventEmitter from 'node:events'
import { globSync } from 'glob'

// 1. read all package.json in the monorepo
// 2. construct a dependency graph
// 3. navigate the graph to the leafs
// 4. run the leaf and await a ready-state
// 5. go up the chain of dependencies and repeat 4. until can't navigate up

//     aaa     <-- root
//    / \ \
//   b   c d
//  / \ /
// d   e

// [[d, e], [b, c, d], [aaa]]

function logger(namespace) {
  const color = logger.colors.next().value

  return {
    trace: (...args) => {
      if (logger.level >= 5) console.trace(chalk[color](namespace), ...args)
    },
    debug: (...args) => {
      if (logger.level >= 4) console.debug(chalk[color](namespace), ...args)
    },
    info: (...args) => {
      if (logger.level >= 3) console.info(chalk[color](namespace), ...args)
    },
    warn: (...args) => {
      if (logger.level >= 2) console.warn(chalk[color](namespace), ...args)
    },
    error: (...args) => {
      if (logger.level >= 1) console.error(chalk[color](namespace), ...args)
    },
    fatal: (...args) => {
      if (logger.level >= 0) console.error(chalk[color](namespace), ...args)
    },
    always: (...args) => {
      console.log(chalk[color](namespace), ...args)
    },
  }
}

logger.colorWheel = function*() {
  const colors = ['magenta', 'green', 'yellow', 'blue', 'cyan', 'red']

  let index = 0
  while (true) {
    yield colors[index++]
    if (index > colors.length - 1) index = 0
  }
}
logger.colors = logger.colorWheel()
logger.level = 3

async function loadPkgJson(folder) {
  return JSON.parse(await readFile(join(folder, 'package.json')))
}

async function loadWorkspaces() {
  return ((await loadPkgJson('.')).workspaces || [])
    .flatMap(entry => globSync(entry))
    .filter(pkg => existsSync(join(pkg, 'package.json')))
}

async function loadPackages(workspaces) {
  return Promise.all(workspaces.map(async workspace => {
    const json = JSON.parse(await readFile(`${workspace}/package.json`))

    return {
      ...json,
      cwd: join(cwd(), workspace),
    }
  }))
}

function collectResources(pkg) {
  // Return a list of resources that need to be compiled
  // for this package to be considered fully built.
  // The list of resources is collected based on the package's
  // `exports`, `main` and `module` fields

  const exported = Object
    .keys(pkg.exports || {})
    .flatMap(item => {
      if (typeof pkg.exports[item] === 'string') {
        return [pkg.exports[item]]
      } else if (typeof pkg.exports[item] === 'object') {
        return Object.values(pkg.exports[item])
      } else {
        console.error(
          'ERROR: unknown export type',
          typeof pkg.exports[item],
          '; expected string or object'
        )
        process.exit(1)
      }
    })

  return [...exported, pkg.main, pkg.module]
    .filter(x => x)
    .filter((x, index, arr) => arr.indexOf(x) === index)
}

function resolveDependencies(packages) {
  // construct a list of dependent nodes
  return packages
    .map(pkg => ({
      ...pkg,
      // build a list of nodes that depend on this package
      nodes: Object.keys({ ...pkg.devDependency, ...pkg.dependencies })
        .map(dep => packages.find(p => p.name === dep))
        .filter(x => x),
    }))
    // convenience mapping so that we can read it better
    .map(pkg => ({
      ...pkg,
      deps: pkg.nodes.map(dep => dep.name),
      resources: collectResources(pkg).map(output => join(pkg.cwd, output)),
    }))
}

function injectLogger(packages, script) {
  return packages.map(pkg => ({
    ...pkg,
    log: logger(`${pkg.name}:${script}:`),
  }))
}

function projectHasScript(project, script) {
  return !!project.scripts[script]
}

function filterOutNoopTasks(projects, script) {
  return projects
    .filter(project => projectHasScript(project, script))
    .map(project => ({
      ...project,
      deps: [...project.deps],
    }))
}

async function filterDownToSelectedWorkspace(projects, workspace) {
  async function resolveWorkspaceProjectName(wrkspc) {
    return (await loadPkgJson(wrkspc)).name
  }

  async function resolveWorkspacesProjectName(workspaces) {
    return Promise.all(workspaces.map(resolveWorkspaceProjectName))
  }

  function resolveProjects(selected) {
    return selected.map(prj => projects.find(p => p.name === prj))
  }

  function collectDependenciesForProject(project) {
    const deps = resolveProjects(project.deps)
    if (deps.length > 0) {
      return [...deps, ...deps.flatMap(dep => collectDependenciesForProject(dep))]
    } else {
      return deps
    }
  }

  function collectDependenciesForProjects(projects) {
    return [
      ...projects,
      ...projects.flatMap(prj => collectDependenciesForProject(prj)),
    ]
  }

  const workspaceProjectNames = await resolveWorkspacesProjectName(workspace.split(','))
  const selectedProjects = resolveProjects(workspaceProjectNames)

  return workspace ? collectDependenciesForProjects(selectedProjects) : projects
}

function getIndependentProjects(projects) {
  // find all tasks that currently have no dependencies
  return projects.filter(project => project.deps.length === 0)
}

const events = new EventEmitter()

function printCommandOutput(project, input) {
  readline.createInterface({ input }).on('line', data => {
    project.log.always(data.toString())
  })
}

function notifyProjectBuildFinished(project, input) {
  readline.createInterface({ input }).on('line', data => {
    if (/^built in .*/.test(data.toString())) {
      events.emit('rebuilt', project)
    }
  })
}

function executeProjectScript(project, script, ...args) {
  project.log.info('> npm', ...[...args, 'run', script])

  const cmd = spawn('npm', [...args, 'run', script], { cwd: project.cwd })
  cmd.on('exit', err => {
    if (err) {
      process.exit(err)
    } else {
      events.emit('finished', project)
    }
  })
  notifyProjectBuildFinished(project, cmd.stdout)
  printCommandOutput(project, cmd.stdout)
  printCommandOutput(project, cmd.stderr)

  project.log.debug('> started execution of', script, 'in', project.cwd)
}

async function waitForTaskToProduceResources(item, { delay, verbose, timeout }) {
  if (item.resources.length > 0) {
    item.log.debug('> waiting for:', item.resources)
    await waitOn({ resources: item.resources, delay, timeout, log: verbose })
    item.log.debug('> resources created.')
  }
}

function dequeueTask(task, tasks) {
  // this task has been executed - remove it from list of tasks todo
  tasks.splice(tasks.indexOf(task), 1)
}

function dequeueTasks(current, tasks) {
  current.forEach(task => { dequeueTask(task, tasks) })
}

function clearDependencyToPackage(task, packages) {
  // remove it from dependencies of other todo items
  packages
    // find all todo packages that do contain this item
    .filter(pkg => pkg.deps.indexOf(task.name) > -1)
    // remove dependency to them from their list of dependencies
    .forEach(pkg => {
      pkg.deps.splice(pkg.deps.indexOf(task.name), 1)
    })
}

function clearDependencyToTasks(tasks, packages) {
  tasks.forEach(task => { clearDependencyToPackage(task, packages) })
}

function getAdditionalArgs({ quiet }) {
  const args = []
  if (quiet) args.push('--silent')

  return args
}

function runProjectScript(project, script, { verbose }) {
  return new Promise(resolve => {
    const cmd = spawn('npm', ['run', script], { cwd: project.cwd, log: verbose })
    cmd.on('exit', err => {
      if (err) {
        process.exit(err)
      } else {
        resolve()
      }
    })
    printCommandOutput(project, cmd.stdout)
    printCommandOutput(project, cmd.stderr)
  })
}

async function executeTasks(tasks, script, { delay, timeout, quiet, verbose, clean }) {
  // execute each selected task
  return Promise.all(tasks.map(async task => {
    if (clean && projectHasScript(task, clean)) {
      await runProjectScript(task, clean, { verbose })
    }
    executeProjectScript(task, script, ...getAdditionalArgs({ quiet }))
    await waitForTaskToProduceResources(task, { delay, timeout, verbose })
  }))
}

function installViteJsReloadHack(projects) {
  async function touch(file) {
    const now = new Date()
    await utimes(file, now, now)
  }

  // now that the initial build is done we can track changes
  // to projects and kick those dependent ones if they are apps
  // managed with vite
  events.on('rebuilt', project => {
    projects
      .filter(prj => prj.deps.some(dep => dep === project.name))
      .map(prj => join(prj.cwd, 'vite.config.js'))
      .filter(viteConfigFile => existsSync(viteConfigFile))
      .forEach(viteConfigFile => { touch(viteConfigFile) })
  })
}

async function main(script, {
  delay,
  timeout,
  quiet,
  verbose,
  viteReloadHack,
  workspace,
  clean,
}) {
  const log = logger('main')
  if (quiet) logger.level = 2
  if (verbose) logger.level = 5

  const workspaces = await loadWorkspaces()
  log.debug('workspaces', workspaces)

  const packages = injectLogger(await loadPackages(workspaces), script)
  log.debug('packages', packages)

  const projects = resolveDependencies(packages)
  log.debug('dependencies', projects)

  const tasks = await filterDownToSelectedWorkspace(filterOutNoopTasks(projects, script), workspace)
  log.debug('tasks', tasks)

  while (tasks.length > 0) {
    const current = getIndependentProjects(tasks)
    await executeTasks(current, script, {
      delay,
      timeout: timeout * 1000,
      quiet,
      verbose,
      clean: typeof clean === 'boolean' ? 'clean' : clean,
    })
    dequeueTasks(current, tasks)
    clearDependencyToTasks(current, tasks)
  }

  if (viteReloadHack) installViteJsReloadHack(projects)
}

import pkg from './package.json' assert { type: 'json' }

program
  .name(pkg.name)
  .version(pkg.version)
  .argument('[script]', 'Script to execute', 'dev')
  .option('-q, --quiet', 'Be quiet')
  .option('-v, --verbose', 'Be verbose')
  .option('-d, --delay <ms>', 'Additional miliseconds to wait after the resource is created', 200)
  .option('-t, --timeout <s>', 'Max time in seconds to wait for resources to be generated', 10)
  .option('-w, --workspace <workspace>', 'Run only the given workspace and its dependencies', '')
  .option('-C, --clean [task]', 'Call the "clean" task before building a project; defaults to "clean" task')
  .option('--vite-reload-hack', 'Install a hack that kicks dependent projects when a dependency is rebuilt')
  .action(main)
  .parse(process.argv)
