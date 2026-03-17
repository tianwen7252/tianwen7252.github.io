#!/usr/bin/env node
/**
 * PostToolUse hook — fires when a Bash tool call completes.
 *
 * git commit    → add commit SHA comment to active Story
 * git push      → transition active Story to Done, check if all Epic children
 *                 are Done/Verified, and if so close the Epic too
 * E2E all pass  → transition active Story to Verified
 *
 * Stdin: JSON with { tool_name, tool_input: { command }, tool_response: { output } }
 */

const { execSync } = require('child_process')
const path = require('path')
const os = require('os')
const fs = require('fs')

const PROJECT_ROOT = '/Users/ryanroll/repos/github/tianwen7252.github.io'
const SESSION_FILE = path.join(PROJECT_ROOT, '.jira-session.json')
const NODE = '/Users/ryanroll/.nvm/versions/node/v24.9.0/bin/node'
const JIRA_UTILS = path.join(os.homedir(), '.claude/scripts/jira-utils.js')

function jira(...args) {
  try {
    return execSync(
      `cd "${PROJECT_ROOT}" && "${NODE}" "${JIRA_UTILS}" ${args.map(a => JSON.stringify(String(a))).join(' ')}`,
      { encoding: 'utf8', timeout: 20000 },
    ).trim()
  } catch (err) {
    console.error('[jira-bash-hook] jira error:', err.message)
    return null
  }
}

// Try transition, silently skip if not available from current status
function safeTransition(key, status) {
  const result = jira('transition', key, status)
  if (result) {
    console.error(`[jira-bash-hook] ${key} → ${status}`)
  }
  return result
}

function readSession() {
  try {
    return fs.existsSync(SESSION_FILE)
      ? JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'))
      : null
  } catch {
    return null
  }
}

function getActiveStoryKey(session) {
  if (!session) return null
  return (
    session.activeStoryKey ||
    (session.stories && session.stories[0] && session.stories[0].key) ||
    null
  )
}

function extractCommitSha(output) {
  const match = output.match(/\[[\w/.-]+\s+([0-9a-f]{7,40})\]/)
  return match ? match[1] : null
}

function getCurrentBranch() {
  try {
    return execSync(`git -C "${PROJECT_ROOT}" rev-parse --abbrev-ref HEAD`, {
      encoding: 'utf8',
      timeout: 5000,
    }).trim()
  } catch {
    return 'unknown'
  }
}

async function main() {
  let input = ''
  for await (const chunk of process.stdin) input += chunk

  let data
  try {
    data = JSON.parse(input)
  } catch {
    process.exit(0)
  }

  if (data.tool_name !== 'Bash') process.exit(0)

  const command = (data.tool_input && data.tool_input.command) || ''
  const output = (data.tool_response && data.tool_response.output) || ''

  const isCommit = /git\s+commit\b/.test(command)
  const isPush = /git\s+push\b/.test(command)
  const isE2ePass =
    /playwright\s+test|npm\s+run\s+e2e/.test(command) &&
    /passed/.test(output) &&
    !/failed/.test(output)

  if (!isCommit && !isPush && !isE2ePass) process.exit(0)

  const session = readSession()
  const storyKey = getActiveStoryKey(session)
  const epicKey = session ? session.epicKey : null

  // git commit → comment on active Story with commit SHA
  if (isCommit && storyKey) {
    const sha = extractCommitSha(output)
    const branch = getCurrentBranch()
    const text = sha
      ? `✅ Commit \`${sha}\` 已提交至分支 \`${branch}\`。`
      : `✅ 已在分支 \`${branch}\` 提交。`
    jira('comment', storyKey, text)
    console.error(`[jira-bash-hook] Commit comment added to Story ${storyKey}`)
  }

  // git push → transition Story to Done, then check if Epic can close
  if (isPush) {
    if (storyKey) {
      safeTransition(storyKey, 'Done')
    }

    if (epicKey) {
      const allDone = jira('check-epic-done', epicKey)
      if (allDone === 'true') {
        safeTransition(epicKey, 'Done')
        jira(
          'comment',
          epicKey,
          '🎉 所有 Stories 與 Tasks 均已完成，Epic 關閉。',
        )
      } else {
        const session2 = readSession()
        const openStories = ((session2 && session2.stories) || [])
          .filter(s => s.key !== storyKey)
          .map(s => `• ${s.key}: ${s.summary}`)
          .join('\n')
        if (openStories) {
          jira(
            'comment',
            epicKey,
            `🚀 故事 ${storyKey} 已完成，尚有未完成項目：\n${openStories}`,
          )
        }
      }
    }
  }

  // E2E tests all passed → transition Story to Verified (only from In Progress)
  if (isE2ePass) {
    if (storyKey) {
      safeTransition(storyKey, 'Verified')
      jira('comment', storyKey, '✅ E2E 測試全部通過，Story 已驗證。')
    }

    if (epicKey) {
      const allDone = jira('check-epic-done', epicKey)
      if (allDone === 'true') {
        safeTransition(epicKey, 'Verified')
        jira('comment', epicKey, '🎉 所有 Stories 均已驗證，Epic 驗證完成。')
      }
    }
  }

  process.exit(0)
}

main().catch(err => {
  console.error('[jira-bash-hook] Fatal:', err.message)
  process.exit(0)
})
