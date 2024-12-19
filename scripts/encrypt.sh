#!/bin/bash

set -e

source scripts/shellUtils.sh

FILE=$1

if [ -z "$FILE" ]; then
  echo "Usage: $0 <file>"
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE"
  exit 1
fi

if [ -f "$FILE.gpg" ]; then
  echo "Encrypted file already exists: $FILE.gpg"
  exit 1
fi

if ! command -v gpg &>/dev/null; then
  error "GPG is not installed"
  exit 1
fi

# Prompt the user for a passphrase
read -s -p "Enter passphrase: " PASSPHRASE
echo

info "Encrypting $FILE with a passphrase..."

# Encrypt the file using the provided passphrase
export GPG_TTY=$(tty) # Ensure the gpg decryptions work in workflows
gpg --quiet --batch --yes --pinentry-mode=loopback --passphrase="$PASSPHRASE" --decrypt --output "$FILE" "$FILE.gpg"

success "Encrypted file: $FILE.gpg"
