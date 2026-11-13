# Changes from upstream

This is the Asciiverse terminal edition of Café Havoc, Ondřej Žára's game
for the 2016 Seven Day Roguelike Challenge, from
github.com/ondras/cafe-havoc (the `upstream` remote; this branch,
`asciiverse`, starts from its master at `689df78`, 2016-03-11, with the
full history). It is here by the author's permission (`PERMISSION.md`).

**The game's own files are unchanged.** The game runs from its built
`js/app.js` (its ES2015 sources compiled to SystemJS modules, as the
upstream Makefile makes it) and `js/polyfills.js`. Everything new is in
`asciiverse/`, plus this file and `PERMISSION.md`; README.md gets a note at
the top on playing it with av.

## How it works

- `asciiverse/rotty/`: rotty, our runtime for Ondřej's rot.js games (the
  same as in Goldfish, The Royal Wedding and The Conception): the browser
  as far as these games use it, rot.js's display drawn into terminal
  cells, keys as browser events, HTML panels as boxes. rot.js's display is
  patched as soon as rot.js is loaded, because this game builds its map at
  load time.
- `asciiverse/game.js`: Café Havoc's layout, as the page's CSS has it: the
  map on the left (60% of the width, the display centred in it, a line on
  its right that turns red at night), with the clock, health and badge in
  its top right corner; the story on the right, newest at the bottom; the
  interaction modes and the inventory in the two rows below. The title page
  is index.html's own cup, its face fading in red and its prompt blinking.
  The end-of-game assessment is drawn over the darkened map, as the page
  does.
- `asciiverse/build.py`, `asciiverse/Makefile`: the page's scripts, in its
  order, as one classic script, compiled with QuickJS-ng into one native
  binary of about 2 MB that needs nothing to run.

## Ours

- **Keys:** as in the browser (arrows, vim keys, Home, PgUp, End, PgDn,
  `.`, d c g a, 1 to 8, + and -). Ctrl+C or Ctrl+Q quits.
- **A new game at the end:** the assessment asks to reload the page; here
  R starts a new game (the program starts itself again).
- **`--seed N`:** the game seeds rot.js with the time; with `--seed N` it
  gets N instead, so the café is built the same each time (the preview
  uses seed 5).
- **Session log:** `cafe-havoc.log` in the state folder
  (`$XDG_STATE_HOME/cafe-havoc`, `~/.local/state/cafe-havoc`, Application
  Support on macOS, `%LOCALAPPDATA%` on Windows). `CAFE_HAVOC_LOG=debug`
  (or `ROTTY_LOG=debug`) records every key and a snapshot each second.
- The page's web fonts are not loaded; the zoom keys change the browser's
  font size, which a terminal does not have, so they do nothing visible.

## Imported

- `asciiverse/quickjs/`: QuickJS-ng 0.17.0 as in our Candy Box 2 (one
  change in `quickjs-libc.c`: a signal interrupting `poll()` no longer ends
  the event loop), MIT.
- `asciiverse/ROT-LICENSE`: rot.js's licence (BSD-3-Clause), for the
  `js/rot.min.js` the game bundles.

## Packaging

- `.github/workflows/release.yml`: static Linux (musl, x86-64 and ARM64),
  macOS (x86-64 and ARM64) and Windows (x86-64, MinGW) archives plus
  SHA256SUMS, on tags `*-av.*`.
- `asciiverse/package.sh`: the archive (the program, PERMISSION.md,
  PATCHES.md, the licences).
- `asciiverse/record-preview.sh`: the 100x30 catalog preview, with hub's
  castrec.py.
