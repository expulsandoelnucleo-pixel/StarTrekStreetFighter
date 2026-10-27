
'use strict';

// ============================================================
// ¡REPARA EL NÚCLEO WARP!
// Puzle de circuitos aleatorios.
// ============================================================

let nucleoGame = null;

const NUCLEO_N = 5;
const NUCLEO_CELL = 72;

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
        score: 0,
        mistakes: 0,
        over: false,
        won: false,
        lastTick: performance.now(),
        message: 'Conecta la FUENTE con el NÚCLEO',
        messageTime: 3
    };

    gameState = 'NUCLEO_GAME';
}

function handleNucleoKey(key) {
    const g = nucleoGame;
    if (!g) return;

    const k = key.toLowerCase();

    if (key === 'Escape' || k === 'x') {
        gameState = 'MODE_SELECT';
        return;
    }

    if (g.over) {
        if (k === 'r' || key === ' ' || key === 'Enter') {
            beginNucleoGame();
        }
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
    if (!g || g.over) return;

    const visited = Array.from(
        { length: NUCLEO_N },
        () => Array(NUCLEO_N).fill(false)
    );

    const queue = [{ x: g.start.x, y: g.start.y }];
    visited[g.start.y][g.start.x] = true;

    let reached = false;

    while (queue.length > 0) {
        const current = queue.shift();

        if (
            current.x === g.destination.x &&
            current.y === g.destination.y
        ) {
            reached = true;
            break;
        }

        const currentTile =
            g.grid[current.y][current.x];

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

            // La pieza vecina debe conectar en sentido contrario.
            if (!(nextMask & dir.opposite)) continue;

            visited[ny][nx] = true;
            queue.push({ x: nx, y: ny });
        }
    }

    if (reached) {
        g.score += 100 + Math.ceil(g.timeLeft) * 5;
        g.won = true;
        g.over = true;
        g.message = '¡NÚCLEO WARP RESTAURADO!';
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
    if (!g || g.over) return;

    const now = performance.now();
    const delta = Math.min((now - g.lastTick) / 1000, 0.1);

    g.lastTick = now;
    g.timeLeft = Math.max(0, g.timeLeft - delta);
    g.messageTime = Math.max(0, g.messageTime - delta);

    if (g.timeLeft <= 0) {
        g.over = true;
        g.won = false;
        g.message = 'EL NÚCLEO HA PERDIDO ENERGÍA';
    }
}

function drawNucleoGame() {
    const g = nucleoGame;
    if (!g) return;

    const w = canvas.width;
    const h = canvas.height;
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

    text('¡REPARA EL NÚCLEO WARP!', w / 2, 48, 34, '#53eaff', true);
    text(
        'GIRA LAS PIEZAS PARA CONECTAR LA FUENTE CON EL NÚCLEO',
        w / 2, 83, 16, '#b9eaff', false
    );

    text(
        `TIEMPO: ${Math.ceil(g.timeLeft)} s`,
        175, 120, 22,
        g.timeLeft < 15 ? '#ff5353' : '#ffdc72',
        true
    );

    text(`PUNTOS: ${g.score}`, w - 170, 120, 22, '#65ffb4', true);

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

    // Las etiquetas siguen la posición aleatoria de los extremos.
    const startX = left + g.start.x * cell + cell / 2;
    const startY = top + g.start.y * cell + cell / 2;
    const destX = left + g.destination.x * cell + cell / 2;
    const destY = top + g.destination.y * cell + cell / 2;

    text('FUENTE', startX, startY - 31, 13, '#65ffb4', true);
    text('NÚCLEO', destX, destY + 39, 13, '#ffdc72', true);

    if (g.messageTime > 0 && !g.over) {
        text(g.message, w / 2, 525, 18, '#ffe66d', true);
    }

    text(
        'FLECHAS/WASD: MOVER   ESPACIO: GIRAR   ENTER: PROBAR   R: REINICIAR   ESC: SALIR',
        w / 2, 555, 13, '#d7e9f3', false
    );

    if (g.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.84)';
        ctx.fillRect(0, 0, w, h);

        text(
            g.won ? '¡NÚCLEO WARP RESTAURADO!' : 'FALLO CRÍTICO',
            w / 2, h / 2 - 40, 36,
            g.won ? '#65ffb4' : '#ff5353',
            true
        );

        text(
            `Puntuación: ${g.score}     Errores: ${g.mistakes}`,
            w / 2, h / 2 + 5, 22, '#ffffff', false
        );

        text(
            'ENTER / ESPACIO: VOLVER A JUGAR     ESC: SELECTOR DE MODOS',
            w / 2, h / 2 + 48, 16, '#ffe66d', false
        );
    }
}
