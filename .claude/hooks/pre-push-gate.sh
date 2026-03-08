#!/bin/bash
# Pre-push gate: runs build + tests before any git push.
# Configured as a Claude Code PreToolUse hook on Bash commands.
# Reads tool input JSON from stdin, checks if the command is a push,
# and blocks it (exit 2) if build or tests fail.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only gate git push commands
if echo "$COMMAND" | grep -qE '^\s*git\s+push'; then
  PROJECT_DIR=$(echo "$INPUT" | jq -r '.cwd // empty')
  if [ -z "$PROJECT_DIR" ]; then
    PROJECT_DIR="$(pwd)"
  fi
  cd "$PROJECT_DIR" || exit 0

  # Run build
  if ! npm run build > /dev/null 2>&1; then
    echo "BLOCKED: Build failed. Fix build errors before pushing." >&2
    exit 2
  fi

  # Run tests
  if ! npx vitest run > /dev/null 2>&1; then
    echo "BLOCKED: Tests failed. Fix test failures before pushing." >&2
    exit 2
  fi
fi

exit 0
