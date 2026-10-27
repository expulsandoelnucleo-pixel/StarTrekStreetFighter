
'use strict';

// ============================================================
// STAR TREK: EXPULSANDO EL NÚCLEO
// MINIJUEGO: MISIÓN DE EXPLORACIÓN
// Protagonista: Spock
//
// Estado global: EXPLORACION_GAME
//
// Controles:
//   Flechas / WASD : moverse
//   E / Espacio    : escanear anomalías
//   Escape / X     : volver al selector de modos
//   Enter / R      : repetir la misión al terminar
// ============================================================

const exploracionSpockImage =
    loadImage('assets/exploracion_spock.png');

const exploracionKeys = Object.create(null);

let exploracionGame = null;
let exploracionLastFrame = null;
let exploracionScanKeyPressed = false;

// ------------------------------------------------------------
// NIEBLA DE GUERRA
// ------------------------------------------------------------
const EXPLORACION_VISION_RADIUS = 100;
const EXPLORACION_VISION_FEATHER = 45;


// ------------------------------------------------------------
// INICIAR PARTIDA
// ------------------------------------------------------------

function beginExploracionGame() {
    const w = canvas.width;
    const h = canvas.height;

    const worldWidth = Math.max(1800, w * 2.2);
    const worldHeight = Math.max(1250, h * 2.1);

    exploracionGame = {
        width: w,
        height: h,

        worldWidth,
        worldHeight,

        camera: { x: 0, y: 0 },

        player: {
            x: 100,
            y: worldHeight / 2,
            radius: 15,
            direction: 0,
            animation: 0,
            walking: false
        },

        health: 3,
        score: 0,
        elapsed: 0,
        timeLeft: 150,

        scans: 0,
        scansRequired: 3,

        invulnerable: 0,

        over: false,
        won: false,
        endAnimationFrames: 0,

        message: 'Explora el planeta y analiza las anomalías.',
        messageTime: 4,

        extractionActive: false,

        vegetation: [],
        rocks: [],
        caves: [],
        anomalies: [],
        hazards: [],

        extraction: {
            x: worldWidth - 110,
            y: worldHeight / 2
        }
    };

    const g = exploracionGame;
    const enterpriseSeed = 1701;
    const seed = (enterpriseSeed + Math.floor(Math.random() * 4294967296)) >>> 0;
    const rand = exploracionRandomGenerator(seed);

    // Generar rocas.
    for (let i = 0; i < 150; i++) {
        g.rocks.push({
            x: rand() * worldWidth,
            y: rand() * worldHeight,
            radius: 8 + rand() * 24,
            type: Math.floor(rand() * 3)
        });
    }

    // Generar vegetación alienígena.
    for (let i = 0; i < 110; i++) {
        g.vegetation.push({
            x: rand() * worldWidth,
            y: rand() * worldHeight,
            radius: 8 + rand() * 15,
            type: Math.floor(rand() * 4)
        });
    }

    // Entradas de cuevas.
    g.caves = [
        {
            ...exploracionRandomPosition(rand, worldWidth, worldHeight, 100),
            radius: 45
        },
        {
            ...exploracionRandomPosition(rand, worldWidth, worldHeight, 100),
            radius: 53
        },
        {
            ...exploracionRandomPosition(rand, worldWidth, worldHeight, 100),
            radius: 36
        }
    ];

    // Anomalías científicas.
    g.anomalies = [
        {
            ...exploracionRandomPosition(rand, worldWidth, worldHeight, 130),
            color: '#62e9ff',
            scanned: false
        },
        {
            ...exploracionRandomPosition(rand, worldWidth, worldHeight, 130),
            color: '#b69aff',
            scanned: false
        },
        {
            ...exploracionRandomPosition(rand, worldWidth, worldHeight, 130),
            color: '#ffe36a',
            scanned: false
        },
        {
            ...exploracionRandomPosition(rand, worldWidth, worldHeight, 130),
            color: '#75ffb0',
            scanned: false
        }
    ];

    // Zonas peligrosas.
    g.hazards = [
        {
            ...exploracionRandomPosition(rand, worldWidth, worldHeight, 100),
            radius: 37,
            type: 'radiation',
            pulse: 0
        },
        {
            ...exploracionRandomPosition(rand, worldWidth, worldHeight, 100),
            radius: 30,
            type: 'energy',
            pulse: 1
        },
        {
            ...exploracionRandomPosition(rand, worldWidth, worldHeight, 100),
            radius: 42,
            type: 'toxic',
            pulse: 2
        },
        {
            ...exploracionRandomPosition(rand, worldWidth, worldHeight, 100),
            radius: 32,
            type: 'energy',
            pulse: 0
        }
    ];

    // El punto de extracción también cambia de posición.
    // Se mantiene lejos del punto de inicio de Spock.
    g.extraction = {
        x: worldWidth * (0.65 + rand() * 0.25),
        y: worldHeight * (0.15 + rand() * 0.70)
    };

    // Crear una máscara persistente para el terreno descubierto.
    g.fogCanvas = document.createElement('canvas');
    g.fogCanvas.width = Math.ceil(worldWidth);
    g.fogCanvas.height = Math.ceil(worldHeight);

    g.fogContext = g.fogCanvas.getContext('2d');

    // Todo el planeta comienza oculto.
    g.fogContext.fillStyle = '#000';
    g.fogContext.fillRect(0, 0, worldWidth, worldHeight);

    // Descubrir la zona inicial alrededor de Spock.
    exploracionRevealArea(g, g.player.x, g.player.y);

    exploracionClearKeys();
    exploracionLastFrame = performance.now();

    gameState = 'EXPLORACION_GAME';
}

