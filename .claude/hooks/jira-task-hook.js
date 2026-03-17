#!/usr/bin/env node
/**
 * PostToolUse hook — fires when a Task (sub-agent) tool call completes.
 *
 * Agent → Jira mapping:
 *  planner          → create Epic + Stories, write .jira-session.json
 *  tdd-guide        → create Subtask under active Story → Done
 *  code-reviewer    → CRITICAL/HIGH = Bug/Subtask; MEDIUM/LOW = Comment
 *  security-reviewer→ create Task under Epic with severity label
 *
 * Stdin: JSON with { tool_name, tool_input, tool_response }
 */

const { execSync } = require('child_process')
const path = require('path')
const os = require('os')
const fs = require('fs')

const PROJECT_ROOT = '/Users/ryanroll/repos/github/tianwen7252.github.io'
const PLANS_DIR = path.join(PROJECT_ROOT, '.claude/plans')
const SESSION_FILE = path.join(PROJECT_ROOT, '.jira-session.json')
const NODE = '/Users/ryanroll/.nvm/versions/node/v24.9.0/bin/node'
const JIRA_UTILS = path.join(os.homedir(), '.claude/scripts/jira-utils.js')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jira(...args) {
  try {
    return execSync(
      `cd "${PROJECT_ROOT}" && "${NODE}" "${JIRA_UTILS}" ${args.map(a => JSON.stringify(String(a))).join(' ')}`,
      { encoding: 'utf8', timeout: 20000 },
    ).trim()
  } catch (err) {
    console.error('[jira-task-hook] jira error:', err.message)
    return null
  }
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

function writeSession(data) {
  const tmp = SESSION_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tmp, SESSION_FILE)
}

function getActiveStoryKey() {
  const session = readSession()
  if (!session) return null
  return (
    session.activeStoryKey ||
    (session.stories && session.stories[0] && session.stories[0].key) ||
    null
  )
}

function getEpicKey() {
  const session = readSession()
  return session ? session.epicKey : null
}

// ---------------------------------------------------------------------------
// Agent type detection
// ---------------------------------------------------------------------------

function detectAgentType(toolInput) {
  const subtype = (toolInput.subagent_type || '').toLowerCase()
  const desc = (toolInput.description || '').toLowerCase()
  const output = (toolInput._output || '').toLowerCase()

  if (subtype === 'planner' || output.includes('[plan_saved:')) return 'planner'
  if (subtype === 'tdd-guide' || desc.includes('tdd')) return 'tdd-guide'
  if (
    subtype === 'code-reviewer' ||
    desc.includes('code review') ||
    desc.includes('code-review')
  )
    return 'code-reviewer'
  if (subtype === 'security-reviewer' || desc.includes('security'))
    return 'security-reviewer'
  if (subtype === 'build-error-resolver' || desc.includes('build'))
    return 'build-error-resolver'

  // Fallback: check subtype substrings
  if (subtype.includes('planner')) return 'planner'
  if (subtype.includes('tdd')) return 'tdd-guide'
  if (subtype.includes('review') && !subtype.includes('security'))
    return 'code-reviewer'
  if (subtype.includes('security')) return 'security-reviewer'

  return null
}

// ---------------------------------------------------------------------------
// Plan file helpers
// ---------------------------------------------------------------------------

function extractPlanSavedPath(output) {
  const match = output.match(/\[PLAN_SAVED:\s*([^\]]+)\]/)
  if (!match) return null
  const p = match[1].trim()
  return path.isAbsolute(p) ? p : path.join(PROJECT_ROOT, p)
}

