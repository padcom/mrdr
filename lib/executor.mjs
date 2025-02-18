import { spawn } from 'node:child_process'
import readline from 'node:readline'
import { events } from './events.mjs'

/**
 * Using the given logger read the given input line by line
 * and log every line
 *
 * @param {Stream} input input stream
 * @param {Function} logger logger to use
 */
function printCommandOutput(input, logger) {
  readline.createInterface({ input }).on('line', data => {
    logger(data.toString())
  })
}

/**
 * Emit the `rebuilt` event when a task finishes its job by outputting to the given
 * stream a given string (`built in ` by default, which matches Vite.js)
 *
 * @param {String} workspace workspace to emit when the build finishes
 * @param {Stream} stream to listen to for output
 * @param {Regex} check regular expression to match
 */
function notifyProjectBuildFinished(
  workspace,
  input,
  { check = /^built in .*/ } = {},
) {
  readline.createInterface({ input }).on('line', data => {
    if (check.test(data.toString())) {
      events.emit('rebuilt', workspace)
    }
  })
}

/**
 * Run a script in the given workspace and returns a promise when the script resolves
 *
 * @param {String} workspace workspace path
 * @param {String} program script to run
 * @param {String[]} args script to run
 * @param {Boolean} verbose print output
 * @param {Function} logger logger to use
 * @returns {Promise} a promise that resolves with the output when the script finishes
 */
export function runProgramInWorkspace(
  workspace,
  program,
  {
    verbose = false,
    args = [],
  } = {},
) {
  return new Promise(resolve => {
    const stdout = []
    const stderr = []

    const cmd = spawn(program, args, { cwd: workspace, log: verbose })
    cmd.on('exit', err => {
      if (err) {
        process.exit(err)
      } else {
        resolve({ stdout, stderr })
      }
    })
    printCommandOutput(cmd.stdout, line => stdout.push(line))
    printCommandOutput(cmd.stderr, line => stderr.push(line))
  })
}

/**
 * Run a script in the given workspace and returns a promise when the script resolves
 *
 * @param {String} workspace workspace path
 * @param {String} script script to run
 * @param {Boolean} verbose print output
 * @param {Function} logger logger to use
 * @returns {Promise} a promise that resolves when the script finishes
 */
export function runWorkspaceScript(
  workspace,
  script,
  {
    verbose = false,
    args = [],
    logger = () => {},
  } = {},
) {
  return new Promise(resolve => {
    const cmd = spawn('npm', ['run', script, ...args], { cwd: workspace, log: verbose })
    cmd.on('exit', err => {
      if (err) {
        process.exit(err)
      } else {
        resolve()
      }
    })
    printCommandOutput(cmd.stdout, logger)
    printCommandOutput(cmd.stderr, logger)
  })
}

/**
 * Start running a script in the given workspace
 *
 * @param {String} workspace workspace to run the script in
 * @param {String} script script to run
 * @param {Function} logger logger to use
 * @param {String[]} args additional arguments to pass to the script
 */
export function startWorkspaceScript(
  workspace,
  script,
  {
    verbose = false,
    args = [],
    logger = () => {},
  } = {},
) {
  const cmd = spawn('npm', ['run', '--if-present', script, ...args], { cwd: workspace, log: verbose })
  cmd.on('exit', err => {
    if (err) {
      process.exit(err)
    } else {
      events.emit('finished', workspace)
    }
  })
  notifyProjectBuildFinished(workspace, cmd.stdout)
  printCommandOutput(cmd.stdout, logger)
  printCommandOutput(cmd.stderr, logger)
}
