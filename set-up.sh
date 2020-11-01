#!/bin/bash

git config core.hooksPath ./.github/hooks
cd ./.github/hooks
chmod +x pre-commit pre-push
cd ../../
echo "Current hooks path is:"
git config --get core.hooksPath