function extractPlanTitle(planPath) {
  try {
    const content = fs.readFileSync(planPath, 'utf8')
    const match = content.match(/^#\s+(?:Implementation Plan:\s+)?(.+)/m)
    return match ? match[1].trim() : path.basename(planPath, '.md')
  } catch {
    return path.basename(planPath, '.md')
  }
}

function extractPlanContent(planPath) {
  try {
    return fs.readFileSync(planPath, 'utf8')
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Scope extraction from plan content → Stories
// ---------------------------------------------------------------------------

function extractScopes(planContent, planTitle) {
  const scopes = []

  // Primary: extract "### Phase N: <Name>" headings
  const phaseRegex = /^###\s+Phase\s+\d+[:.]\s+(.+)/gm
  let match
  while ((match = phaseRegex.exec(planContent)) !== null) {
    const name = match[1].trim()
    // Extract content between this heading and the next
    const start = match.index + match[0].length
    const nextPhase = planContent.indexOf('\n### ', start)
    const end = nextPhase > -1 ? nextPhase : planContent.length
    const content = planContent.slice(start, end).trim()
    scopes.push({ name, description: content.slice(0, 500) || name })
  }

  if (scopes.length > 0) return scopes

  // Secondary: extract "## Implementation Steps" sub-sections
  const implMatch = planContent.match(
    /## Implementation Steps([\s\S]+?)(?=## [A-Z]|$)/,
  )
  if (implMatch) {
    const h3Regex = /^###\s+(.+)/gm
    while ((match = h3Regex.exec(implMatch[1])) !== null) {
      scopes.push({ name: match[1].trim(), description: match[1].trim() })
    }
  }

  if (scopes.length > 0) return scopes

  // Fallback: single story with plan title
  return [{ name: planTitle, description: `Main scope for: ${planTitle}` }]
}

function inferComponentLabel(scopeName) {
  const lower = scopeName.toLowerCase()
  if (
    lower.includes('auth') ||
    lower.includes('login') ||
    lower.includes('guard')
  )
    return 'component:auth'
  if (lower.includes('order') || lower.includes('pos')) return 'component:order'
  if (
    lower.includes('stat') ||
    lower.includes('chart') ||
    lower.includes('report')
  )
    return 'component:statistics'
  if (lower.includes('setting') || lower.includes('config'))
    return 'component:settings'
  if (
    lower.includes('staff') ||
    lower.includes('employee') ||
    lower.includes('clockin')
  )
    return 'component:staff'
  if (lower.includes('product') || lower.includes('commodity'))
    return 'component:products'
  if (lower.includes('backup') || lower.includes('sync'))
    return 'component:backup'
  if (
    lower.includes('infra') ||
    lower.includes('db') ||
    lower.includes('schema')
  )
    return 'component:infrastructure'
  return 'component:general'
}

// ---------------------------------------------------------------------------
// Code reviewer output parsing
// ---------------------------------------------------------------------------

function parseReviewFindings(output) {
  const critical = []
  const high = []
  const mediumLow = []

  // Match severity blocks like: ## CRITICAL: title\n...
  const blockRegex =
    /##\s*(CRITICAL|HIGH|MEDIUM|LOW)[:\s]+(.+?)(?=\n##\s*(?:CRITICAL|HIGH|MEDIUM|LOW)|$)/gis
  let match
  while ((match = blockRegex.exec(output)) !== null) {
    const severity = match[1].toUpperCase()
    const body = match[2].trim().slice(0, 300)
    const title = body.split('\n')[0].slice(0, 100)
    const entry = { severity, title, body }
    if (severity === 'CRITICAL') critical.push(entry)
    else if (severity === 'HIGH') high.push(entry)
    else mediumLow.push(entry)
  }

  // Also check for inline [CRITICAL] / [HIGH] patterns
  const inlineRegex = /\[(CRITICAL|HIGH)\]\s*([^\n]+)/g
  while ((match = inlineRegex.exec(output)) !== null) {
    const severity = match[1].toUpperCase()
    const title = match[2].trim().slice(0, 100)
    const entry = { severity, title, body: title }
    const isDuplicate = (severity === 'CRITICAL' ? critical : high).some(
      e => e.title === title,
    )
    if (!isDuplicate) {
      if (severity === 'CRITICAL') critical.push(entry)
      else high.push(entry)
    }
  }

  return { critical, high, mediumLow }
}

function parseSecurityFindings(output) {
  const findings = []
  // Match patterns like: CRITICAL:, HIGH:, or security:critical keywords
  const regex =
    /(?:^|\n)[*-]?\s*(?:\[?(CRITICAL|HIGH|MEDIUM)\]?)\s*[:\-]\s*([^\n]+)/gi
  let match
  while ((match = regex.exec(output)) !== null) {
    const severity = match[1].toUpperCase()
    const title = match[2].trim().slice(0, 100)
    if (title.length > 5) {
      findings.push({
        title,
        label:
          severity === 'CRITICAL' ? 'security:critical' : 'security:medium',
      })
    }
  }

  // Check for "No issues found" or "passed"
  if (
    findings.length === 0 &&
    /no (security )?issues? found|security review passed|all checks passed/i.test(
      output,
    )
  ) {
    return []
  }

  // If no structured findings but output is non-trivial, create one generic finding
  if (findings.length === 0 && output.length > 200) {
    const hasSecurityContent =
      /vulnerabilit|injection|xss|csrf|authentication|authorization|secret|token|exposure/i.test(
        output,
      )
    if (hasSecurityContent) {
      findings.push({
        title: 'Security review findings (see comment)',
        label: 'security:medium',
      })
    }
  }

  return findings
}

// ---------------------------------------------------------------------------
// PLANNER handler
// ---------------------------------------------------------------------------

async function handlePlanner(toolOutput) {
  // Find plan file
  let planPath = extractPlanSavedPath(toolOutput)
  if (!planPath) {
    const found = jira('find-new', PLANS_DIR)
    if (!found) {
      console.error('[jira-task-hook] No new plan file found')
      return
    }
    planPath = found.trim()
  }
  if (!fs.existsSync(planPath)) {
    console.error('[jira-task-hook] Plan file not found:', planPath)
    return
  }

  const planTitle = extractPlanTitle(planPath)
  const planContent = extractPlanContent(planPath)
  const overview =
    (planContent.match(/## Overview\s*([\s\S]+?)(?=\n## |\n###)/) || [])[1] ||
    planTitle

  // Create Epic
  const epicKey = jira('create-epic', planTitle, overview.trim().slice(0, 500))
  if (!epicKey) {
    console.error('[jira-task-hook] Failed to create Epic')
    return
  }
  console.error(`[jira-task-hook] Created Epic ${epicKey}: ${planTitle}`)

  // Append Epic key to plan file
  jira('append-key', planPath, epicKey.trim())

  // Extract scopes and create Stories
  const scopes = extractScopes(planContent, planTitle)
  const stories = []

  for (const scope of scopes) {
    const componentLabel = inferComponentLabel(scope.name)
    const storyKey = jira(
      'create-story',
      `[Story] ${scope.name}`,
      scope.description,
      epicKey.trim(),
      componentLabel,
    )
    if (storyKey) {
      stories.push({
        key: storyKey.trim(),
        summary: scope.name,
        scope: componentLabel,
      })
      console.error(
        `[jira-task-hook] Created Story ${storyKey}: ${scope.name} [${componentLabel}]`,
      )
    }
  }

  // Transition Epic to In Progress
  jira('transition', epicKey.trim(), 'In Progress')
  console.error(`[jira-task-hook] Epic ${epicKey} → In Progress`)

  // Transition first Story to In Progress
  if (stories.length > 0) {
    jira('transition', stories[0].key, 'In Progress')
    console.error(`[jira-task-hook] Story ${stories[0].key} → In Progress`)
  }

  // 寫入 session 檔案
  const session = {
    epicKey: epicKey.trim(),
    epicSummary: planTitle,
    planFile: planPath,
    stories,
    activeStoryKey: stories.length > 0 ? stories[0].key : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  writeSession(session)

  // 將 Stories 區段附加到計畫檔案
  try {
    let content = fs.readFileSync(planPath, 'utf8')
    const storiesSection = `\n## Jira Stories\n\n${stories.map(s => `- [${s.key}](${process.env.JIRA_BASE_URL || 'https://tianwen7252.atlassian.net'}/browse/${s.key}): ${s.summary}`).join('\n')}\n`
    content += storiesSection
    fs.writeFileSync(planPath, content, 'utf8')
  } catch {
    /* non-critical */
  }
}

// ---------------------------------------------------------------------------
// TDD-GUIDE handler
// ---------------------------------------------------------------------------

async function handleTddGuide(toolOutput) {
  const storyKey = getActiveStoryKey()
  if (!storyKey) {
    console.error('[jira-task-hook] No active story for tdd-guide')
    return
  }

  const session = readSession()
  const storyInfo =
    session && session.stories
      ? session.stories.find(s => s.key === storyKey)
      : null
  const storyTitle = storyInfo ? storyInfo.summary : storyKey

  const summary = `[TDD] ${storyTitle}`
  const description = `測試驅動開發（TDD）— 對應故事：${storyKey}\n\n測試覆蓋率要求：80% 以上（分支、函式、行數、語句）。\n\nAgent 輸出摘要：\n${toolOutput.slice(0, 400)}`

  const subtaskKey = jira('create-subtask', summary, description, storyKey)
  if (!subtaskKey) return

  jira('transition', subtaskKey.trim(), 'In Progress')
  jira('transition', subtaskKey.trim(), 'Done')

  const passed = /all tests pass|tests? pass|✓|✅|green/i.test(toolOutput)
  const comment = passed
    ? `✅ TDD 完成，所有測試通過。`
    : `🧪 TDD 週期完成，請確認輸出中是否有失敗的測試。`
  jira('comment', subtaskKey.trim(), comment)

  jira('transition', storyKey, 'In Progress')
  console.error(
    `[jira-task-hook] Created TDD Subtask ${subtaskKey} under ${storyKey}`,
  )
}

// ---------------------------------------------------------------------------
// CODE-REVIEWER handler
// ---------------------------------------------------------------------------

async function handleCodeReviewer(toolOutput) {
  const storyKey = getActiveStoryKey()
  if (!storyKey) {
    console.error('[jira-task-hook] No active story for code-reviewer')
    return
  }

  // Bugs must live at Epic level (Jira hierarchy: Epic > Bug, not Story > Bug)
  const epicKey = getEpicKey()
  const { critical, high, mediumLow } = parseReviewFindings(toolOutput)

  // CRITICAL → Bug under Epic (Jira 限制：Bug 只能掛在 Epic 下，Story 加跨引用 comment)
  for (const finding of critical) {
    const parentKey = epicKey || storyKey
    const bugKey = jira(
      'create-bug',
      `[Critical] ${finding.title}`,
      `在故事 ${storyKey} 的程式碼審查中發現。\n\n${finding.body}`,
      parentKey,
      'severity:critical',
    )
    if (bugKey) {
      jira(
        'comment',
        storyKey,
        `🐛 已建立 Critical Bug 票據：[${bugKey.trim()}] ${finding.title}`,
      )
      console.error(
        `[jira-task-hook] Created Bug ${bugKey} (CRITICAL) under ${parentKey}`,
      )
    }
  }

  // HIGH → Subtask under Story
  for (const finding of high) {
    const subtaskKey = jira(
      'create-subtask',
      `[High] ${finding.title}`,
      finding.body,
      storyKey,
    )
    if (subtaskKey) {
      jira('add-label', subtaskKey.trim(), 'severity:high')
      console.error(
        `[jira-task-hook] Created Subtask ${subtaskKey} (HIGH) under ${storyKey}`,
      )
    }
  }

  // MEDIUM/LOW → single Comment on Story
  if (mediumLow.length > 0) {
    const commentBody = `🔍 程式碼審查發現（Medium／Low）：\n\n${mediumLow.map(f => `• [${f.severity}] ${f.title}`).join('\n')}`
    jira('comment', storyKey, commentBody)
  }

  // CRITICAL findings → reopen Story (REOPENED is in To Do category)
  if (critical.length > 0) {
    jira('transition', storyKey, 'REOPENED')
    console.error(
      `[jira-task-hook] Story ${storyKey} → REOPENED (CRITICAL findings)`,
    )
  }

  if (critical.length === 0 && high.length === 0 && mediumLow.length === 0) {
    jira('comment', storyKey, '✅ 程式碼審查通過，無重大問題。')
  }
}

// ---------------------------------------------------------------------------
// SECURITY-REVIEWER handler
// ---------------------------------------------------------------------------

async function handleSecurityReviewer(toolOutput) {
  const epicKey = getEpicKey()
  if (!epicKey) {
    console.error('[jira-task-hook] No epic key for security-reviewer')
    return
  }

  const findings = parseSecurityFindings(toolOutput)

  if (findings.length === 0) {
    jira('comment', epicKey, '🔒 安全性審查通過，未發現安全問題。')
    return
  }

  for (const finding of findings) {
    const taskKey = jira(
      'create-security-task',
      `[Security] ${finding.title}`,
      `自動化安全審查發現的問題。\n\n問題：${finding.title}\n\n詳細內容請參閱 Session 輸出。`,
      epicKey,
      finding.label,
    )
    if (taskKey) {
      console.error(
        `[jira-task-hook] Created Security Task ${taskKey} [${finding.label}] under Epic ${epicKey}`,
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

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

  const toolOutput = (data.tool_response && data.tool_response.output) || ''
  data.tool_input._output = toolOutput

  const agentType = detectAgentType(data.tool_input)
  if (!agentType) process.exit(0)

  console.error(`[jira-task-hook] Detected agent: ${agentType}`)

  switch (agentType) {
    case 'planner':
      await handlePlanner(toolOutput)
      break
    case 'tdd-guide':
      await handleTddGuide(toolOutput)
      break
    case 'code-reviewer':
      await handleCodeReviewer(toolOutput)
      break
    case 'security-reviewer':
      await handleSecurityReviewer(toolOutput)
      break
    default:
      break
  }

  process.exit(0)
}

main().catch(err => {
  console.error('[jira-task-hook] Fatal:', err.message)
  process.exit(0)
})
