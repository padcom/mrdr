import { basename } from 'path'
import { runProgramInWorkspace } from './executor.mjs'

async function getLatestFileHash(filename) {
  const format = '%H'
  const { stdout } = await runProgramInWorkspace('.', 'git', { args: ['log', '-1', `--pretty=format:${format}`, filename] })

  return stdout[0]
}

async function getTagNamesForCommit(hash) {
  const { stdout } = await runProgramInWorkspace('.', 'git', { args: ['tag', '--points-at', hash], verbose: true })

  return (stdout || []).map(line => line.split(' ')).flat()
}

function checkIfPkgNameIsPartOfTags(pkg, tags) {
  for (const tag of tags) {
    if (tag.includes(basename(pkg.path))) return true
  }

  return false
}

export async function checkIfPackagesArePublished(packages) {
  let result = 0

  for (const pkg of packages) {
    const pkgjson = `${pkg.path}/package.json`
    const hash = await getLatestFileHash(pkgjson)
    const tags = await getTagNamesForCommit(hash)

    if (tags.length === 0) {
      console.log('Checking', pkg.name, 'NOT TAGGED!')
      result++
    } else if (!checkIfPkgNameIsPartOfTags(pkg, tags)) {
      console.log('Checking', pkg.name, 'NOT PROPERLY TAGGED!')
      result++
    } else {
      console.log('Checking', `${pkg.name}@${pkg.version}`, tags.join(','))
    }
  }

  return result
}

export async function checkOnMainMasterBranch() {
  try {
    const { stdout } = await runProgramInWorkspace('.', 'git', { args: ['branch', '--show-current'] })
    const branch = stdout[0]
    if (['main', 'master'].includes(branch)) {
      console.log('branch:', branch)
    } else {
      throw new Error('wrong branch ' + branch)
    }
  } catch (e) {
    console.log('Error:', e.message)
    process.exit(1)
  }
}

