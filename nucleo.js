
'use strict';

// ============================================================
// ¡REPARA EL NÚCLEO WARP!
// Puzle de circuitos aleatorios.
// ============================================================

let nucleoGame = null;

const NUCLEO_N = 5;
const NUCLEO_CELL = 72;
let nucleoTotalScore = 0;

// Conexiones de cada pieza:
// Norte = 1, Este = 2, Sur = 4, Oeste = 8.
const NUCLEO_DIRS = [
    { bit: 1, opposite: 4, dx: 0, dy: -1 },
    { bit: 2, opposite: 8, dx: 1, dy: 0 },
    { bit: 4, opposite: 1, dx: 0, dy: 1 },
    { bit: 8, opposite: 2, dx: -1, dy: 0 }
];

function nucleoRotateMask(mask, turns) {
    for (let i = 0; i < turns; i++) {
        mask = ((mask << 1) & 15) | ((mask >> 3) & 1);
    }
    return mask;
}

function nucleoRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function nucleoShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = nucleoRandomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function nucleoInside(x, y) {
    return x >= 0 && y >= 0 &&
        x < NUCLEO_N && y < NUCLEO_N;
}

function nucleoIsBorder(x, y) {
    return x === 0 || y === 0 ||
        x === NUCLEO_N - 1 || y === NUCLEO_N - 1;
}

function nucleoGetBorderCells() {
    const cells = [];

    for (let y = 0; y < NUCLEO_N; y++) {
        for (let x = 0; x < NUCLEO_N; x++) {
            if (nucleoIsBorder(x, y)) {
                cells.push({ x, y });
            }
        }
    }

    return cells;
}

// Busca una ruta aleatoria sin repetir casillas.
// La ruta termina en el destino y tiene al menos 7 casillas.
function nucleoGeneratePath(start, destination) {
    const visited = Array.from(
        { length: NUCLEO_N },
        () => Array(NUCLEO_N).fill(false)
    );

    const path = [];

    function search(x, y) {
        visited[y][x] = true;
        path.push({ x, y });

        if (
            x === destination.x &&
            y === destination.y &&
            path.length >= 7
        ) {
            return true;
        }

        const directions = nucleoShuffle([
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }
        ]);

        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;

            if (!nucleoInside(nx, ny) || visited[ny][nx]) {
                continue;
            }

            // No atravesar otros bordes: el destino debe ser
            // el punto final de la ruta.
            if (
                nucleoIsBorder(nx, ny) &&
                !(nx === destination.x && ny === destination.y)
            ) {
                continue;
            }

            if (search(nx, ny)) {
                return true;
            }
        }

        path.pop();
        visited[y][x] = false;
        return false;
    }

    return search(start.x, start.y) ? path : null;
}

function nucleoMaskBetween(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (dx === 1) return 2;
    if (dx === -1) return 8;
    if (dy === 1) return 4;
    if (dy === -1) return 1;

    return 0;
}

function beginNucleoGame() {
    const border = nucleoGetBorderCells();

    let start;
    let destination;
    let path = null;

    // Buscar un recorrido válido. Cambian tanto los extremos
    // como la ruta en cada nueva partida.
    for (let attempt = 0; attempt < 150 && !path; attempt++) {
        start = border[nucleoRandomInt(border.length)];

        const possibleDestinations = border.filter(p =>
            !(p.x === start.x && p.y === start.y) &&
            (p.x !== start.x || p.y !== start.y)
        );

        destination =
            possibleDestinations[
            nucleoRandomInt(possibleDestinations.length)
            ];

        path = nucleoGeneratePath(start, destination);
    }

    // Respaldo por si no se encuentra ruta en los intentos.
    if (!path) {
        start = { x: 0, y: 0 };
        destination = { x: 4, y: 4 };

        path = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 3 },
            { x: 4, y: 4 }
        ];
    }

    const grid = Array.from(
        { length: NUCLEO_N },
        () => Array.from({ length: NUCLEO_N }, () => ({
            mask: 0,
            rotation: 0,
            isPath: false
        }))
    );

    // Construir las conexiones correctas a partir de la ruta.
    for (let i = 0; i < path.length; i++) {
        const current = path[i];
        const tile = grid[current.y][current.x];

        tile.isPath = true;

        if (i > 0) {
            tile.mask |= nucleoMaskBetween(current, path[i - 1]);
        }

        if (i < path.length - 1) {
            tile.mask |= nucleoMaskBetween(current, path[i + 1]);
        }
    }

    // Crear piezas de distracción en las casillas restantes.
    // Son rectas o curvas, y no forman parte de la ruta prevista.
    const distractorMasks = [3, 6, 9, 12, 5, 10];

    for (let y = 0; y < NUCLEO_N; y++) {
        for (let x = 0; x < NUCLEO_N; x++) {
            const tile = grid[y][x];

            if (!tile.isPath) {
                tile.mask =
                    distractorMasks[
                    nucleoRandomInt(distractorMasks.length)
                    ];
            }

            // Desordenar todas las piezas, incluidas las correctas.
            tile.rotation = nucleoRandomInt(4);
        }
    }

    nucleoGame = {
        grid,
        start,
        destination,
        path,
        cursorX: start.x,
        cursorY: start.y,
        timeLeft: 60,
        score: nucleoTotalScore,
        mistakes: 0,
        over: false,
        won: false,
        lastTick: performance.now(),
        message: 'Conecta la FUENTE con el NÚCLEO',
        messageTime: 3,
        animating: false,
        animationTime: 0
    };

    gameState = 'NUCLEO_GAME';
}