// ------------------------------------------------------------
// TECLADO
// ------------------------------------------------------------

function exploracionHandleKey(key) {
    const k = key.toLowerCase();

    if (key === 'Escape' || k === 'x') {
        exploracionClearKeys();
        gameState = 'MODE_SELECT';
        return;
    }

    if (!exploracionGame) return;

    if (exploracionGame.over) {
        if (k === 'enter' || k === 'r' || key === ' ') {
            beginExploracionGame();
        }
        return;
    }

    if (k === 'e' || key === ' ') {
        exploracionScanKeyPressed = true;
        exploracionScan();
        return;
    }

    if ([
        'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
        'w', 'a', 's', 'd'
    ].includes(k)) {
        exploracionKeys[k] = true;
    }
}

function exploracionHandleKeyUp(key) {
    const k = key.toLowerCase();

    delete exploracionKeys[k];

    if (k === 'e' || key === ' ') {
        exploracionScanKeyPressed = false;
    }
}

function exploracionClearKeys() {
    for (const key in exploracionKeys) {
        delete exploracionKeys[key];
    }
}

function exploracionIsKeyDown(...keys) {
    return keys.some(key => exploracionKeys[key]);
}

// ------------------------------------------------------------
// ACTUALIZACIÓN DEL JUEGO
// ------------------------------------------------------------

