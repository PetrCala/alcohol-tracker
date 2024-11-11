#!/bin/bash

set -e

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")
source "$SCRIPTS_DIR/shellUtils.sh"

PROJECT_ROOT_REL=$(dirname "$SCRIPTS_DIR")
PROJECT_ROOT=$(get_abs_path "$PROJECT_ROOT_REL")

KIROKU_ROOT="$(dirname $PROJECT_ROOT)/Kiroku"

ENV_FILE="$PROJECT_ROOT/.env.development"
IMPORT_FOLDER="$PROJECT_ROOT/local/emulators/emulators-export"

if [ ! -f "$ENV_FILE" ]; then
  error "The .env.development file does not exist. Please create it before setting up the mock database."
  exit 1
fi

if [ ! -d "$IMPORT_FOLDER" ]; then
  error "The emulator file does not exist under path '$IMPORT_FOLDER'."
  exit 1

fi

info "Reading the .env.development file..."
load_env "$ENV_FILE"

info "Starting up the emulators..."
firebase emulators:start --import "$IMPORT_FOLDER"

# Use project
# firebase projects:list
# firebase use "$FIREBASE_PROJECT_ID"

# Check emulator connection

# Reset the state of all emulators to default

# Create storage buckets
