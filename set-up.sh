#!/bin/bash

inside_git_repo="$(git rev-parse --is-inside-work-tree 2>/dev/null)"
if [ "$inside_git_repo" ]; then
    git config core.hooksPath ./.github/hooks 2>&1
    echo "Current hooks path is:"
    git config --get core.hooksPath 2>&1
else
    echo "Hooks not set as you're not in git repo"
fi

