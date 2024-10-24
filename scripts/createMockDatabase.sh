#!/bin/bash

set -e

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")
source "$SCRIPTS_DIR/shellUtils.sh"

PROJECT_ROOT=$(dirname "$SCRIPTS_DIR")

cd "$PROJECT_ROOT"

info "Creating a mock database..."

ts-node -e "import { createMockDatabase } from './src/database/MockDatabase.ts'; createMockDatabase();"

success "Done."
