#!/bin/bash

set -e

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")
source "$SCRIPTS_DIR/shellUtils.sh"

PROJECT_ROOT_REL=$(dirname "$SCRIPTS_DIR")
PROJECT_ROOT=$(get_abs_path "$PROJECT_ROOT_REL")

ENV_FILE="$PROJECT_ROOT/.env.development"

if [ ! -f "$ENV_FILE" ]; then
  error "The .env.development file does not exist. Please create it before setting up the mock database."
  exit 1
fi

info "Reading the .env.development file..."
load_env "$ENV_FILE"

info "Setting up the mock database..."
DB_PATH="$(jq -r '.emulators.database.import' firebase.json)"

if [ ! -f "$DB_PATH" ]; then
  error "The expected mock database file does not exist: '$DB_PATH'"
  exit 1
fi

# Use project
# firebase projects:list
# firebase use "$FIREBASE_PROJECT_ID"

# Check emulator connection

# Reset the state of all emulators to default

# Create the realtime database

# Create authentication users

# get users
# firebase auth:export users.json --format=JSON

# Create storage buckets