function updateExploracionGame() {
    const g = exploracionGame;
    if (!g) return;

    const now = performance.now();

    let dt = exploracionLastFrame === null
        ? 0
        : (now - exploracionLastFrame) / 1000;

    exploracionLastFrame = now;
    dt = Math.min(dt, 0.05);

    if (g.over) {
        g.endAnimationFrames++;
        return;
    }

    g.elapsed += dt;
    g.timeLeft -= dt;

    if (g.timeLeft <= 0) {
        g.timeLeft = 0;
        exploracionEndGame(false);
        return;
    }

    g.messageTime = Math.max(0, g.messageTime - dt);

    const p = g.player;

    let dx = 0;
    let dy = 0;

    if (exploracionIsKeyDown('arrowleft', 'a')) dx--;
    if (exploracionIsKeyDown('arrowright', 'd')) dx++;
    if (exploracionIsKeyDown('arrowup', 'w')) dy--;
    if (exploracionIsKeyDown('arrowdown', 's')) dy++;

    if (dx !== 0 || dy !== 0) {
        const length = Math.hypot(dx, dy);

        dx /= length;
        dy /= length;

        const speed = 150;

        const nextX = p.x + dx * speed * dt;
        const nextY = p.y + dy * speed * dt;

        if (!exploracionCollidesWithCave(nextX, p.y, p.radius, g)) {
            p.x = nextX;
        }

        if (!exploracionCollidesWithCave(p.x, nextY, p.radius, g)) {
            p.y = nextY;
        }

        p.walking = true;
        p.animation += dt * 10;

        // Filas del sprite:
        // 0 = abajo, 1 = izquierda, 2 = derecha, 3 = arriba.
        if (Math.abs(dx) > Math.abs(dy)) {
            p.direction = dx < 0 ? 1 : 2;
        } else {
            p.direction = dy < 0 ? 3 : 0;
        }
    } else {
        p.walking = false;
        p.animation = 0;
    }

    p.x = exploracionClamp(p.x, p.radius, g.worldWidth - p.radius);
    p.y = exploracionClamp(p.y, p.radius, g.worldHeight - p.radius);

    // Descubrir continuamente el terreno alrededor de Spock.
    exploracionRevealArea(g, p.x, p.y);

    // Actualizar zonas peligrosas.
    for (const hazard of g.hazards) {
        hazard.pulse += dt * 2;

        const d = exploracionDistance(
            p.x, p.y, hazard.x, hazard.y
        );

        if (
            d < p.radius + hazard.radius * 0.55 &&
            g.invulnerable <= 0
        ) {
            g.health--;
            g.invulnerable = 1.2;

            g.message = '¡Peligro detectado! Spock ha sufrido daños.';
            g.messageTime = 2;

            if (g.health <= 0) {
                g.health = 0;
                //playSound(soundExploracionMuerte);
                exploracionEndGame(false);
                return;
            }

            // Sonido al perder una vida, excepto en la muerte final.
            playSound(soundExploracionVidaMenos);
        }
    }

    if (g.invulnerable > 0) {
        g.invulnerable = Math.max(0, g.invulnerable - dt);
    }

    // Mantener la cámara centrada en Spock.
    g.camera.x = exploracionClamp(
        p.x - g.width / 2,
        0,
        Math.max(0, g.worldWidth - g.width)
    );

    g.camera.y = exploracionClamp(
        p.y - g.height / 2,
        0,
        Math.max(0, g.worldHeight - g.height)
    );

    // Comprobar extracción.
    if (
        g.extractionActive &&
        exploracionDistance(
            p.x, p.y,
            g.extraction.x, g.extraction.y
        ) < 48
    ) {
        playSound(soundExploracionLogrado);
        exploracionEndGame(true);
    }
}

// ------------------------------------------------------------
// ESCANEO CON EL TRICORDER
// ------------------------------------------------------------

function exploracionScan() {
    const g = exploracionGame;
    if (!g || g.over) return;

    playSound(soundExploracionTricorder);

    const p = g.player;

    const anomaly = g.anomalies.find(a =>
        !a.scanned &&
        exploracionDistance(p.x, p.y, a.x, a.y) < 75
    );

    if (!anomaly) {
        g.message = 'No hay anomalías al alcance del tricorder.';
        g.messageTime = 1.8;
        return;
    }

    anomaly.scanned = true;
    g.scans++;
    g.score += 100;

    g.message = `Anomalía analizada: ${g.scans}/${g.scansRequired}`;
    g.messageTime = 2.5;
    playSound(soundExploracionDescubierto);

    if (g.scans >= g.scansRequired) {
        g.extractionActive = true;
        g.message = 'Datos completos. ¡Dirígete al punto de extracción!';
        g.messageTime = 4;
    }
}

// ------------------------------------------------------------
// DIBUJAR EL ESCENARIO
// ------------------------------------------------------------

function drawExploracionGame() {
    const g = exploracionGame;
    if (!g) return;

    ctx.save();

    // Fondo.
    ctx.fillStyle = '#050807';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pasar de coordenadas del mundo a coordenadas de pantalla.
    ctx.translate(-g.camera.x, -g.camera.y);

    // Primero dibujar el planeta y todos sus elementos.
    exploracionDrawTerrain(g);
    exploracionDrawAnomalies(g);
    exploracionDrawHazards(g);
    exploracionDrawExtraction(g);

    // Oscurecer el territorio desconocido y atenuar el explorado.
    if (g.fogCanvas) {
        ctx.drawImage(g.fogCanvas, 0, 0);
    }

    // Spock permanece visible sobre la niebla.
    exploracionDrawSpock(g);

    ctx.restore();

// La interfaz queda siempre visible.
    exploracionDrawInterface(g);
}

