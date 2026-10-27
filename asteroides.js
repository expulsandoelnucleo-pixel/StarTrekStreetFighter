
'use strict';

// Minijuego de asteroides independiente.
// Utiliza canvas, ctx, frameCount, GAME_FONT, text() y textWithAnimation()
// definidos en game.js.

const asteroidesPlayer = loadImage('assets/enterprise_asteroides.png');

const asteroidesShipRadius = 15;
const asteroidesKeys = Object.create(null);

let asteroidesGame = null;
let asteroidesLastFrame = null;

function beginAsteroidesGame() {
    const w = canvas.width;
    const h = canvas.height;

    asteroidesGame = {
        width: w,
        height: h,
        over: false,
        overFrame: 0,
        score: 0,
        lives: 3,
        elapsed: 0,
        spawnTimer: 0,
        invulnerable: 2,
        player: {
            x: w / 2,
            y: h / 2,
            angle: -Math.PI / 2,
            vx: 0,
            vy: 0
        },
        asteroids: [],
        bullets: [],
        particles: []
    };

    for (const key in asteroidesKeys) delete asteroidesKeys[key];

    // Crear los primeros asteroides lejos de la nave.
    for (let i = 0; i < 5; i++) {
        asteroidesSpawnAsteroid(asteroidesGame, 3);
    }

    asteroidesLastFrame = null;
    gameState = 'ASTEROIDES_GAME';
}

function asteroidesHandleKey(key) {
    const k = key.toLowerCase();

    if (key === 'Escape' || k === 'x') {
        asteroidesClearKeys();
        gameState = 'MODE_SELECT';
        return;
    }

    // En la pantalla final, una tecla permite volver a jugar.
    if (asteroidesGame && asteroidesGame.over) {
        if (k === 'enter' || k === ' ') {
            beginAsteroidesGame();
        }
        return;
    }

    if ([
        'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
        'w', 'a', 's', 'd', ' '
    ].includes(k)) {
        asteroidesKeys[k] = true;
    }
}

function asteroidesHandleKeyUp(key) {
    delete asteroidesKeys[key.toLowerCase()];
}

function asteroidesClearKeys() {
    for (const key in asteroidesKeys) {
        delete asteroidesKeys[key];
    }
}

function asteroidesKey(...keys) {
    return keys.some(key => asteroidesKeys[key]);
}

function asteroidesRandom(min, max) {
    return min + Math.random() * (max - min);
}

function asteroidesWrap(obj, w, h, margin = 0) {
    if (obj.x < -margin) obj.x = w + margin;
    else if (obj.x > w + margin) obj.x = -margin;

    if (obj.y < -margin) obj.y = h + margin;
    else if (obj.y > h + margin) obj.y = -margin;
}

function asteroidesSpawnAsteroid(g, size, x = null, y = null) {
    const w = g.width;
    const h = g.height;

    if (x === null || y === null) {
        // Aparecen por los bordes de la pantalla.
        const side = Math.floor(Math.random() * 4);

        if (side === 0) {
            x = Math.random() * w;
            y = -35;
        } else if (side === 1) {
            x = w + 35;
            y = Math.random() * h;
        } else if (side === 2) {
            x = Math.random() * w;
            y = h + 35;
        } else {
            x = -35;
            y = Math.random() * h;
        }
    }

    const angle = Math.random() * Math.PI * 2;
    const speed = asteroidesRandom(35, 85) *
        (1 + g.elapsed / 100);

    const radius = size === 3 ? 34 : size === 2 ? 21 : 12;

    const vertices = [];
    const count = Math.floor(asteroidesRandom(9, 15));

    for (let i = 0; i < count; i++) {
        vertices.push(asteroidesRandom(0.72, 1.15));
    }

    g.asteroids.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        angle: Math.random() * Math.PI * 2,
        rotation: asteroidesRandom(-1.1, 1.1),
        radius,
        size,
        vertices
    });
}

function asteroidesShoot(g) {
    const p = g.player;
    const speed = 430;

    g.bullets.push({
        x: p.x + Math.cos(p.angle) * 20,
        y: p.y + Math.sin(p.angle) * 20,
        vx: p.vx + Math.cos(p.angle) * speed,
        vy: p.vy + Math.sin(p.angle) * speed,
        life: 0.85
    });
}

function asteroidesCreateExplosion(g, x, y, count, color = '#a9dfff') {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = asteroidesRandom(30, 180);

        g.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: asteroidesRandom(0.25, 0.7),
            maxLife: 0.7,
            color,
            radius: asteroidesRandom(1.5, 3.5)
        });
    }
}

