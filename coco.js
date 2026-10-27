'use strict';

// Minijuego ComeCocos independiente. No depende del sistema de combate.
const cocoTileSize = 32;
const cocoCols = 32;
const cocoRows = 18;
const playerSpeed = 18;
const cocoSpeed = 250;
const cocoPlayerImage = loadImage('assets/player_coco.png');
const cocoGhostImage = loadImage('assets/fantasma_coco.png');
let cocoGame = null;
const cocoPressedKeys = Object.create(null);

function createCocoMazeOld() {
    const maze = Array.from({ length: cocoRows }, (_, y) =>
        Array.from({ length: cocoCols }, (_, x) =>
            x === 0 || y === 0 ||
                x === cocoCols - 1 || y === cocoRows - 1 ? 1 : 0
        )
    );

    // Paredes horizontales con varias aberturas.
    const horizontalWalls = [
        { y: 3, gaps: [3, 8, 14, 21, 27] },
        { y: 6, gaps: [5, 11, 18, 25] },
        { y: 9, gaps: [3, 9, 16, 23, 28] },
        { y: 12, gaps: [6, 13, 20, 26] },
        { y: 15, gaps: [3, 10, 17, 24, 28] }
    ];

    for (const wall of horizontalWalls) {
        for (let x = 1; x < cocoCols - 1; x++) {
            if (!wall.gaps.includes(x)) {
                maze[wall.y][x] = 1;
            }
        }
    }

    // Paredes verticales para crear bloques, callejones y cruces.
    const verticalWalls = [
        { x: 4, from: 2, to: 5, gaps: [4] },
        { x: 8, from: 4, to: 8, gaps: [5, 7] },
        { x: 13, from: 2, to: 5, gaps: [3] },
        { x: 18, from: 4, to: 8, gaps: [6] },
        { x: 23, from: 2, to: 5, gaps: [4] },
        { x: 27, from: 4, to: 8, gaps: [5, 7] },

        { x: 5, from: 7, to: 11, gaps: [8, 10] },
        { x: 10, from: 10, to: 14, gaps: [11, 13] },
        { x: 15, from: 7, to: 11, gaps: [9] },
        { x: 20, from: 10, to: 14, gaps: [12] },
        { x: 25, from: 7, to: 11, gaps: [8, 10] },

        { x: 4, from: 13, to: 16, gaps: [14] },
        { x: 8, from: 13, to: 16, gaps: [15] },
        { x: 13, from: 13, to: 16, gaps: [14] },
        { x: 18, from: 13, to: 16, gaps: [15] },
        { x: 23, from: 13, to: 16, gaps: [14] },
        { x: 27, from: 13, to: 16, gaps: [15] }
    ];

    for (const wall of verticalWalls) {
        for (let y = wall.from; y <= wall.to; y++) {
            if (!wall.gaps.includes(y)) {
                maze[y][wall.x] = 1;
            }
        }
    }

    // Garantizar que las posiciones iniciales estén libres.
    maze[1][1] = 0;
    maze[1][2] = 0;
    maze[1][cocoCols - 2] = 0;
    maze[cocoRows - 2][1] = 0;
    maze[cocoRows - 2][cocoCols - 2] = 0;

    return maze;
}


function cocoText(str, x, y, size = 16, color = '#fff', bold = false, align = 'center', font = GAME_FONT) {
    ctx.fillStyle = color;
    ctx.font = `${bold ? 'bold ' : ''}${size}px ${font}`;
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
}

// Dibuja un texto animado interpolando su tamaño entre initialSize y finalSize a lo largo de 'duration' fotogramas.
// Si duration es 0 o no se pasa, o el tiempo transcurrido es mayor que la duración, se usa finalSize.
function cocoTextWithAnimation(str, x, y, initialSize, finalSize, durationFrames, elapsedFrames, color = '#fff', bold = false, font = GAME_FONT) {
    let currentSize = finalSize;
    if (durationFrames > 0) {
        const progress = Math.min(1, Math.max(0, elapsedFrames / durationFrames));
        // Interpolación lineal entre el tamaño inicial y el final
        currentSize = initialSize + (finalSize - initialSize) * progress;
    }

    ctx.save();
    cocoText(str, x, y, Math.round(currentSize), color, bold, 'center', font);
    ctx.restore();
}

