#!/bin/sh
# Records the catalog preview, asciiverse/cafe-havoc.cast, at 100x30 with
# hub's castrec.py: the title page, then the first morning of --seed 5:
# out of the flat into the cafe, Jenkins and his welcome, the corridor and
# the storage room. Run from the repo root after building.
set -eu
CASTREC=${CASTREC:-../hub/tools/castrec.py}
state=$(mktemp -d)
trap 'rm -rf "$state"' EXIT
KEYS="kkkkkkkkkkkkkkkk kkkul c l kkkkkk kk c kkkkk hykkkkkukl"
S="w4;kspace;w1"
for k in $(echo "$KEYS" | tr -d ' ' | fold -w1); do S="$S;k$k;w0.3"; done
S="$S;w3"
XDG_STATE_HOME="$state" python3 "$CASTREC" "${1:-asciiverse/cafe-havoc.cast}" . "$S" -- ./out/cafe-havoc --seed 5
