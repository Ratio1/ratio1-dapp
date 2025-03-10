#!/bin/bash

set -e  # Exit on error

git checkout master

npm version patch -m "Release %s"

git push origin master --follow-tags