function createCocoMaze() {
    // Empezamos con todas las casillas como paredes.
    const maze = Array.from({ length: cocoRows }, () =>
        Array(cocoCols).fill(1)
    );

    // Generador aleatorio con semilla fija para que el mapa
    // sea siempre el mismo.
    let seed = 1701;

    const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };

    // Crear una red de pasillos conectados.
    const start = { x: 1, y: 1 };
    const stack = [start];

    maze[start.y][start.x] = 0;

    // Abrimos caminos avanzando de dos en dos casillas.
    // La casilla intermedia se convierte en el pasillo.
    while (stack.length > 0) {
        const current = stack[stack.length - 1];

        const neighbours = [
            { x: current.x + 2, y: current.y },
            { x: current.x - 2, y: current.y },
            { x: current.x, y: current.y + 2 },
            { x: current.x, y: current.y - 2 }
        ].filter(n =>
            n.x >= 1 &&
            n.x <= cocoCols - 3 &&
            n.y >= 1 &&
            n.y <= cocoRows - 3 &&
            maze[n.y][n.x] === 1
        );

        if (neighbours.length === 0) {
            stack.pop();
            continue;
        }

        const next =
            neighbours[Math.floor(random() * neighbours.length)];

        // Abrir la pared intermedia.
        maze[(current.y + next.y) / 2]
        [(current.x + next.x) / 2] = 0;

        // Abrir la nueva casilla.
        maze[next.y][next.x] = 0;

        stack.push(next);
    }

    // Abrir paredes adicionales para crear cruces,
    // circuitos y caminos alternativos.
    for (let y = 1; y < cocoRows - 1; y++) {
        for (let x = 1; x < cocoCols - 1; x++) {
            if (maze[y][x] !== 1) continue;

            const joinsHorizontal =
                x % 2 === 0 &&
                y % 2 === 1 &&
                maze[y][x - 1] === 0 &&
                maze[y][x + 1] === 0;

            const joinsVertical =
                y % 2 === 0 &&
                x % 2 === 1 &&
                maze[y - 1][x] === 0 &&
                maze[y + 1][x] === 0;

            if (
                (joinsHorizontal || joinsVertical) &&
                random() < 0.32
            ) {
                maze[y][x] = 0;
            }
        }
    }

    // Abrir algunos corredores más largos para que el recorrido
    // no sea una sucesión interminable de pasillos cortos.
    const extraCorridors = [
        [4, 3], [10, 3], [16, 3], [22, 3], [28, 3],
        [4, 7], [12, 7], [20, 7], [28, 7],
        [6, 11], [14, 11], [22, 11],
        [4, 15], [12, 15], [20, 15], [28, 15]
    ];

    for (const [x, y] of extraCorridors) {
        if (
            x > 0 && x < cocoCols - 1 &&
            y > 0 && y < cocoRows - 1
        ) {
            maze[y][x] = 0;
        }
    }

    // Asegurar que las posiciones iniciales estén libres.
    const startingPositions = [
        [1, 1],
        [cocoCols - 3, 1],
        [cocoCols - 3, cocoRows - 3],
        [1, cocoRows - 3]
    ];

    for (const [x, y] of startingPositions) {
        maze[y][x] = 0;
    }

    // Conectar las posiciones iniciales con sus casillas vecinas.
    maze[1][2] = 0;
    maze[1][cocoCols - 3] = 0;
    maze[cocoRows - 3][cocoCols - 3] = 0;
    maze[cocoRows - 3][1] = 0;

    return maze;
}


function beginCocoGame() {
    const maze = createCocoMaze();
    const dots = new Set();
    for (let y = 1; y < cocoRows - 1; y++) {
        for (let x = 1; x < cocoCols - 1; x++) {
            if (maze[y][x] === 0 && !(x === 1 && y === 1)) dots.add(`${x},${y}`);
        }
    }
    cocoGame = {
        maze, dots, score: 0, lives: 3, frame: 0, over: false, won: false, finSoundPlayed: false,
        player: { x: 1, y: 1, dirX: 0, dirY: 0, nextX: 0, nextY: 0, moveTimer: 0 },
        ghosts: [
            { x: cocoCols - 2, y: 1, moveTimer: 0, color: '#ff5468' },
            { x: cocoCols - 2, y: cocoRows - 4, moveTimer: 8, color: '#54e8ff' },
            { x: 1, y: cocoRows - 2, moveTimer: 16, color: '#ff9af4' }
        ]
    };
    for (const key in cocoPressedKeys) delete cocoPressedKeys[key];
    gameState = 'COCO_GAME';
}

function cocoIsOpen(x, y) {
    return !!cocoGame && y >= 0 && y < cocoRows && x >= 0 && x < cocoCols && cocoGame.maze[y][x] === 0;
}

function handleCocoKey(key) {
    const k = key.toLowerCase();
    if (key === 'Escape' || k === 'x') {
        for (const pressed in cocoPressedKeys) delete cocoPressedKeys[pressed];
        gameState = 'MODE_SELECT';
        return;
    }
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        cocoPressedKeys[k] = true;
        const dirs = {
            arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1],
            arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0]
        };
        const dir = dirs[k];
        if (dir && cocoGame) {
            cocoGame.player.nextX = dir[0];
            cocoGame.player.nextY = dir[1];
        }
    }
}

