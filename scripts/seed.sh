#!/usr/bin/env sh
# Loads reference data (crops, districts). In development it also creates demo users.
set -e
cd "$(dirname "$0")/../api"
npm run seed
