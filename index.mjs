#!/usr/bin/env node
import { readFile, utimes } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import readline from 'node:readline'
import { join } from 'node:path'
import waitOn from 'wait-on'
import { cwd } from 'node:process'
import { program } from 'commander'
import chalk from 'chalk'
import { globSync } from 'glob'
import { deps } from 'wdepres'

import { collectResources, waitForResources } from './lib/resources.mjs'

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

function injectLogger(packages, script) {
  return packages.map(pkg => ({
    ...pkg,
    log: logger(`${pkg.name}:${script}:`),
  }))
}

// function projectHasScript(project, script) {
//   return !!project.scripts[script]
// }

// function filterOutNoopWorkspaces(workspaces, script) {
//   return workspaces.filter(project => projectHasScript(workspace.package, script))
// }

/*
async function filterDownToSelectedWorkspace(projects, workspace) {
  async function resolveWorkspaceProjectName(wrkspc) {
    return (await loadPkgJson(wrkspc)).name
  }      const args =


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
    }join
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
*/

// function getIndependentProjects(projects) {
//   // find all tasks that currently have no dependencies
//   return projects.filter(project => project.deps.length === 0)
// }

// function dequeueTask(task, tasks) {
//   // this task has been executed - remove it from list of tasks todo
//   tasks.splice(tasks.indexOf(task), 1)
// }

// function dequeueTasks(current, tasks) {
//   current.forEach(task => { dequeueTask(task, tasks) })
// }join
// function clearDependencyToPackage(task, packages) {
//   // remove it from dependencies of other todo items
//   packages
//     // find all todo packages that do contain this item
//     .filter(pkg => pkg.deps.indexOf(task.name) > -1)
//     // remove dependency to them from their list of dependencies
//     .forEach(pkg => {
//       pkg.deps.splice(pkg.deps.indexOf(task.name), 1)
//     })
// }

// function clearDependencyToTasks(tasks, packages) {
//   tasks.forEach(task => { clearDependencyToPackage(task, packages) })
// }

// function getAdditionalArgs({ quiet }) {
//   const args = []
//   if (quiet) args.push('--silent')

//   return args
// }

// async function executeWorkspaceTasks(project, script, { delay, timeout, quiet, verbose, clean }) {
//   if (clean && projectHasScript(project, clean)) {
//     await runWorkspaceScript(project, clean, { verbose })
//   }
//   startWorkspaceScript(project, script, ...getAdditionalArgs({ quiet }))
//   await waitForTaskToProduceResources(project, { delay, timeout, verbose })
// }

function getDependenciesOfSelectedProject(workspaces, project) {
  const result = workspaces.filter(workspace => workspace.project.workspaceDependencies.some(dep => dep.package.name === project))

  return [...result, result.map(item => getDependenciesOfSelectedProject(workspaces, item.package.name))]
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

  const dependencies = (await deps('test'))
    .map(dependency => ({
      ...dependency,
      name: dependency.package.name,
      deps: dependency.package.workspaceDependencies.map(d => d.package.name),
      logger: logger(`${dependency.package.name}:${script}:`),
      resources: collectResources(dependency.package),
    }))
    // filter out dependencies that don't have the selected script
    .filter(dependency => dependency.package.scripts[script])
    .filter(dependency => isDependencyOfSelectedPackage(dependency, workspace))

/*
  const tasks = await filterDownToSelectedWorkspace(filterOutNoopTasks(projects, script), workspace)
  log.debug('tasks', tasks)

  while (tasks.length > 0) {
    const current = tasks.filter(project => project.deps.length === 0)
    await executeProjectsTasks(current, script, {
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
*/
}