function updateAsteroidesGame() {
    const g = asteroidesGame;
    if (!g || g.over) return;

    // Evita saltos grandes al volver a la pestaña.
    const now = performance.now();
    const dt = asteroidesLastFrame === null
        ? 1 / 60
        : Math.min((now - asteroidesLastFrame) / 1000, 0.04);

    asteroidesLastFrame = now;
    g.elapsed += dt;

    const p = g.player;
    const w = g.width;
    const h = g.height;

    // Pilotaje.
    if (asteroidesKey('arrowleft', 'a')) p.angle -= 3.8 * dt;
    if (asteroidesKey('arrowright', 'd')) p.angle += 3.8 * dt;

    if (asteroidesKey('arrowup', 'w')) {
        p.vx += Math.cos(p.angle) * 240 * dt;
        p.vy += Math.sin(p.angle) * 240 * dt;
    }

    // Frenado suave.
    if (asteroidesKey('arrowdown', 's')) {
        p.vx *= Math.pow(0.12, dt);
        p.vy *= Math.pow(0.12, dt);
    }

    // Límite de velocidad.
    const maxSpeed = 300;
    const speed = Math.hypot(p.vx, p.vy);

    if (speed > maxSpeed) {
        p.vx = p.vx / speed * maxSpeed;
        p.vy = p.vy / speed * maxSpeed;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    asteroidesWrap(p, w, h);

    // Disparo con espacio, con cadencia limitada.
    g.fireTimer = Math.max(0, (g.fireTimer || 0) - dt);

    if (asteroidesKey(' ') && g.fireTimer === 0) {
        asteroidesShoot(g);
        g.fireTimer = 0.22;
    }

    if (g.invulnerable > 0) {
        g.invulnerable -= dt;
    }

    // Proyectiles.
    for (const b of g.bullets) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        asteroidesWrap(b, w, h);
    }

    g.bullets = g.bullets.filter(b => b.life > 0);

    // Asteroides.
    for (const a of g.asteroids) {
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.angle += a.rotation * dt;
        asteroidesWrap(a, w, h, a.radius);
    }

    // Aparición progresiva de nuevos asteroides.
    g.spawnTimer -= dt;

    if (g.spawnTimer <= 0) {
        const maxAsteroids = Math.min(22, 7 + Math.floor(g.elapsed / 12));

        if (g.asteroids.length < maxAsteroids) {
            asteroidesSpawnAsteroid(g, 3);
        }

        g.spawnTimer = Math.max(0.65, 2.4 - g.elapsed * 0.012);
    }

    // Impactos de los disparos.
    for (const b of g.bullets) {
        if (b.life <= 0) continue;

        for (let i = g.asteroids.length - 1; i >= 0; i--) {
            const a = g.asteroids[i];

            if (Math.hypot(b.x - a.x, b.y - a.y) < a.radius) {
                b.life = 0;
                g.asteroids.splice(i, 1);

                g.score += a.size === 3 ? 20 : a.size === 2 ? 50 : 100;
                asteroidesCreateExplosion(g, a.x, a.y, 12);

                // Los asteroides grandes se fragmentan.
                if (a.size > 1) {
                    for (let n = 0; n < 2; n++) {
                        asteroidesSpawnAsteroid(
                            g, a.size - 1, a.x, a.y
                        );
                    }
                }

                break;
            }
        }
    }

    g.bullets = g.bullets.filter(b => b.life > 0);

    // Colisión de la nave contra los asteroides.
    if (g.invulnerable <= 0) {
        for (let i = g.asteroids.length - 1; i >= 0; i--) {
            const a = g.asteroids[i];

            if (Math.hypot(p.x - a.x, p.y - a.y) <
                a.radius + asteroidesShipRadius * 0.65) {

                g.asteroids.splice(i, 1);
                asteroidesCreateExplosion(g, p.x, p.y, 28, '#ff7184');
                g.lives--;

                if (g.lives <= 0) {
                    g.over = true;
                    g.overFrame = frameCount;
                    asteroidesClearKeys();
                } else {
                    p.x = w / 2;
                    p.y = h / 2;
                    p.vx = 0;
                    p.vy = 0;
                    p.angle = -Math.PI / 2;
                    g.invulnerable = 2;
                }

                break;
            }
        }
    }

    // Partículas de las explosiones.
    for (const particle of g.particles) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx *= Math.pow(0.3, dt);
        particle.vy *= Math.pow(0.3, dt);
        particle.life -= dt;
    }

    g.particles = g.particles.filter(particle => particle.life > 0);
}

