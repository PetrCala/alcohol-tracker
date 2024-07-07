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

if [[ $FILE != *.mobileprovision ]]; then
  error "File must be a .mobileprovision file"
  exit 1
fi

info "Encrypting $FILE..."

gpg --output $FILE.gpg --encrypt --recipient cala.p@seznam.cz $FILE

success "Encrypted file: $FILE.gpg"
