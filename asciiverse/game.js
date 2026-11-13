// Café Havoc in the terminal: how the page is laid out on the screen. As in
// the browser: the map on the left (60%) with the clock, your health and
// badge in its top right corner; the story on the right, newest at the
// bottom; the interaction modes and the inventory in the two rows below.
/* BUILD {"files": []} */

var GAME = {
    id: "cafe-havoc",
    usage: "cafe-havoc [--seed N] [--version]\n\n" +
        "Cafe Havoc by Ondrej Zara (7DRL 2016), in the terminal. Move with the\n" +
        "arrows or vim keys (hjkl yubn; Home, PgUp, End and PgDn for the\n" +
        "diagonals); . waits. d, c, g and a pick what bumping into people does\n" +
        "(describe, chat, give, attack); 1 to 8 ready an item. + and - zoom.\n" +
        "R starts a new game once this one is over. Ctrl+C or Ctrl+Q quits.\n" +
        "--seed N builds the same cafe each time. CAFE_HAVOC_LOG=debug logs every\n" +
        "key to the state folder.\n"
};

GAME.mapWidth = function () { return Math.max(20, Math.round(TERM.w * 0.6)); };
GAME.footer = 2;

// the boxes the game measures: the map, so the display fills it
GAME.box = function (el) {
    if (el.id == "map") return { x: 0, y: 0, w: GAME.mapWidth() - 1, h: TERM.h - GAME.footer };
    return null;
};

GAME.hidden = function (n) {
    return n.classList && n.classList.contains("hidden");
};
GAME.css = function (n) {
    if (GAME.hidden(n)) return { hidden: true };
    if (n.classList && n.classList.contains("tutorial")) return { fg: "#da2" };
    if (n.tagName == "EM" || n.tagName == "STRONG") return { fg: "#fff" };
    if (n.classList && n.classList.contains("full")) return { fg: "#0f0" };
    if (n.classList && n.classList.contains("empty")) return { fg: "#050" };
    if (n.classList && n.classList.contains("alive")) return { fg: "#0f0" };
    if (n.classList && n.classList.contains("dead")) return { fg: "#f00" };
    return null;
};

// the title page: index.html's <pre>, centred; the face in the cup fades
// from black to red and back, the prompt blinks
GAME.intro = function (node) {
    var pre = node.querySelector("pre");
    if (!pre) return;
    var t = Date.now() / 1000;
    var wave = function (period, delay) {   // 0..1..0, "alternate"
        var p = Math.max(0, t - delay) % (2 * period) / period;
        return p > 1 ? 2 - p : p;
    };
    var rows = [[]];
    var walk = function (n, fg) {
        if (n.nodeType == 3) {
            Array.from(n.data.replace(/\t/g, "    ")).forEach(function (ch) {
                if (ch == "\n") rows.push([]); else rows[rows.length - 1].push([ch, fg]);
            });
            return;
        }
        var f = fg;
        if (n.tagName == "EM") f = n.classList.contains("blink") ? TERM.mix([0, 0, 0], [255, 255, 51], wave(3, 0)) : "#fff";
        else if (n.tagName == "I") f = TERM.mix([0, 0, 0], [204, 0, 0], wave(3, 1));
        else if (n.tagName == "A") f = "#fff";
        n.childNodes.forEach(function (c) { walk(c, f); });
    };
    walk(pre, "#888");
    var text = function (r) { return r.map(function (c) { return c[0]; }).join(""); };
    while (rows.length && !text(rows[0]).trim()) rows.shift();
    while (rows.length && !text(rows[rows.length - 1]).trim()) rows.pop();
    // trailing blanks do not count when centring a line
    rows = rows.map(function (r) { while (r.length && r[r.length - 1][0] == " ") r.pop(); return r; });
    // too tall for the terminal: the blank rows go first, then the steam
    var drop = function (test) {
        for (var i = 1; i < rows.length - 1 && rows.length > TERM.h; i++) if (test(rows, i)) { rows.splice(i, 1); i--; }
    };
    drop(function (r, i) { return !text(r[i]).trim(); });
    while (rows.length > TERM.h && rows.length > 2 && !/C A F/.test(text(rows[0]))) rows.shift();
    var w = 0;
    rows.forEach(function (r) { w = Math.max(w, r.length); });
    var y0 = Math.max(0, ((TERM.h - rows.length) / 2) | 0);
    // the art is one block (centred as a whole); the lines under it each
    var art = rows.length;
    for (var i = 0; i < rows.length; i++) if (/Press/.test(text(rows[i]))) { art = i; break; }
    rows.forEach(function (r, j) {
        var x0 = j < art ? ((TERM.w - w) / 2) | 0 : ((TERM.w - r.length) / 2) | 0;
        r.forEach(function (c, i) { TERM.put(x0 + i, y0 + j, c[0], c[1], null); });
    });
};

