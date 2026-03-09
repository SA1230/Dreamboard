#!/bin/bash
# Pre-push gate: runs lint + build + tests before any git push.
# Configured as a Claude Code PreToolUse hook on Bash commands.
# Reads tool input JSON from stdin, checks if the command is a push,
# and blocks it (exit 2) if lint, build, or tests fail.
# Shows output on failure so the agent can diagnose without re-running.
# Logs failures to .claude/hook-failures.log for pattern detection.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only gate git push commands
if echo "$COMMAND" | grep -qE '^\s*git\s+push'; then
  PROJECT_DIR=$(echo "$INPUT" | jq -r '.cwd // empty')
  if [ -z "$PROJECT_DIR" ]; then
    PROJECT_DIR="$(pwd)"
  fi
  cd "$PROJECT_DIR" || exit 0

  FAILURE_LOG="$PROJECT_DIR/.claude/hook-failures.log"
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

  # Run lint
  LINT_OUTPUT=$(npm run lint 2>&1)
  if [ $? -ne 0 ]; then
    echo "BLOCKED: Lint failed. Fix lint errors before pushing." >&2
    echo "$LINT_OUTPUT" >&2
    echo "$TIMESTAMP | lint | $BRANCH | BLOCKED" >> "$FAILURE_LOG"
    exit 2
  fi

  # Run build
  BUILD_OUTPUT=$(npm run build 2>&1)
  if [ $? -ne 0 ]; then
    echo "BLOCKED: Build failed. Fix build errors before pushing." >&2
    echo "$BUILD_OUTPUT" >&2
    echo "$TIMESTAMP | build | $BRANCH | BLOCKED" >> "$FAILURE_LOG"
    exit 2
  fi

  # Run tests
  TEST_OUTPUT=$(npx vitest run 2>&1)
  if [ $? -ne 0 ]; then
    echo "BLOCKED: Tests failed. Fix test failures before pushing." >&2
    echo "$TEST_OUTPUT" >&2
    echo "$TIMESTAMP | test | $BRANCH | BLOCKED" >> "$FAILURE_LOG"
    exit 2
  fi
fi

exit 0