function handleCocoKeyUp(key) {
    delete cocoPressedKeys[key.toLowerCase()];
}

function updateCocoGame() {
    const g = cocoGame;
    if (!g || g.over) return;
    g.frame++;
    const p = g.player;
    if (p.moveTimer > 0) p.moveTimer--;
    if (p.moveTimer === 0) {
        const nx = p.x + p.nextX, ny = p.y + p.nextY;
        if (cocoIsOpen(nx, ny)) {
            p.x = nx; p.y = ny; p.dirX = p.nextX; p.dirY = p.nextY;
        } else {
            const forwardX = p.x + p.dirX, forwardY = p.y + p.dirY;
            if (cocoIsOpen(forwardX, forwardY)) { p.x = forwardX; p.y = forwardY; }
        }
        p.moveTimer = playerSpeed;
        const dot = `${p.x},${p.y}`;
        if (g.dots.delete(dot)) {
            g.score += 10;
            playSound(soundComeCocosComePunto);
        }
        if (g.dots.size === 0) { g.over = true; g.won = true; g.overFrame = frameCount; }
    }
    for (const ghost of g.ghosts) {
        if (ghost.moveTimer > 0) { ghost.moveTimer--; continue; }
        const options = [[1,0],[-1,0],[0,1],[0,-1]]
            .map(([dx,dy]) => ({ x: ghost.x + dx, y: ghost.y + dy, dx, dy }))
            .filter(n => cocoIsOpen(n.x, n.y));
        if (options.length) {
            options.sort((a,b) => (Math.abs(a.x-p.x)+Math.abs(a.y-p.y)) - (Math.abs(b.x-p.x)+Math.abs(b.y-p.y)));
            // A veces el fantasma toma una ruta aleatoria para no resultar infalible.
            const choice = Math.random() < 0.72 ? options[0] : options[Math.floor(Math.random()*options.length)];
            ghost.x = choice.x; ghost.y = choice.y;
        }
        ghost.moveTimer = cocoSpeed;
        if (ghost.x === p.x && ghost.y === p.y) {
            playSound(soundComeCocosComido);
            g.lives--;
            if (g.lives <= 0) { g.over = true; g.won = false; g.overFrame = frameCount; }
            else {
                p.x = 1; p.y = 1; p.dirX = 0; p.dirY = 0; p.nextX = 0; p.nextY = 0;
                //g.ghosts.forEach((gh, i) => {
                //    gh.x = i === 0 ? cocoCols - 2 : i === 1 ? cocoCols - 2 : 1;
                //    gh.y = i === 1 ? cocoRows - 2 : 1;
                //});
            }
            break;
        }
    }
}

