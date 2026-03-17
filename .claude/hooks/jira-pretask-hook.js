#!/usr/bin/env node
/**
 * PreToolUse hook — fires BEFORE a Task (sub-agent) tool call executes.
 *
 * Responsibilities:
 *  - Extract [STORY: DEV-X] from the agent prompt and update session activeStoryKey
 *  - Set JIRA_ACTIVE_STORY env var context (written to stderr for debugging)
 *
 * Stdin: JSON with { tool_name, tool_input }
 * Exit 0: allow the tool call to proceed
 * Exit 2 + JSON { "reason": "..." }: block the tool call (never used here)
 */

const { execSync } = require('child_process')
const path = require('path')
const os = require('os')

const PROJECT_ROOT = '/Users/ryanroll/repos/github/tianwen7252.github.io'
const NODE = '/Users/ryanroll/.nvm/versions/node/v24.9.0/bin/node'
const JIRA_UTILS = path.join(os.homedir(), '.claude/scripts/jira-utils.js')

function jira(...args) {
  try {
    return execSync(
      `cd "${PROJECT_ROOT}" && "${NODE}" "${JIRA_UTILS}" ${args.map(a => JSON.stringify(String(a))).join(' ')}`,
      { encoding: 'utf8', timeout: 10000 },
    ).trim()
  } catch {
    return null
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

  if (data.tool_name !== 'Task') process.exit(0)

  const prompt = (data.tool_input && data.tool_input.prompt) || ''

  // Extract [STORY: DEV-X] marker from prompt
  const storyMatch = prompt.match(/\[STORY:\s*([A-Z]+-\d+)\]/i)
  if (storyMatch) {
    const storyKey = storyMatch[1].trim()
    jira('session-set-active', storyKey)
    // Transition Story to In Progress when work begins
    jira('transition', storyKey, 'In Progress')
    console.error(
      `[jira-pretask-hook] Active story set to ${storyKey} → In Progress`,
    )
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
