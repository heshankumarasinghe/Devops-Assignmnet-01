#!/bin/bash
export $(grep -v '^#' $GITHUB_ENV | xargs)