function drawCocoGame() {
    const g = cocoGame;
    const w = canvas.width, h = canvas.height;
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#030619'); bg.addColorStop(1, '#071d3d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    if (!g) return;
    for (let y = 0; y < cocoRows; y++) for (let x = 0; x < cocoCols; x++) {
        const px = x*cocoTileSize, py = y*cocoTileSize;
        if (g.maze[y][x] === 1) {
            ctx.fillStyle = '#082d71'; ctx.fillRect(px+1, py+1, cocoTileSize-2, cocoTileSize-2);
            ctx.strokeStyle = '#1b83d8'; ctx.lineWidth = 1; ctx.strokeRect(px+4, py+4, cocoTileSize-8, cocoTileSize-8);
        } else if (g.dots.has(`${x},${y}`)) {
            ctx.fillStyle = '#ffeaa0'; ctx.beginPath(); ctx.arc(px+16, py+16, 3, 0, Math.PI*2); ctx.fill();
        }
    }
    const p = g.player, px = p.x*cocoTileSize, py = p.y*cocoTileSize;
    if (cocoPlayerImage.complete && cocoPlayerImage.naturalWidth > 0) {
        ctx.drawImage(cocoPlayerImage, px+3, py+3, 26, 26);
    } else {
        ctx.fillStyle = '#ffdf35'; ctx.beginPath(); ctx.arc(px+16, py+16, 12, 0.2, Math.PI*1.8); ctx.lineTo(px+16, py+16); ctx.closePath(); ctx.fill();
    }
    for (const ghost of g.ghosts) {
        const gx = ghost.x*cocoTileSize, gy = ghost.y*cocoTileSize;
        if (cocoGhostImage.complete && cocoGhostImage.naturalWidth > 0) {
            //ctx.drawImage(cocoGhostImage, gx + 3, gy + 3, 26, 26);
            // Crear una copia temporal del fantasma con su color.
            const ghostCanvas = document.createElement('canvas');
            ghostCanvas.width = 26;
            ghostCanvas.height = 26;

            const ghostCtx = ghostCanvas.getContext('2d');

            // Dibujar la imagen original respetando su transparencia.
            ghostCtx.drawImage(cocoGhostImage, 0, 0, 26, 26);

            // Aplicar el tinte sobre la imagen, conservando sus detalles.
            ghostCtx.globalCompositeOperation = 'source-atop';
            ghostCtx.globalAlpha = 0.45; // Intensidad del tinte: 45 %
            ghostCtx.fillStyle = ghost.color;
            ghostCtx.fillRect(0, 0, 26, 26);

            // Restaurar los valores.
            ghostCtx.globalAlpha = 1;
            ghostCtx.globalCompositeOperation = 'source-over';

            // Dibujar el fantasma coloreado en el tablero.
            ctx.drawImage(ghostCanvas, gx + 3, gy + 3);
        }
        else {
            ctx.fillStyle = ghost.color; ctx.beginPath(); ctx.arc(gx+16, gy+14, 12, Math.PI, 0); ctx.lineTo(gx+28,gy+27); ctx.lineTo(gx+22,gy+23); ctx.lineTo(gx+16,gy+27); ctx.lineTo(gx+10,gy+23); ctx.lineTo(gx+4,gy+27); ctx.lineTo(gx+4,gy+14); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(gx+12,gy+13,3,0,Math.PI*2); ctx.arc(gx+21,gy+13,3,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#17213b'; ctx.beginPath(); ctx.arc(gx+13,gy+14,1.5,0,Math.PI*2); ctx.arc(gx+22,gy+14,1.5,0,Math.PI*2); ctx.fill();
        }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0, 0, w, 30);
    //ctx.font = `bold 18px ${GAME_FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = '#ffdf35'; ctx.fillText(`${cocoPuntos} ${g.score}`, 16, 21);
    //ctx.textAlign = 'center'; ctx.fillStyle = '#ff6b8a'; ctx.fillText(`${cocoVidas} ${'♥ '.repeat(g.lives).trim()}`, w/2, 21);
    //ctx.textAlign = 'right'; ctx.fillStyle = '#8df4ff'; ctx.fillText(cocoKeys, w - 14, 21);
    cocoText(`${cocoPuntos} ${g.score}`, 16, 21, 18, '#ffdf35', true, 'left');
    cocoText(`${cocoVidas} ${'♥ '.repeat(g.lives).trim()}`, w / 2, 21, 18, '#ff6b8a', true);
    cocoText(cocoKeys, w - 14, 21, 18, '#8df4ff', true, 'right');
    if (g.over) {
        //ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0,0,w,h);
        //ctx.textAlign = 'center'; ctx.font = `bold 46px ${GAME_FONT}`;
        //ctx.fillStyle = g.won ? '#ffdf35' : '#ff6478'; ctx.fillText(g.won ? cocoGanado : cocoPerdido, w/2, h/2-15);
        //ctx.font = `24px ${GAME_FONT}`; ctx.fillStyle = '#ffffff'; ctx.fillText(`${cocoPuntuacionFinal} ${g.score}`, w/2, h/2+28);
        //ctx.fillStyle = '#8df4ff'; ctx.fillText(cocoEndKeys, w / 2, h / 2 + 68);
        // Oscurecer el tablero.
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, w, h);

        // Caja semitransparente detrás de los textos.
        ctx.fillStyle = 'rgba(0, 0, 0, 0.70)';
        ctx.fillRect(w / 2 - 430, h / 2 - 105, 860, 200);
        // Borde del recuadro
        ctx.strokeStyle = '#8df4ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(w / 2 - 430, h / 2 - 105, 860, 200);
        //cocoText(g.won ? cocoGanado : cocoPerdido, w / 2, h / 2 - 15, 46, g.won ? '#ffdf35' : '#ff6478', true);
        const elapsed = frameCount - g.overFrame;
        if (!g.finSoundPlayed) {
            playSound(soundComeCocosFin);
            g.finSoundPlayed = true;
        }
        cocoTextWithAnimation(g.won ? cocoGanado : cocoPerdido,
            w / 2,
            h / 2 - 15,
            10,            // Tamaño inicial pequeño
            110,           // Tamaño final
            25,
            elapsed,
            g.won ? '#ffdf35' : '#ff6478',
            true);

        cocoText(`${cocoPuntuacionFinal} ${g.score}`, w / 2, h / 2 + 28, 24, '#ffffff');
        cocoText(cocoEndKeys, w / 2, h / 2 + 68, 22, '#8df4ff');
    }
}
