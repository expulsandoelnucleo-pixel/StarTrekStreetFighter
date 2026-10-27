
'use strict';

// Minijuego de asteroides independiente.
// Utiliza canvas, ctx, frameCount, GAME_FONT, text() y textWithAnimation()
// definidos en game.js.

const asteroidesPlayer = loadImage('assets/enterprise_asteroides.png');
const asteroidesBorg = loadImage('assets/borg.png');


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
        fireTimer: 0,
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
        borg: null,
        borgSpawnTimer: asteroidesRandom(12, 18),
        borgBullets: [],
        particles: []
    };

    asteroidesClearKeys();

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

function asteroidesSpawnBorg(g) {
    const w = g.width;
    const h = g.height;
    const fromLeft = Math.random() < 0.5;
    const borgSize = 76;

    g.borg = {
        x: fromLeft ? -borgSize : w + borgSize,
        y: asteroidesRandom(75, Math.max(76, h - 75)),
        vx: (fromLeft ? 1 : -1) * asteroidesRandom(65, 90),
        size: borgSize,
        hp: 5,
        maxHp: 5,
        fireTimer: asteroidesRandom(2.8, 4.2)
    };
}

function asteroidesBorgShoot(g) {
    const borg = g.borg;
    const p = g.player;

    if (!borg) return;

    // Apuntar hacia la posición actual de la Enterprise.
    const dx = p.x - borg.x;
    const dy = p.y - borg.y;
    const distance = Math.hypot(dx, dy) || 1;
    const shotSpeed = 175;

    g.borgBullets.push({
        x: borg.x,
        y: borg.y,
        vx: dx / distance * shotSpeed,
        vy: dy / distance * shotSpeed,
        life: 4
    });

    // Disparos poco frecuentes para mantener una dificultad razonable.
    borg.fireTimer = asteroidesRandom(3.5, 5);
}

