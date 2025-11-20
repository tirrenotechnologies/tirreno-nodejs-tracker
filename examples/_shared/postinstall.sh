#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SHARED_DIR="$ROOT_DIR/_shared"
PUBLIC_DIR="$SHARED_DIR/public"
VIEWS_DIR="$SHARED_DIR/views"

TARGET_DIR="$(pwd)"
TARGET_PUBLIC="$TARGET_DIR/public"
TARGET_VIEWS="$TARGET_DIR/views"

for dir in "$PUBLIC_DIR" "$VIEWS_DIR"; do
  [[ -d "$dir" ]] || { echo "Note found: $dir"; exit 1; }
done

safe_remove_link() {
  local target="$1"
  if [[ -e "$target" || -L "$target" ]]; then
    rm -rf "$target"
  fi
}

safe_remove_link "$TARGET_PUBLIC"
ln -s "$PUBLIC_DIR" "$TARGET_PUBLIC"

safe_remove_link "$TARGET_VIEWS"
ln -s "$VIEWS_DIR" "$TARGET_VIEWS"

# echo "$TARGET_PUBLIC → $PUBLIC_DIR"
# echo "$TARGET_VIEWS → $VIEWS_DIR"