function drawAsteroidesGame() {
    const g = asteroidesGame;
    const w = canvas.width;
    const h = canvas.height;

    // Fondo espacial.
    ctx.fillStyle = '#020611';
    ctx.fillRect(0, 0, w, h);

    // Estrellas estáticas generadas de forma determinista.
    for (let i = 0; i < 100; i++) {
        const x = (i * 137.5 + 19) % w;
        const y = (i * 83.7 + 31) % h;
        const r = i % 5 === 0 ? 1.5 : 0.8;

        ctx.fillStyle = i % 4 === 0
            ? 'rgba(141,244,255,0.8)'
            : 'rgba(255,255,255,0.55)';

        ctx.fillRect(x, y, r, r);
    }

    if (!g) return;

    // Asteroides.
    for (const a of g.asteroids) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);

        ctx.beginPath();

        for (let i = 0; i < a.vertices.length; i++) {
            const angle = i / a.vertices.length * Math.PI * 2;
            const radius = a.radius * a.vertices[i];
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fillStyle = '#303b50';
        ctx.fill();
        ctx.strokeStyle = '#91a6c8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Algunas grietas para dar textura.
        ctx.strokeStyle = 'rgba(160,180,210,0.45)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(-a.radius * 0.35, -a.radius * 0.1);
        ctx.lineTo(0, a.radius * 0.2);
        ctx.lineTo(a.radius * 0.25, -a.radius * 0.3);
        ctx.stroke();

        ctx.restore();
    }

    // Disparos.
    ctx.save();
    ctx.fillStyle = '#8df4ff';
    ctx.shadowColor = '#54e8ff';
    ctx.shadowBlur = 10;

    for (const b of g.bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();

    // Nave del jugador.
    // Version FLECHA
    /*
    const p = g.player;
    const visible = g.invulnerable <= 0 ||
        Math.floor(g.invulnerable * 10) % 2 === 0;

    if (visible && !g.over) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        ctx.strokeStyle = '#8df4ff';
        ctx.fillStyle = '#d9f7ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#54e8ff';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(19, 0);
        ctx.lineTo(-12, -11);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-12, 11);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Propulsor.
        if (asteroidesKey('arrowup', 'w')) {
            ctx.fillStyle = '#ffb454';
            ctx.beginPath();
            ctx.moveTo(-10, -5);
            ctx.lineTo(-22 - Math.random() * 7, 0);
            ctx.lineTo(-10, 5);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
    */
    // Version imagen PNG
    const p = g.player;
    const visible = g.invulnerable <= 0 ||
        Math.floor(g.invulnerable * 10) % 2 === 0;

    if (visible && !g.over) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle + Math.PI / 2);

        // Tamaño de la Enterprise.
        const shipWidth = 54;
        const shipHeight = 80;

        // Dibujar la imagen centrada en la posición de la nave.
        if (asteroidesPlayer && asteroidesPlayer.complete) {
            ctx.drawImage(
                asteroidesPlayer,
                -shipWidth / 2,
                -shipHeight / 2,
                shipWidth,
                shipHeight
            );
        }

        // Propulsor al acelerar.
        if (asteroidesKey('arrowup', 'w')) {
            ctx.fillStyle = '#ffb454';
            ctx.shadowColor = '#ffb454';
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.moveTo(-7, shipHeight / 2 - 4);
            ctx.lineTo(0, shipHeight / 2 + 12 + Math.random() * 7);
            ctx.lineTo(7, shipHeight / 2 - 4);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    // Explosiones.
    for (const particle of g.particles) {
        ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(
            particle.x, particle.y,
            particle.radius, 0, Math.PI * 2
        );
        ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Panel superior.
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, w, 34);

    text(`${asteroidesPuntos} ` + g.score, 60, 23, 18, '#ffdf35', true, GAME_FONTDS9);
    // Corregimos la alineación del marcador izquierdo.
    // text() centra por defecto; el resto del panel utiliza posiciones centradas.
    text(`${asteroidesVidas}   ` + `♥ `.repeat(g.lives).trim(), w / 2, 23, 18, '#ff6b8a', false, GAME_FONTDS9);
    text(`${asteroidesTiempo1}  ` + Math.floor(g.elapsed) + ` ${asteroidesTiempo2}`, w - 100, 23, 18, '#8df4ff', false, GAME_FONTDS9);

    if (g.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.58)';
        ctx.fillRect(0, 0, w, h);

        const boxW = Math.min(860, w - 40);
        const boxH = 200;
        const boxX = (w - boxW) / 2;
        const boxY = (h - boxH) / 2;

        ctx.fillStyle = 'rgba(0,0,0,0.82)';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        ctx.strokeStyle = '#8df4ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        const elapsed = frameCount - g.overFrame;

        textWithAnimation(
            asteroidesEnd,
            w / 2, h / 2 - 35,
            10, 60, 25, elapsed,
            '#ff6478', true
        );
        text(`${asteroidesPuntuacionFinal} ` + g.score, w / 2, h / 2 + 22, 24, '#ffffff', true);
        text(asteroidesEndKeys, w / 2, h / 2 + 66, 18, '#8df4ff', true);
    }
}
