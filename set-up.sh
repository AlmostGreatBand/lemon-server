#!/bin/bash

git config core.hooksPath ./.github/hooks
echo "Current hooks path is:"
git config --get core.hooksPath