GAME.border = function () {
    return document.body.classList.contains("night") ? "#f00" : "#808080";
};

GAME.layout = function () {
    var intro = document.getElementById("intro");
    if (intro) { GAME.intro(intro); return; }
    var W = TERM.w, H = TERM.h, mw = GAME.mapWidth(), mh = H - GAME.footer;
    var border = GAME.border();

    // the map, the display centred in it as the page does (style.left/top)
    var map = document.getElementById("map");
    var c = DOM.query(map, "canvas", true);
    if (c) {
        var left = parseInt(c.style.left, 10) || 0, top = parseInt(c.style.top, 10) || 0;
        TERM.blit(c, Math.max(0, left), Math.max(0, top), Math.max(0, -left), Math.max(0, -top),
            Math.min(c.cols, mw - 1 - Math.max(0, left)), Math.min(c.rows, mh - Math.max(0, top)));
    }
    for (var y = 0; y < mh; y++) TERM.put(mw - 1, y, "│", border, null);

    // the clock, health and badge in the map's top right corner
    var status = document.getElementById("status");
    if (status && !GAME.hidden(status)) {
        var lines = [];
        status.children.forEach(function (d) {
            if (d.style.color) d._fg = d.style.color;
            var ls = PANEL.lines(d, mw - 3, { fg: d.style.color || "#aaa" });
            if (d.id == "health") ls = GAME.pre(d);
            ls.forEach(function (l) { lines.push(l); });
        });
        var sw = 0;
        lines.forEach(function (l) { var n = 0; l.forEach(function (r) { n += Array.from(r.t).length; }); sw = Math.max(sw, n); });
        var sx = mw - 2 - sw;
        lines.forEach(function (l, j) {
            TERM.fillRect(sx - 1, j, sw + 1, 1, "#000");
            GAME.runs(l, sx, j, sw);
        });
    }

    // the game's assessment, over the map
    var over = document.getElementById("gameover");
    if (over && over.parentNode) GAME.gameover(over, mw - 1, mh);

    // the story, newest at the bottom
    var log = document.getElementById("log");
    var lx = mw + 1, lw = W - lx - 1;
    if (log && lw > 4) {
        var all = [];
        log.children.forEach(function (p) {
            var ls = PANEL.lines(p, lw, { fg: "#aaa" });
            if (!ls.length) return;
            if (all.length) all.push([]);
            ls.forEach(function (l) { all.push(l); });
        });
        if (all.length > mh) all = all.slice(all.length - mh);
        var ly = mh - all.length;
        all.forEach(function (l, j) { GAME.runs(l, lx, ly + j, lw); });
    }

    // the interaction modes and the inventory
    var bump = document.getElementById("bump");
    if (bump && !GAME.hidden(bump)) {
        // li + li has a padding of 1ch on each side; hidden ones keep their place
        var x = 0;
        bump.children.forEach(function (li, i) {
            var len = Array.from(li.textContent).length, wid = len + (i ? 2 : 0);
            if (!GAME.hidden(li)) {
                var bg = li.classList.contains("active") ? "#2a2a2a" : null;
                if (bg) TERM.fillRect(x, H - 2, wid, 1, bg);
                PANEL.lines(li, 1000, { fg: "#aaa" }).forEach(function (l) { GAME.runs(l, x + (i ? 1 : 0), H - 2, W, bg); });
            }
            x += wid;
        });
    }
    var inv = document.getElementById("inventory");
    if (inv) {
        var slots = inv.children, sw2 = W / Math.max(1, slots.length);
        slots.forEach(function (li, i) {
            var x0 = Math.round(i * sw2), x1 = Math.round((i + 1) * sw2);
            if (!li.textContent) return;
            var act = li.classList.contains("active");
            if (act) TERM.fillRect(x0, H - 1, x1 - x0, 1, "#2a2a2a");
            TERM.text(x0, H - 1, (i + 1) + " ", "#fff", act ? "#2a2a2a" : null);
            // as in the browser, a long name runs on over an empty slot
            var next = slots[i + 1], room = next && next.textContent ? x1 - x0 - 3 : W - x0 - 2;
            TERM.text(x0 + 2, H - 1, li.textContent.slice(0, Math.max(0, room)), li.style.color || "#aaa", act ? "#2a2a2a" : null);
        });
    }
};