function handleNucleoKey(key) {
    const g = nucleoGame;
    if (!g) return;

    const k = key.toLowerCase();

    if (key === 'Escape' || k === 'x') {
        nucleoTotalScore = 0;
        nucleoGame = null;
        gameState = 'MODE_SELECT';
        return;
    }

    if (g.over) {
        if (k === 'r' || key === ' ' || key === 'Enter') {
            beginNucleoGame();
        }
        return;
    }

    if (g.animating) {
        return;
    }

    if (k === 'r') {
        beginNucleoGame();
        return;
    }

    if (key === 'ArrowLeft' || k === 'a') {
        g.cursorX = Math.max(0, g.cursorX - 1);
    } else if (key === 'ArrowRight' || k === 'd') {
        g.cursorX = Math.min(NUCLEO_N - 1, g.cursorX + 1);
    } else if (key === 'ArrowUp' || k === 'w') {
        g.cursorY = Math.max(0, g.cursorY - 1);
    } else if (key === 'ArrowDown' || k === 's') {
        g.cursorY = Math.min(NUCLEO_N - 1, g.cursorY + 1);
    } else if (key === ' ') {
        const tile = g.grid[g.cursorY][g.cursorX];
        tile.rotation = (tile.rotation + 1) % 4;
    } else if (key === 'Enter') {
        nucleoTestCircuit();
    }
}

// Comprueba las conexiones reales recorriendo el tablero.
// Para pasar de una casilla a otra, ambas piezas deben tener
// conexiones enfrentadas.
function nucleoTestCircuit() {
    const g = nucleoGame;
    if (!g || g.over || g.animating) return;

    playSound(soundReparaNucleoComprueba);

    const visited = Array.from(
        { length: NUCLEO_N },
        () => Array(NUCLEO_N).fill(false)
    );

    // Ahora cada elemento guarda también el camino REAL
    // encontrado a través de las piezas que ha colocado el jugador.
    const queue = [{
        x: g.start.x,
        y: g.start.y,
        path: [{ x: g.start.x, y: g.start.y }]
    }];

    visited[g.start.y][g.start.x] = true;

    let foundPath = null;

    while (queue.length > 0) {
        const current = queue.shift();

        if (
            current.x === g.destination.x &&
            current.y === g.destination.y
        ) {
            foundPath = current.path;
            break;
        }

        const currentTile = g.grid[current.y][current.x];

        const currentMask = nucleoRotateMask(
            currentTile.mask,
            currentTile.rotation
        );

        for (const dir of NUCLEO_DIRS) {
            if (!(currentMask & dir.bit)) continue;

            const nx = current.x + dir.dx;
            const ny = current.y + dir.dy;

            if (!nucleoInside(nx, ny) || visited[ny][nx]) {
                continue;
            }

            const nextTile = g.grid[ny][nx];

            const nextMask = nucleoRotateMask(
                nextTile.mask,
                nextTile.rotation
            );

            // Las dos piezas deben tener conexiones enfrentadas.
            if (!(nextMask & dir.opposite)) continue;

            visited[ny][nx] = true;

            queue.push({
                x: nx,
                y: ny,
                path: [
                    ...current.path,
                    { x: nx, y: ny }
                ]
            });
        }
    }

    if (foundPath) {
        // IMPORTANTE: animamos el camino que acaba de construir
        // el jugador, no la ruta original del generador.
        g.animationPath = foundPath;
        g.score += 100 + Math.ceil(g.timeLeft) * 5;
        nucleoTotalScore = g.score;
        g.won = true;
        g.animating = true;
        g.animationTime = 0;
        g.message = '¡ENERGÍA RESTABLECIDA!';
    } else {
        g.mistakes++;
        g.timeLeft = Math.max(0, g.timeLeft - 5);
        g.message = 'CONEXIÓN INTERRUMPIDA: -5 SEGUNDOS';
        g.messageTime = 2;

        if (g.timeLeft <= 0) {
            g.over = true;
            g.won = false;
            g.message = 'EL NÚCLEO HA PERDIDO ENERGÍA';
        }
    }
}