// ------------------------------------------------------------
// TERRENO, ROCAS, VEGETACIÓN Y CUEVAS
// ------------------------------------------------------------

function exploracionDrawTerrain(g) {
    ctx.fillStyle = '#343b37';
    ctx.fillRect(0, 0, g.worldWidth, g.worldHeight);

    // Textura rocosa.
    for (let y = 0; y < g.worldHeight; y += 80) {
        for (let x = 0; x < g.worldWidth; x += 80) {
            const n = (x * 17 + y * 31) % 23;

            ctx.fillStyle = n < 8
                ? '#39443e'
                : n < 15
                    ? '#303833'
                    : '#41463d';

            ctx.beginPath();
            ctx.ellipse(
                x + 20, y + 18,
                18 + n, 10 + n / 2,
                n / 10, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    // Rocas.
    const rockColors = ['#62665a', '#777364', '#4c554d'];

    for (const r of g.rocks) {
        ctx.fillStyle = rockColors[r.type];

        ctx.beginPath();
        ctx.moveTo(r.x - r.radius, r.y);
        ctx.lineTo(r.x - r.radius * 0.35, r.y - r.radius * 0.8);
        ctx.lineTo(r.x + r.radius * 0.7, r.y - r.radius * 0.55);
        ctx.lineTo(r.x + r.radius, r.y + r.radius * 0.25);
        ctx.lineTo(r.x + r.radius * 0.1, r.y + r.radius * 0.8);
        ctx.lineTo(r.x - r.radius * 0.8, r.y + r.radius * 0.55);
        ctx.closePath();
        ctx.fill();
    }

    // Vegetación alienígena.
    const plantColors = ['#397c57', '#5b8d46', '#286c70', '#8270a7'];

    for (const v of g.vegetation) {
        ctx.save();
        ctx.translate(v.x, v.y);

        ctx.fillStyle = plantColors[v.type];

        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate(i * Math.PI * 2 / 5);

            ctx.beginPath();
            ctx.ellipse(
                0, -v.radius * 0.62,
                v.radius * 0.25, v.radius * 0.68,
                0, 0, Math.PI * 2
            );
            ctx.fill();

            ctx.restore();
        }

        ctx.fillStyle = '#9ccf72';
        ctx.beginPath();
        ctx.arc(0, 0, v.radius * 0.22, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Cuevas.
    for (const cave of g.caves) {
        ctx.fillStyle = '#222723';

        ctx.beginPath();
        ctx.ellipse(
            cave.x, cave.y,
            cave.radius * 1.15, cave.radius * 0.75,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = '#777a68';
        ctx.lineWidth = 7;

        ctx.beginPath();
        ctx.ellipse(
            cave.x, cave.y,
            cave.radius * 1.15, cave.radius * 0.75,
            0, 0, Math.PI * 2
        );
        ctx.stroke();
    }
}

// ------------------------------------------------------------
// ANOMALÍAS
// ------------------------------------------------------------

function exploracionDrawAnomalies(g) {
    for (const anomaly of g.anomalies) {
        if (anomaly.scanned) {
            ctx.strokeStyle = '#7cffb0';
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.arc(anomaly.x, anomaly.y, 15, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(anomaly.x - 6, anomaly.y);
            ctx.lineTo(anomaly.x - 1, anomaly.y + 5);
            ctx.lineTo(anomaly.x + 8, anomaly.y - 6);
            ctx.stroke();

            continue;
        }

        const pulse = 1 + Math.sin(g.elapsed * 3 + anomaly.x) * 0.12;

        ctx.save();
        ctx.translate(anomaly.x, anomaly.y);

        ctx.strokeStyle = anomaly.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.9;

        ctx.beginPath();
        ctx.arc(0, 0, 20 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.25;
        ctx.fillStyle = anomaly.color;

        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ------------------------------------------------------------
// ZONAS PELIGROSAS
// ------------------------------------------------------------

function exploracionDrawHazards(g) {
    for (const hazard of g.hazards) {
        const pulse = 1 + Math.sin(hazard.pulse) * 0.1;

        let color = '#e8e64d';

        if (hazard.type === 'toxic') {
            color = '#54ff83';
        } else if (hazard.type === 'energy') {
            color = '#ff765f';
        }

        ctx.save();

        ctx.globalAlpha = 0.22;
        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.arc(hazard.x, hazard.y, hazard.radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([7, 6]);

        ctx.beginPath();
        ctx.arc(hazard.x, hazard.y, hazard.radius * pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.restore();
    }
}

// ------------------------------------------------------------
// EXTRACCIÓN
// ------------------------------------------------------------

function exploracionDrawExtraction(g) {
    const e = g.extraction;

    ctx.save();
    ctx.translate(e.x, e.y);

    ctx.strokeStyle = g.extractionActive ? '#62ffb5' : '#8c9b9a';
    ctx.lineWidth = 4;
    ctx.globalAlpha = g.extractionActive ? 0.95 : 0.55;

    ctx.beginPath();
    ctx.arc(0, 0, 40 + Math.sin(g.elapsed * 3) * 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(22, 0);
    ctx.moveTo(0, -22);
    ctx.lineTo(0, 22);
    ctx.stroke();

    ctx.globalAlpha = 1;

    text(
        g.extractionActive ? 'EXTRACCIÓN' : 'SALIDA',
        e.x,
        e.y + 58,
        12,
        '#fff',
        false
    );

    ctx.restore();
}

// ------------------------------------------------------------
// SPOCK
// ------------------------------------------------------------

function exploracionDrawSpock(g) {
    const p = g.player;

    // Parpadeo durante la invulnerabilidad.
    if (
        g.invulnerable > 0 &&
        Math.floor(g.elapsed * 12) % 2 === 0
    ) {
        return;
    }

    const img = exploracionSpockImage;

    if (img && img.complete && img.naturalWidth > 0) {
        const columns = 4;
        const rows = 4;

        const frameWidth = img.naturalWidth / columns;
        const frameHeight = img.naturalHeight / rows;

        const frame = p.walking
            ? Math.floor(p.animation) % columns
            : 0;

        ctx.drawImage(
            img,
            frame * frameWidth,
            p.direction * frameHeight,
            frameWidth,
            frameHeight,
            p.x - 22,
            p.y - 28,
            44,
            56
        );

        return;
    }

    // Personaje provisional si el PNG no se ha cargado.
    ctx.save();
    ctx.translate(p.x, p.y);

    ctx.fillStyle = '#456d82';
    ctx.fillRect(-11, -8, 22, 24);

    ctx.fillStyle = '#e9d3b4';
    ctx.beginPath();
    ctx.arc(0, -15, 9, 0, Math.PI * 2);
    ctx.fill();

    // Pelo negro.
    ctx.fillStyle = '#171a1b';
    ctx.beginPath();
    ctx.arc(0, -19, 9, Math.PI, Math.PI * 2);
    ctx.fill();

    // Tricorder.
    ctx.fillStyle = '#79d7f2';
    ctx.fillRect(4, -1, 12, 7);

    ctx.restore();
}

// ------------------------------------------------------------
// INTERFAZ
// ------------------------------------------------------------

function exploracionDrawInterface(g) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();

    // Panel de misión.
    ctx.fillStyle = 'rgba(7,15,19,0.88)';
    ctx.fillRect(12, 12, 310, 91);

    ctx.strokeStyle = '#54717a';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, 310, 91);

    text('MISIÓN DE EXPLORACIÓN', 173, 40, 22, '#fff', true, GAME_FONTKLINGON);
    text(`Salud : ${'♥ '.repeat(g.health)}${'♡ '.repeat(3 - g.health)}`, 84, 63, 14, '#ff7777', false, GAME_FONTKLINGON);
    text(`Datos: ${g.scans}/${g.scansRequired}   Tiempo: ${Math.ceil(g.timeLeft)} s`, 34, 87, 18, '#cce7ee', false, GAME_FONTKLINGON);

    // Mensaje temporal.
    if (g.messageTime > 0 && g.message) {
        const messageWidth = Math.min(
            ctx.measureText(g.message).width,
            w - 40
        );

        ctx.fillStyle = 'rgba(7,15,19,0.88)';
        ctx.fillRect(
            w / 2 - messageWidth / 2 - 18,
            h - 53,
            messageWidth + 36,
            33
        );

        text(g.message, w / 2, h - 31, 20, '#fff', false);
    }

    // Ayuda para escanear.
    if (
        !g.over &&
        g.anomalies.some(a =>
            !a.scanned &&
            exploracionDistance(g.player.x, g.player.y, a.x, a.y) < 75
        )
    ) {
        text('Pulsa E o ESPACIO para escanear', w / 2, h - 70, 18, '#fff',false);
    }

    // Pantalla final.
    if (g.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.76)';
        ctx.fillRect(0, 0, w, h);

        // Título animado: crece desde 12 hasta 34 píxeles.
        textWithAnimation(
            g.won ? '¡MISIÓN COMPLETADA!' : 'MISIÓN FALLIDA',
            w / 2,
            h / 2 - 22,
            12,
            50,
            30,
            g.endAnimationFrames,
            g.won ? '#8cffc6' : '#ff9a88',
            true,
            GAME_FONTTNG
        );

        text(g.won ? 'Spock ha recuperado los datos científicos.' : 'La misión no se ha podido completar.', w / 2, h / 2 + 14, 24, '#fff', false);
        text(`Puntuación: ${g.score}`, w / 2, h / 2 + 44, 24, '#fff', false);
        text('ENTER / R: repetir    ESC / X: volver al menú', w / 2, h / 2 + 78, 24, '#fff', false);
    }

    ctx.restore();
}

// ------------------------------------------------------------
// FIN DE PARTIDA
// ------------------------------------------------------------

function exploracionEndGame(won) {
    const g = exploracionGame;

    if (!g || g.over) return;

    g.over = true;
    g.won = won;
    g.endAnimationFrames = 0;

    // Detener el sonido del tricorder si todavía está sonando.
    soundExploracionTricorder.pause();
    soundExploracionTricorder.currentTime = 0;

    // Sonido final de la misión.
    if (won) {
        playSound(soundExploracionLogrado);
    } else {
        playSound(soundExploracionMuerte);
    }

    exploracionClearKeys();
    exploracionScanKeyPressed = false;
}

// ------------------------------------------------------------
// COLISIONES Y UTILIDADES
// ------------------------------------------------------------

function exploracionCollidesWithCave(x, y, radius, g) {
    for (const cave of g.caves) {
        if (
            exploracionDistance(x, y, cave.x, cave.y) <
            cave.radius * 0.6 + radius
        ) {
            return true;
        }
    }

    return false;
}

function exploracionDistance(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
}

function exploracionClamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function exploracionRandomGenerator(seed) {
    return function () {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };
}

function exploracionRandomPosition(rand, worldWidth, worldHeight, margin = 100) {
    return {
        x: margin + rand() * (worldWidth - margin * 2),
        y: margin + rand() * (worldHeight - margin * 2)
    };
}

// ------------------------------------------------------------
// NIEBLA DE GUERRA: DESCUBRIR TERRENO
// ------------------------------------------------------------
function exploracionRevealArea(g, x, y) {
    if (!g || !g.fogContext) return;

    const fog = g.fogContext;

    const innerRadius = EXPLORACION_VISION_RADIUS;
    const outerRadius =
        EXPLORACION_VISION_RADIUS + EXPLORACION_VISION_FEATHER;

    // Borrar progresivamente la máscara negra.
    // El centro queda completamente descubierto y el borde
    // conserva una transición suave.
    fog.save();
    fog.globalCompositeOperation = 'destination-out';

    const gradient = fog.createRadialGradient(
        x, y, innerRadius * 0.65,
        x, y, outerRadius
    );

    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.75, 'rgba(0,0,0,0.9)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    fog.fillStyle = gradient;
    fog.beginPath();
    fog.arc(x, y, outerRadius, 0, Math.PI * 2);
    fog.fill();

    fog.restore();
}