// lines of an element whose white space is kept (white-space: pre)
GAME.pre = function (el) {
    var lines = [[]];
    var walk = function (n, fg) {
        if (n.nodeType == 3) {
            n.data.split("\n").forEach(function (part, i) {
                if (i) lines.push([]);
                if (part) lines[lines.length - 1].push({ t: part, fg: fg });
            });
            return;
        }
        var css = GAME.css(n) || {};
        var f = n.style.color || css.fg || fg;
        n.childNodes.forEach(function (ch) { walk(ch, f); });
    };
    walk(el, "#aaa");
    return lines.filter(function (l) { return l.length; });
};

GAME.runs = function (line, x, y, w, bg) {
    var cx = x;
    line.forEach(function (r) {
        Array.from(r.t).forEach(function (ch) {
            if (cx < x + w) TERM.put(cx, y, ch, r.fg, bg || null, false, r.bold);
            cx++;
        });
    });
};

GAME.gameover = function (node, w, h) {
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var k = y * TERM.w + x, cell = TERM.cells[k];
        cell.fg = TERM.mix(cell.fg, [0, 0, 0], 0.8); cell.bg = TERM.mix(cell.bg, [0, 0, 0], 0.8);
    }
    var y0 = 1, x0 = 2;
    DOM.query(node, "tr", false).forEach(function (tr) {
        var cells = tr.children, cx = x0;
        cells.forEach(function (td, i) {
            var css = GAME.css(td) || {};
            var fg = td.tagName == "TH" || i > 0 && !/status/.test(td.className) ? "#fff" : css.fg || "#aaa";
            if (/status/.test(td.className)) fg = css.fg || "#aaa";
            TERM.text(cx, y0, td.textContent, fg, null);
            cx += i == 0 && td.tagName == "TD" ? 18 : td.textContent.length + 1;
        });
        y0 += 2;
    });
    var rest = "";
    node.childNodes.forEach(function (n) { if (n.nodeType == 3) rest += n.data; });
    rest = rest.replace(/\s+/g, " ").trim();
    PANEL.draw({ nodeType: 3, data: rest }, x0, y0, w - x0 - 1, 3, { fg: "#aaa" });
    TERM.text(x0, y0 + 2, "R", "#fff"); TERM.text(x0 + 1, y0 + 2, " starts a new game, ", "#aaa");
    TERM.text(x0 + 21, y0 + 2, "Ctrl+Q", "#fff"); TERM.text(x0 + 27, y0 + 2, " quits.", "#aaa");
};

GAME.isOver = function () {
    var over = document.getElementById("gameover");
    return !!(over && over.parentNode);
};
GAME.onKey = function (e) {
    if (GAME.isOver() && (e.key == "r" || e.key == "R")) { MAIN.reload(); return false; }
};

GAME.snapshot = function () {
    var map = document.getElementById("map"), c = map && DOM.query(map, "canvas", true);
    return "display=" + (c ? c.cols + "x" + c.rows + "@" + c.style.left + "," + c.style.top : "-") +
        " night=" + document.body.classList.contains("night") + (GAME.isOver() ? " over" : "");
};

// --seed N: the same cafe every time (for the preview); the game seeds
// rot.js with the time as its first act, so the seed follows right after
GAME.seed = null;
GAME.arg = function (a, b) {
    if (a == "--seed" && b) { GAME.seed = parseInt(b, 10); return true; }
    return false;
};
// (set as soon as rot.js is loaded, before the game's own scripts run)
GAME.patchRot = function () {
    if (GAME.seed === null) return;
    var setSeed = ROT.RNG.setSeed;
    ROT.RNG.setSeed = function () { return setSeed.call(this, GAME.seed); };
    ROT.RNG.setSeed(GAME.seed);
};
