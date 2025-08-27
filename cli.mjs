#!/usr/bin/env node

import { program } from 'commander'

import './lib/polyfill.mjs'
import { main } from './lib/commands/main.mjs'
import { list } from './lib/commands/list.mjs'
import { listDependencies as deps } from './lib/commands/list-dependencies.mjs'
import { tree } from './lib/commands/tree.mjs'
import { verify } from './lib/commands/verify.mjs'
import { version } from './lib/commands/version.mjs'

import pkg from './package.json' with { type: 'json' }

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
  .option('-l, --lead-delay <ms>', 'Miliseconds to wait after the process have been started', 1500)
  .option('-d, --delay <ms>', 'Additional miliseconds to wait after the resource is created', 200)
  .option('-t, --timeout <s>', 'Max time in seconds to wait for resources to be generated', 30)
  .option('-w, --workspace <workspace>', 'Run only the given workspace and its dependencies', '')
  .option('-C, --clean [task]', 'Call the "clean" task before building a project; defaults to "clean" task')
  .option('--no-wait', 'Do not wait for resources to be created (useful for running the "clean" task alone)', true)
  .option('--vite-reload-hack', 'Install a hack that kicks dependent projects when a dependency is rebuilt')
  .action(main)

program
  .command('list')
  .alias('ls')
  .description('List dependencies between projects')
  .option('-w, --workspace <workspace>', 'List only the given workspace and its dependencies', '')
  .option('-P, --prefix <path>', 'Workspaces root', '.')
  .option('-p, --list-paths', 'Print workspace path instead of package name', false)
  .action(list)

program
  .command('deps')
  .alias('ls')
  .description('List dependencies between projects')
  .option('-w, --workspace <workspace>', 'List only the given workspace and its dependencies', '')
  .option('-P, --prefix <path>', 'Workspaces root', '.')
  .option('-p, --list-paths', 'Print workspace path instead of package name', false)
  .action(deps)

program
  .command('tree')
  .description('List dependencies between projects in a tree')
  .option('-w, --workspace <workspace>', 'List only the given workspace and its dependencies', '')
  .option('-P, --prefix <path>', 'Workspaces root', '.')
  .action(tree)

program
  .command('verify')
  .description('Verify that the dependencies of the given workspace are all tagged')
  .option('-w, --workspace <workspace>', 'Workspace to verify dependencies')
  .option('-P, --prefix <path>', 'Workspaces root', '.')
  .action(verify)

program
  .command('version')
  .argument('<level>', 'Level to bump (patch, minor, major)')
  .description('Bump the version of a workspace, commit and tag it')
  .option('-w, --workspace <workspace>', 'Workspace to verify dependencies')
  .option('-P, --prefix <path>', 'Workspaces root', '.')
  .option('-X, --validate', 'Validate that the dependencies of the given workspace are all tagged', false)
  .action(version)

program
  .parse(process.argv)