function updateNucleoGame() {
    const g = nucleoGame;
    if (!g) return;

    const now = performance.now();
    const delta = Math.min((now - g.lastTick) / 1000, 0.1);
    g.lastTick = now;

    // Animación de la energía recorriendo el circuito.
    if (g.animating) {
        g.animationTime += delta;

        const duration = g.animationPath.length * 0.18 + 0.8;

        if (g.animationTime >= duration) {
            g.animating = false;
            g.over = true;
            g.message = '¡NÚCLEO WARP RESTAURADO!';
            playSound(soundReparaNucleoLogrado);
        }

        return;
    }

    if (g.over) return;

    g.timeLeft = Math.max(0, g.timeLeft - delta);
    g.messageTime = Math.max(0, g.messageTime - delta);

    if (g.timeLeft <= 0) {
        g.over = true;
        g.won = false;
        g.message = 'EL NÚCLEO HA PERDIDO ENERGÍA';
        playSound(soundReparaNucleoExplota);
    }
}

function nucleoLcarsPanel(x, y, w, h, color, radius = 12) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
}


function drawNucleoLcars(w, h, g) {
    const t = performance.now() / 1000;
    const pulse = 0.7 + Math.sin(t * 3) * 0.2;

    const orange = '#e99b48';
    const peach = '#c8753d';
    const purple = '#c49ade';
    const cyan = '#70eaff';
    const dark = '#101421';
    const pale = '#e5d8f2';

    // Fondo de consola.
    ctx.fillStyle = '#070914';
    ctx.fillRect(0, 0, w, h);

    // Retícula discreta.
    ctx.save();
    ctx.strokeStyle = 'rgba(90, 130, 180, 0.09)';
    ctx.lineWidth = 1;

    for (let x = 0; x < w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }

    for (let y = 0; y < h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // Marco exterior LCARS.
    nucleoLcarsPanel(44, 10, w - 88, 42, orange, 8);
    nucleoLcarsPanel(44, 54, 100, 18, peach, 4);
    nucleoLcarsPanel(151, 54, 120, 18, purple, 4);
    nucleoLcarsPanel(w - 270, 54, 100, 18, purple, 4);
    nucleoLcarsPanel(w - 165, 54, 120, 18, peach, 4);

    // Función para crear paneles con cabecera y contenido.
    function panel(x, y, width, height, title, color) {
        nucleoLcarsPanel(x, y, width, height, dark, 10);
        nucleoLcarsPanel(x, y, width, 24, color, 10);

        // Ocultar la parte inferior redondeada de la cabecera.
        ctx.fillStyle = color;
        ctx.fillRect(x, y + 12, width, 12);

        text(title, x + 110, y + 17, 12, '#171421', true, GAME_FONTDS9);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 0.75, y + 0.75, width - 1.5, height - 1.5);
    }

    // Medidor horizontal.
    function meter(x, y, width, fraction, color) {
        nucleoLcarsPanel(x, y, width, 8, '#303348', 4);
        nucleoLcarsPanel(
            x, y, width * Math.max(0, Math.min(1, fraction)),
            8, color, 4
        );
    }

    // PANEL IZQUIERDO: ingeniería.
    const lx = 48;
    const lw = 220;

    panel(lx, 75, lw, 112, 'ENGINEERING', orange);

    text('WARP CORE', lx + 110, 119, 15, pale, true, GAME_FONTDS9);
    text('SYSTEM STATUS', lx + 110, 140, 11, purple, true, GAME_FONTDS9);

    nucleoLcarsPanel(lx + 82, 151, 10, 10, cyan, 4);
    text('ONLINE', lx + 120, 160, 11, cyan, true, GAME_FONTDS9);

    panel(lx, 197, lw, 112, 'EPS POWER FLOW', purple);

    text('ENERGY RESERVE', lx + 110, 241, 15, pale, true, GAME_FONTDS9);
    meter(lx + 12, 251, lw - 24, g.timeLeft / 60, cyan);
    text(`${Math.ceil(g.timeLeft)} SECONDS`, lx + 110, 280, 14,
        g.timeLeft < 15 ? '#ff6868' : orange, true, GAME_FONTDS9);

    panel(lx, 319, lw, 112, 'DIAGNOSTICS', orange);

    text('FAILED CONNECTIONS', lx + 110, 363, 15, pale, true, GAME_FONTDS9);
    text(String(g.mistakes).padStart(2, '0'), lx + 50, 391, 24,
        g.mistakes > 0 ? '#ff6868' : cyan, true, GAME_FONTDS9);

    text('CIRCUIT CHECK', lx + 110, 389, 11, purple, true, GAME_FONTDS9);
    meter(lx + 72, 398, lw - 84, g.mistakes === 0 ? 1 : 0.35,
        g.mistakes === 0 ? cyan : orange);

    // PANEL DERECHO: estado del núcleo.
    const rx = w - 48 - 220;
    const rw = 220;

    panel(rx, 75, rw, 112, 'CORE STATUS', purple);

    text('WARP REACTOR', rx + 110, 119, 14, pale, true, GAME_FONTDS9);
    text('NCC - ENGINEERING', rx + 110, 140, 10, orange, true, GAME_FONTDS9);

    ctx.globalAlpha = pulse;
    nucleoLcarsPanel(rx + 65, 151, 12, 10, cyan, 4);
    ctx.globalAlpha = 1;

    text('NOMINAL', rx + 110, 160, 11, cyan, true, GAME_FONTDS9);

    panel(rx, 197, rw, 112, 'SCORE DATABASE', orange);

    text('CURRENT SCORE', rx + 110, 241, 11, pale, true, GAME_FONTDS9);
    text(String(g.score).padStart(5, '0'), rx + 110, 276, 27, '#65ffb4', true, GAME_FONTDS9);

    panel(rx, 319, rw, 112, 'POWER DISTRIBUTION', purple);

    text('PRIMARY CONDUIT', rx + 110, 363, 11, pale, true, GAME_FONTDS9);

    for (let i = 0; i < 5; i++) {
        nucleoLcarsPanel(
            rx + 50 + i * 25, 378, 19, 10,
            i < 3 ? orange : '#393348', 4
        );
    }

    text('EPS CHANNELS', rx + 110, 408, 11, cyan, true, GAME_FONTDS9);

    // Banda inferior.
    nucleoLcarsPanel(44, h - 140, 95, 95, orange, 6);
    nucleoLcarsPanel(145, h - 140, 55, 75, peach, 6);
    nucleoLcarsPanel(205, h - 140, 65, 35, purple, 6);
    nucleoLcarsPanel(w - 164, h - 140, 120, 95, orange, 6);
    nucleoLcarsPanel(44, h - 40, w - 48, 30, purple, 5);

    ctx.restore();
}