function asteroidesLoseLife(g) {
    const p = g.player;

    g.lives--;
    playSound(soundAsteroidesExplosion);

    if (g.lives <= 0) {
        playSound(soundAsteroidesExplosion);
        g.over = true;
        g.overFrame = frameCount;
        asteroidesClearKeys();
        return;
    }

    // Reaparecer en el centro con invulnerabilidad temporal.
    p.x = g.width / 2;
    p.y = g.height / 2;
    p.vx = 0;
    p.vy = 0;
    p.angle = -Math.PI / 2;

    g.invulnerable = 2;
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

    // Disparo de la Enterprise con espacio.
    g.fireTimer = Math.max(0, g.fireTimer - dt);

    if (asteroidesKey(' ') && g.fireTimer === 0) {
        asteroidesShoot(g);
        playSound(soundAsteroidesDisparo);
        g.fireTimer = 0.22;
    }

    if (g.invulnerable > 0) {
        g.invulnerable -= dt;
    }

    // Proyectiles de la Enterprise.
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

    // Aparición ocasional del cubo Borg.
    g.borgSpawnTimer -= dt;

    if (!g.borg && g.borgSpawnTimer <= 0) {
        asteroidesSpawnBorg(g);
        playSound(soundAsteroidesSaleBorg);
    }

    if (g.borg) {
        const borg = g.borg;

        borg.x += borg.vx * dt;
        borg.fireTimer -= dt;

        if (borg.fireTimer <= 0) {
            asteroidesBorgShoot(g);
            playSound(soundAsteroidesDisparoBorg);
        }

        // Desaparece al cruzar completamente la pantalla.
        if ((borg.vx > 0 && borg.x > w + borg.size) ||
            (borg.vx < 0 && borg.x < -borg.size)) {
            g.borg = null;
            g.borgSpawnTimer = asteroidesRandom(18, 28);
        }
    }

    // Movimiento de los disparos Borg.
    for (const b of g.borgBullets) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
    }

    g.borgBullets = g.borgBullets.filter(b =>
        b.life > 0 &&
        b.x > -10 && b.x < w + 10 &&
        b.y > -10 && b.y < h + 10
    );

    // Aparición progresiva de asteroides.
    g.spawnTimer -= dt;

    if (g.spawnTimer <= 0) {
        const maxAsteroids = Math.min(22, 7 + Math.floor(g.elapsed / 12));

        if (g.asteroids.length < maxAsteroids) {
            asteroidesSpawnAsteroid(g, 3);
        }

        g.spawnTimer = Math.max(0.65, 2.4 - g.elapsed * 0.012);
    }

    // Impactos de los disparos de la Enterprise contra asteroides.
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

    // Los disparos de la Enterprise dañan al cubo Borg.
    if (g.borg) {
        const borg = g.borg;

        for (const b of g.bullets) {
            if (b.life <= 0) continue;

            if (Math.abs(b.x - borg.x) < borg.size * 0.55 &&
                Math.abs(b.y - borg.y) < borg.size * 0.55) {
                b.life = 0;
                borg.hp--;

                asteroidesCreateExplosion(g, b.x, b.y, 5, '#69ff75');

                if (borg.hp <= 0) {
                    asteroidesCreateExplosion(g, borg.x, borg.y, 38, '#55ff66');

                    g.score += 500;
                    g.borg = null;
                    g.borgBullets = [];
                    g.borgSpawnTimer = asteroidesRandom(18, 28);
                }

                break;
            }
        }
    }

    g.bullets = g.bullets.filter(b => b.life > 0);

    // Impacto de un proyectil Borg contra la Enterprise.
    if (g.invulnerable <= 0) {
        for (const b of g.borgBullets) {
            if (Math.hypot(p.x - b.x, p.y - b.y) <
                asteroidesShipRadius + 5) {
                b.life = 0;

                asteroidesCreateExplosion(g, p.x, p.y, 24, '#55ff66');
                asteroidesLoseLife(g);
                break;
            }
        }
    }

    g.borgBullets = g.borgBullets.filter(b => b.life > 0);

    // Colisión de la Enterprise contra el cubo Borg.
    if (g.borg && g.invulnerable <= 0 &&
        Math.hypot(p.x - g.borg.x, p.y - g.borg.y) <
        g.borg.size * 0.55 + asteroidesShipRadius) {
        asteroidesCreateExplosion(g, p.x, p.y, 24, '#55ff66');
        asteroidesLoseLife(g);
    }

    // Colisión de la Enterprise contra los asteroides.
    if (g.invulnerable <= 0) {
        for (let i = g.asteroids.length - 1; i >= 0; i--) {
            const a = g.asteroids[i];

            if(Math.hypot(p.x - a.x, p.y - a.y) <
                a.radius + asteroidesShipRadius * 0.65) {

                g.asteroids.splice(i, 1);

                asteroidesCreateExplosion(g, p.x, p.y, 28, '#ff7184');
                asteroidesLoseLife(g);
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

    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // Fondo espacial.
    ctx.fillStyle = '#020611';
    ctx.fillRect(0, 0, w, h);

    // Estrellas estáticas.
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

        // Grietas para dar textura.
        ctx.strokeStyle = 'rgba(160,180,210,0.45)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(-a.radius * 0.35, -a.radius * 0.1);
        ctx.lineTo(0, a.radius * 0.2);
        ctx.lineTo(a.radius * 0.25, -a.radius * 0.3);
        ctx.stroke();

        ctx.restore();
    }

    // Cubo Borg y barra de resistencia.
    if (g.borg && asteroidesBorg && asteroidesBorg.complete &&
        asteroidesBorg.naturalWidth > 0) {
        const borg = g.borg;

        ctx.save();
        ctx.shadowColor = '#55ff66';
        ctx.shadowBlur = 14;

        ctx.drawImage(
            asteroidesBorg,
            borg.x - borg.size / 2,
            borg.y - borg.size / 2,
            borg.size,
            borg.size
        );

        ctx.restore();

        const barWidth = borg.size;
        const barY = borg.y - borg.size / 2 - 10;

        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(borg.x - barWidth / 2, barY, barWidth, 5);

        ctx.fillStyle = '#55ff66';
        ctx.fillRect(
            borg.x - barWidth / 2,
            barY,
            barWidth * borg.hp / borg.maxHp,
            5
        );
    }


    // Disparos verdes del cubo Borg.
    ctx.save();
    ctx.fillStyle = '#55ff66';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 13;

    for (const b of g.borgBullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();

    // Disparos de la Enterprise.
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
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle + Math.PI / 2);

        // Tamaño de la Enterprise.
        const shipWidth = 54;
        const shipHeight = 80;

        // Dibujar la imagen centrada en la posición de la nave.
        if (asteroidesPlayer && asteroidesPlayer.complete &&
            asteroidesPlayer.naturalWidth > 0) {
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

    ctx.restore();
}

window.asteroidesHandleKeyUp = asteroidesHandleKeyUp;
