#!/bin/sh
# Packs dist/cafe-havoc-<target>.tar.gz (.zip for Windows) for av: the
# program at the top, the author's permission, PATCHES.md and the licences
# of rotty, QuickJS-ng and rot.js.
#
#   asciiverse/package.sh x86_64-unknown-linux-musl
set -eu
cd "$(dirname "$0")/.."
target="$1"
case "$target" in *windows*) exe=.exe ;; *) exe= ;; esac
stage=stage/cafe-havoc
rm -rf "$stage" && mkdir -p "$stage" dist
cp "out/cafe-havoc$exe" PERMISSION.md PATCHES.md "$stage/"
cp asciiverse/LICENSE-rotty "$stage/LICENSE-rotty"
cp asciiverse/quickjs/LICENSE "$stage/QUICKJS-LICENSE"
cp asciiverse/ROT-LICENSE "$stage/ROT-LICENSE"
if [ -n "$exe" ]; then
  (cd "$stage" && zip -qr "../../dist/cafe-havoc-$target.zip" .)
else
  tar -czf "dist/cafe-havoc-$target.tar.gz" -C "$stage" .
fi
ls -l dist