function drawNucleoLcarsOld2(w, h) {
    const t = performance.now() / 1000;
    const pulse = 0.65 + Math.sin(t * 2.5) * 0.25;

    // Fondo oscuro de la consola.
    ctx.fillStyle = '#070914';
    ctx.fillRect(0, 0, w, h);

    // Retícula técnica muy discreta.
    ctx.save();
    ctx.strokeStyle = 'rgba(90, 130, 180, 0.10)';
    ctx.lineWidth = 1;

    for (let x = 0; x < w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }

    for (let y = 0; y < h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // =====================================================
    // LCARS SUPERIOR: banda principal y módulos asimétricos
    // =====================================================

    nucleoLcarsPanel(24, 18, w - 48, 18, '#e99b48', 9);
    nucleoLcarsPanel(24, 42, 125, 10, '#c8753d', 5);
    nucleoLcarsPanel(158, 42, 48, 10, '#c49ade', 5);

    nucleoLcarsPanel(w - 206, 42, 80, 10, '#c49ade', 5);
    nucleoLcarsPanel(w - 117, 42, 93, 10, '#e99b48', 5);

    // =====================================================
    // MÓDULO IZQUIERDO: bloques LCARS escalonados
    // =====================================================

    nucleoLcarsPanel(24, 62, 17, 84, '#e99b48', 8);
    nucleoLcarsPanel(24, 153, 17, 52, '#c49ade', 8);
    nucleoLcarsPanel(24, 212, 17, 76, '#e99b48', 8);
    nucleoLcarsPanel(24, 295, 17, 54, '#c49ade', 8);

    // Etiquetas y datos del módulo.
    text('ENGINEERING', 53, 76, 11, '#e99b48', true, GAME_FONTDS9);
    text('WARP SYSTEM', 53, 94, 11, '#c49ade', true, GAME_FONTDS9);

    nucleoLcarsPanel(53, 104, 94, 5, '#c8753d', 2);
    nucleoLcarsPanel(53, 114, 72, 5, '#c49ade', 2);
    nucleoLcarsPanel(53, 124, 84, 5, '#e99b48', 2);

    // Indicadores.
    for (let i = 0; i < 5; i++) {
        nucleoLcarsPanel(
            53 + i * 18, 166, 12, 8,
            i < 3 ? '#e99b48' : '#644d75', 3
        );
    }

    text('EPS FLOW', 53, 194, 11, '#c49ade', true, GAME_FONTDS9);

    // =====================================================
    // MÓDULO DERECHO: diagnóstico del núcleo
    // =====================================================

    nucleoLcarsPanel(w - 41, 62, 17, 66, '#c49ade', 8);
    nucleoLcarsPanel(w - 41, 135, 17, 86, '#e99b48', 8);
    nucleoLcarsPanel(w - 41, 228, 17, 53, '#c49ade', 8);
    nucleoLcarsPanel(w - 41, 288, 17, 72, '#e99b48', 8);

    text('CORE', w - 58, 76, 11, '#c49ade', true, GAME_FONTDS9);
    text('STATUS', w - 58, 94, 11, '#e99b48', true, GAME_FONTDS9);

    nucleoLcarsPanel(w - 150, 105, 92, 5, '#c49ade', 2);
    nucleoLcarsPanel(w - 135, 115, 77, 5, '#e99b48', 2);

    // Indicador de energía animado.
    ctx.globalAlpha = pulse;

    nucleoLcarsPanel(w - 145, 153, 20, 9, '#70eaff', 4);
    nucleoLcarsPanel(w - 119, 153, 20, 9, '#70eaff', 4);
    nucleoLcarsPanel(w - 93, 153, 20, 9, '#70eaff', 4);

    ctx.globalAlpha = 1;

    text('SYSTEM ONLINE', w - 104, 204, 10, '#70eaff', true, GAME_FONTDS9);

    // =====================================================
    // BANDA INFERIOR LCARS
    // =====================================================

    nucleoLcarsPanel(24, h - 39, 95, 13, '#e99b48', 6);
    nucleoLcarsPanel(125, h - 39, 48, 13, '#c8753d', 6);
    nucleoLcarsPanel(179, h - 39, 15, 13, '#c49ade', 5);

    nucleoLcarsPanel(w - 164, h - 39, 140, 13, '#e99b48', 6);
    nucleoLcarsPanel(24, h - 20, w - 48, 10, '#c49ade', 5);

    // Línea de separación interior.
    ctx.strokeStyle = 'rgba(196, 154, 222, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(48, h - 49);
    ctx.lineTo(w - 48, h - 49);
    ctx.stroke();

    ctx.restore();
}


function drawNucleoLcarsOld(w, h) {
    const t = performance.now() / 1000;

    // Fondo oscuro de consola.
    ctx.fillStyle = '#070914';
    ctx.fillRect(0, 0, w, h);

    // Líneas técnicas de fondo.
    ctx.save();
    ctx.strokeStyle = 'rgba(91, 133, 190, 0.13)';
    ctx.lineWidth = 1;

    for (let x = 0; x < w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }

    for (let y = 0; y < h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // Marco LCARS superior.
    nucleoLcarsPanel(18, 12, w - 36, 12, '#d88b35', 6);
    nucleoLcarsPanel(18, 30, 105, 9, '#c66b35', 4);
    nucleoLcarsPanel(131, 30, 48, 9, '#bd91df', 4);
    nucleoLcarsPanel(w - 185, 30, 75, 9, '#bd91df', 4);
    nucleoLcarsPanel(w - 102, 30, 84, 9, '#d88b35', 4);

    // Panel lateral izquierdo.
    nucleoLcarsPanel(18, 55, 14, 90, '#d88b35', 7);
    nucleoLcarsPanel(18, 153, 14, 55, '#bd91df', 7);
    nucleoLcarsPanel(18, 216, 14, 80, '#d88b35', 7);
    nucleoLcarsPanel(18, 304, 14, 65, '#bd91df', 7);
    nucleoLcarsPanel(18, 377, 14, 65, '#d88b35', 7);

    // Panel lateral derecho.
    nucleoLcarsPanel(w - 32, 55, 14, 75, '#bd91df', 7);
    nucleoLcarsPanel(w - 32, 138, 14, 100, '#d88b35', 7);
    nucleoLcarsPanel(w - 32, 246, 14, 55, '#bd91df', 7);
    nucleoLcarsPanel(w - 32, 309, 14, 95, '#d88b35', 7);

    // Indicadores luminosos animados.
    const pulse = 0.55 + Math.sin(t * 3) * 0.25;

    ctx.globalAlpha = pulse;
    nucleoLcarsPanel(40, 104, 8, 8, '#70eaff', 3);
    nucleoLcarsPanel(40, 120, 8, 8, '#70eaff', 3);
    nucleoLcarsPanel(w - 48, 180, 8, 8, '#70eaff', 3);
    nucleoLcarsPanel(w - 48, 196, 8, 8, '#70eaff', 3);
    ctx.globalAlpha = 1;

    // Etiquetas técnicas de los laterales.
    text('ENG', 65, 75, 12, '#d88b35', true);
    text('WARP', 65, 93, 12, '#bd91df', true);
    text('EPS', w - 65, 75, 12, '#bd91df', true);
    text('FLOW', w - 65, 93, 12, '#d88b35', true);

    // Marco inferior.
    nucleoLcarsPanel(18, h - 25, w - 36, 10, '#bd91df', 5);
    nucleoLcarsPanel(18, h - 43, 95, 10, '#d88b35', 5);
    nucleoLcarsPanel(121, h - 43, 48, 10, '#c66b35', 5);
    nucleoLcarsPanel(w - 160, h - 43, 142, 10, '#d88b35', 5);

    ctx.restore();
}

function drawNucleoGame() {
    const g = nucleoGame;
    if (!g) return;

    const w = canvas.width;
    const h = canvas.height;
    /*
    const cell = NUCLEO_CELL;
    const left = (w - cell * NUCLEO_N) / 2;
    const top = 150;

    ctx.fillStyle = '#030914';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#124b68';
    ctx.lineWidth = 2;

    for (let y = 20; y < h; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    */

    const cell = NUCLEO_CELL;
    const left = (w - cell * NUCLEO_N) / 2;
    const top = 150;
    drawNucleoLcars(w, h, g);

    text('¡REPARA EL NÚCLEO WARP!', w / 2, 45, 40, '#53eaff', false, GAME_FONTDS9);
    text('GIRA LAS PIEZAS PARA', w / 2, 83, 26, '#b9eaff', false, GAME_FONTDS9);
    text('CONECTAR LA FUENTE CON EL NÚCLEO', w / 2, 113, 26, '#b9eaff', false, GAME_FONTDS9);
    //text(`TIEMPO: ${Math.ceil(g.timeLeft)} s`, 175, 120, 24, g.timeLeft < 15 ? '#ff5353' : '#ffdc72', false, GAME_FONTKLINGON);
    //text(`PUNTOS: ${g.score}`, w - 170, 120, 24, '#65ffb4', false, GAME_FONTKLINGON);

    for (let y = 0; y < NUCLEO_N; y++) {
        for (let x = 0; x < NUCLEO_N; x++) {
            const px = left + x * cell;
            const py = top + y * cell;
            const tile = g.grid[y][x];
            const mask = nucleoRotateMask(tile.mask, tile.rotation);
            const selected = x === g.cursorX && y === g.cursorY;
            const isStart = x === g.start.x && y === g.start.y;
            const isDestination =
                x === g.destination.x && y === g.destination.y;

            ctx.fillStyle = selected ? '#173c50' : '#091c2a';
            ctx.fillRect(px + 3, py + 3, cell - 6, cell - 6);

            ctx.strokeStyle = selected ? '#ffe66d' : '#236b86';
            ctx.lineWidth = selected ? 3 : 1;
            ctx.strokeRect(px + 3, py + 3, cell - 6, cell - 6);

            const cx = px + cell / 2;
            const cy = py + cell / 2;

            ctx.strokeStyle = '#4ce9ff';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.beginPath();

            if (mask & 1) {
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx, cy - 23);
            }
            if (mask & 2) {
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + 23, cy);
            }
            if (mask & 4) {
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx, cy + 23);
            }
            if (mask & 8) {
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx - 23, cy);
            }

            ctx.stroke();

            ctx.fillStyle = '#d9fbff';
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();

            if (isStart || isDestination) {
                ctx.strokeStyle = isStart ? '#65ffb4' : '#ffdc72';
                ctx.lineWidth = 3;
                ctx.strokeRect(px + 7, py + 7, cell - 14, cell - 14);
            }
        }
    }

    // ------------------------------------------------------------
    // ANIMACIÓN: la energía recorre la ruta hasta el núcleo.
    // ------------------------------------------------------------
    if (g.animating || (g.over && g.won)) {
        const elapsed = g.animationTime;
        const litCount = Math.min(
            g.animationPath.length,
            Math.floor(elapsed / 0.18) + 1
        );

        ctx.save();

        for (let i = 0; i < litCount; i++) {
            const point = g.animationPath[i];
            const px = left + point.x * cell;
            const py = top + point.y * cell;
            const cx = px + cell / 2;
            const cy = py + cell / 2;

            // Halo de energía alrededor de cada pieza activada.
            const pulse = 0.65 + Math.sin(elapsed * 10 - i) * 0.25;

            ctx.globalAlpha = Math.max(0.3, pulse);
            ctx.fillStyle = '#00ffc8';
            ctx.shadowColor = '#00fff0';
            ctx.shadowBlur = 22;

            ctx.fillRect(px + 7, py + 7, cell - 14, cell - 14);

            // Núcleo luminoso en el centro de la pieza.
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#eaffff';
            ctx.beginPath();
            ctx.arc(cx, cy, 7 + pulse * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Destello cuando la energía alcanza el destino.
        if (elapsed >= (g.path.length - 1) * 0.18) {
            const px = left + g.destination.x * cell + cell / 2;
            const py = top + g.destination.y * cell + cell / 2;
            const radius = 15 + Math.abs(Math.sin(elapsed * 7)) * 16;

            ctx.globalAlpha = 0.85;
            ctx.strokeStyle = '#65ffb4';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#65ffb4';
            ctx.shadowBlur = 28;

            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    // Las etiquetas siguen la posición aleatoria de los extremos.
    const startX = left + g.start.x * cell + cell / 2;
    const startY = top + g.start.y * cell + cell / 2;
    const destX = left + g.destination.x * cell + cell / 2;
    const destY = top + g.destination.y * cell + cell / 2;

    text('FUENTE', startX, startY - 31, 13, '#65ffb4', false);
    text('NÚCLEO', destX, destY + 39, 13, '#ffdc72', false);

    if (g.messageTime > 0 && !g.over) {
        text(g.message, w / 2, 525, 22, '#ffe66d', true);
    }

    text('FLECHAS/WASD: MOVER   ESPACIO: GIRAR   ENTER: PROBAR   R: REINICIAR   ESC: SALIR', w / 2, 560, 22, '#d7e9f3', false, GAME_FONTDS9 );

    if (g.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.84)';
        ctx.fillRect(0, 0, w, h);

        text(g.won ? '¡NÚCLEO WARP RESTAURADO!' : 'FALLO CRÍTICO', w / 2, h / 2 - 40, 42, g.won ? '#65ffb4' : '#ff5353', false,GAME_FONTKLINGON);

        text( `Puntuación: ${g.score}     Errores: ${g.mistakes}`, w / 2, h / 2 + 5, 26, '#ffffff', false, GAME_FONTDS9);

        text('ENTER / ESPACIO: VOLVER A JUGAR     ESC: SELECTOR DE MODOS', w / 2, h / 2 + 48, 22, '#ffe66d', false, GAME_FONTDS9);
    }
}
