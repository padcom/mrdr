import { resolve } from 'node:path'
import { deps } from 'wdepres'
import { checkOnMainMasterBranch } from '../git.mjs'
import { resolveWorkspaces } from '../workspace.mjs'
import { convertDependenciesToProjects, extractVersionForProject } from '../project.mjs'

import { verify } from './verify.mjs'
import { runProgramInWorkspace } from '../executor.mjs'
import { loadNpmRc } from '../npmrc.mjs'

export async function version(level, { prefix, workspace, validate, verbose, dryRun }) {
  if (validate) {
    await verify({ prefix, workspace })
  } else {
    await checkOnMainMasterBranch()
  }

  const workspaces = resolveWorkspaces(workspace, prefix)
  if (workspaces.length !== 1) {
    console.log('Workspace', workspace, 'resolves to more than one folder. Only one project is allowed to be managed at once.')
    process.exit(1)
  }
  workspace = workspaces[0]

  const projects = convertDependenciesToProjects(await deps(prefix))
  const project = projects.find(p => p.path = workspace)

  if (!dryRun) {
    await runProgramInWorkspace(project.path, 'npm', {
      args: ['version', level],
      verbose,
    })
  }

  const npmrc = await loadNpmRc(project.path, { traverse: true })

  const v = extractVersionForProject(project.path)
  const commitMessage = npmrc.message.replaceAll('%s', v)

  if (verbose) console.log('Commit message:', commitMessage)

  if (!dryRun) {
    await runProgramInWorkspace(project.path, 'git', {
      args: ['add', resolve(prefix, 'package-lock.json')],
    })
    await runProgramInWorkspace(project.path, 'git', {
      args: ['add', resolve(project.path, 'package.json')],
    })
    await runProgramInWorkspace(project.path, 'git', {
      args: ['commit', '-m', commitMessage],
    })
  }

  if (npmrc['git-tag-version']) {
    const tagName = `${npmrc['tag-version-prefix']}${v}`
    if (verbose) console.log('Tag name:', tagName)
    if (!dryRun) await runProgramInWorkspace(project.path, 'git', {
      args: ['tag', tagName],
    })
  }
}
