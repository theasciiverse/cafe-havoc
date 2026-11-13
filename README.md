> **In the terminal:** this is the Asciiverse edition. Install and start it
> with [av](https://asciiverse.sh): `av install cafe-havoc`, then pick it in
> av. To build it yourself: `make -f asciiverse/Makefile`, then
> `./out/cafe-havoc`. What changed, and how it runs, is in
> [PATCHES.md](PATCHES.md); the author's permission in
> [PERMISSION.md](PERMISSION.md).

# Café Havoc

![Screenshot](cafe-havoc.png)

This is a [7DRL](http://7drl.org/) game. To play it, just open http://ondras.github.io/cafe-havoc/ in your browser.

## Technology

HTML, CSS (LESS), JavaScript (ES2015). 

  - Building:
```
$ npm install
$ make
```

  - Auto-rebuild (watching) using `inotify-tools`:
```
$ make watch
```

Two custom fonts are used:

  - **[Lora](http://www.cyreal.org/2012/07/lora/)** for the verbose textual column,
  - **[Metrickal](https://github.com/robey/metrickal-typeface)** for the map and nav bars.
