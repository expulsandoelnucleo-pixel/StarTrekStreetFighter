// ============================================================
// GESTIÓN DE MÚSICA CENTRALIZADA
// ============================================================

// Precargamos el sonido del golpe
const hitSound1 = new Audio('assets/audios/hit1.mp3'); // Cambia la ruta por la de tu archivo mp3
hitSound1.volume = 0.4; // Opcional: ajusta el volumen (de 0.0 a 1.0)
const hitSound2 = new Audio('assets/audios/hit2.mp3');
hitSound2.volume = 0.4;
// You win
const soundWin = new Audio('assets/audios/you-win-street-fighter.mp3');
soundWin.volume = 0.9;
// You lose
const soundLose = new Audio('assets/audios/you-lose.mp3');
soundLose.volume = 0.9;
// Fight
const soundFight = new Audio('assets/audios/fight.mp3');
soundFight.volume = 0.6;
// Contadores 1, 2, 3
const soundStart1 = new Audio('assets/audios/1.mp3');
soundStart1.volume = 0.6;
const soundStart2 = new Audio('assets/audios/2.mp3');
soundStart2.volume = 0.6;
const soundStart3 = new Audio('assets/audios/3.mp3');
soundStart3.volume = 0.6;

// ------------------------------------------------------------
// EASTER EGGS
// ------------------------------------------------------------
// Easter egg Tribbles
const soundTribbles = new Audio('assets/audios/tribbles.mp3');
soundTribbles.volume = 0.6;
// Easter egg Spock
const soundSpock = new Audio('assets/audios/spock.mp3');
soundSpock.volume = 0.6;
// Easter egg Q
const soundQ = new Audio('assets/audios/q_immortal.mp3');
soundQ.volume = 0.6;
const soundQAllGoodThings = new Audio('assets/audios/q_allgoodthings.mp3');
soundQAllGoodThings.volume = 0.6;
// Easter egg EEN
const soundEen = new Audio('assets/audios/een.mp3');
soundEen.volume = 0.6;
// Easter egg DS9
const soundDs9 = new Audio('assets/audios/ds9.mp3');
soundDs9.volume = 0.6;


const easterEggSounds = {
    TRIBBLES_EASTER_EGG: soundTribbles,
    SPOCK_EASTER_EGG: soundSpock,
    EEN_EASTER_EGG: soundEen,
    DS9_EASTER_EGG: soundDs9
};
// Los sonidos se repiten mientras permanezca activo el Easter egg.
for (const sound of Object.values(easterEggSounds)) {
    sound.loop = true;
}


// ------------------------------------------------------------
// EFECTOS DE SONIDO DEL COMECOCOS
// ------------------------------------------------------------
const soundComeCocosComido = new Audio('assets/audios/coco_comido.mp3');
soundComeCocosComido.volume = 0.6;
const soundComeCocosComePunto = new Audio('assets/audios/coco_come_punto.mp3');
soundComeCocosComePunto.volume = 0.6;
const soundComeCocosFin = new Audio('assets/audios/ken-s-death.mp3');
soundComeCocosFin.volume = 0.6;

// ------------------------------------------------------------
// EFECTOS DE SONIDO DE LOS ASTEROIDES
// ------------------------------------------------------------
const soundAsteroidesDisparo = new Audio('assets/audios/asteroides_torpedo.mp3');
soundAsteroidesDisparo.volume = 0.6;
const soundAsteroidesExplosion = new Audio('assets/audios/asteroides_explosion.mp3');
soundAsteroidesExplosion.volume = 0.6;
const soundAsteroidesSaleBorg = new Audio('assets/audios/asteroides_borg_flyby.mp3');
soundAsteroidesSaleBorg.volume = 0.6;
const soundAsteroidesDisparoBorg = new Audio('assets/audios/asteroides_borg_phaser.mp3');
soundAsteroidesDisparoBorg.volume = 0.6;

// ------------------------------------------------------------
// EFECTOS DE SONIDO DE REPARA EL NÚCLEO
// ------------------------------------------------------------
const soundReparaNucleoComprueba = new Audio('assets/audios/nucleo_transfercomplete.mp3');
soundReparaNucleoComprueba.volume = 0.6;
const soundReparaNucleoExplota = new Audio('assets/audios/nucleo_explosion.mp3');
soundReparaNucleoExplota.volume = 0.6;
const soundReparaNucleoLogrado = new Audio('assets/audios/nucleo_afirmativo.mp3');
soundReparaNucleoLogrado.volume = 0.6;

// ------------------------------------------------------------
// EFECTOS DE SONIDO DE EXPLORACION
// ------------------------------------------------------------
const soundExploracionTricorder = new Audio('assets/audios/exploracion_tricorder.mp3');
soundExploracionTricorder.volume = 0.6;
const soundExploracionDescubierto = new Audio('assets/audios/exploracion_engage.mp3');
soundExploracionDescubierto.volume = 0.6;
const soundExploracionVidaMenos = new Audio('assets/audios/exploracion_failed.mp3');
soundExploracionVidaMenos.volume = 0.6;
const soundExploracionMuerte = new Audio('assets/audios/exploracion_dead.mp3');
soundExploracionMuerte.volume = 0.6;
const soundExploracionLogrado = new Audio('assets/audios/exploracion_transporter.mp3');
soundExploracionLogrado.volume = 0.6;



// ------------------------------------------------------------
// CREACIÓN DE PISTAS DE MÚSICA
// ------------------------------------------------------------
function createAudioTrack(filename) {
    const audio = new Audio(`./assets/audios/${filename}`);
    audio.loop = true;
    audio.volume = 0.55;
    audio.preload = 'auto';
    return audio;
}

// ------------------------------------------------------------
// CATÁLOGO CENTRALIZADO DE MÚSICAS
// La clave de cada pista se corresponde con getMusicScreen().
// ------------------------------------------------------------
const musicTracks = {
    MENU: createAudioTrack('intro.mp3'),
    MODE_SELECT: createAudioTrack('mode.mp3'),
    CHARACTER_SELECT: createAudioTrack('selection.mp3'),
    CREDITS: createAudioTrack('ending.mp3'),
    // Arenas del modo de combate
    ARENA_1_PUENTE: createAudioTrack('arena_1_puente.mp3'),
    ARENA_2_DS9: createAudioTrack('arena_2_ds9.mp3'),
    ARENA_3_KLINGON: createAudioTrack('arena_3_klingon.mp3'),
    ARENA_4_ROMULUS: createAudioTrack('arena_4_romulus.mp3'),
    ARENA_5_INGENIERIA: createAudioTrack('arena_5_ingenieria.mp3'),
    ARENA_6_PASILLO_BORG: createAudioTrack('arena_6_pasillo_borg.mp3'),
    ARENA_7_SALA_TRANSPORTADOR: createAudioTrack('arena_7_sala_transportador.mp3'),
    ARENA_8_PLANETA_TALOS: createAudioTrack('arena_8_planeta_talos.mp3'),
    ARENA_9_DESIERTO_REMOTO: createAudioTrack('arena_9_desierto_remoto.mp3'),
    ARENA_10_RUINAS_ANTIGUAS: createAudioTrack('arena_10_ruinas_antiguas.mp3'),
    ARENA_11_ACADEMIA_FEDERACION: createAudioTrack('arena_11_academia_federacion.mp3'),
    ARENA_12_HANGAR_LANZADERAS: createAudioTrack('arena_12_hangar_lanzaderas.mp3'),
    ARENA_13_ASTEROIDES: createAudioTrack('arena_13_asteroides.mp3'),
    ARENA_14_SELVA_EXOTICA: createAudioTrack('arena_14_selva_exotica.mp3'),
    ARENA_15_OBSERVATORIO_ESTELAR: createAudioTrack('arena_15_observatorio_estelar.mp3'),
    ARENA_16_PUENTE_DANADO: createAudioTrack('arena_16_puente_danado.mp3'),
    ARENA_17_ESTACION_ORBITAL: createAudioTrack('arena_17_estacion_orbital.mp3'),
    ARENA_18_TEMPLO_BORG: createAudioTrack('arena_18_templo_borg.mp3'),
    ARENA_19_NUCLEO_BORG: createAudioTrack('arena_19_nucleo_borg.mp3'),
    // Modo 4: entrenamiento
    MODO4_BIENVENIDA: createAudioTrack('modo4_bienvenida_cadetes.mp3'),
    MODO4_TIRO_DIANA: createAudioTrack('modo4_tiro_diana.mp3'),
    MODO4_CARRERA: createAudioTrack('modo4_curso.mp3'),
    MODO4_BATALLA_ESPACIAL: createAudioTrack('modo4_curso.mp3'),
    // Modo 4: cuatro niveles del holodeck
    MODO4_MARIO_1: createAudioTrack('modo4_mario_1.mp3'),
    MODO4_MARIO_2: createAudioTrack('modo4_mario_2.mp3'),
    MODO4_MARIO_3: createAudioTrack('modo4_mario_3.mp3'),
    MODO4_MARIO_4: createAudioTrack('modo4_mario_4.mp3'),
    // Evaluación final del entrenamiento
    MODO4_TEST_FINAL: createAudioTrack('modo4_test_fin.mp3'),
    // ComeCocos
    COCO_GAME: createAudioTrack('comecocos.m4a'),
    // Asteroides
    ASTEROIDES_GAME: createAudioTrack('asteroides.mp3'),
    // Repara el núcleo
    NUCLEO_GAME: createAudioTrack('repara_nucleo.mp3'),
    // Exploración
    EXPLORACION_GAME: createAudioTrack('exploracion_ambiente.mp3')
};

// ------------------------------------------------------------
// ESTADO DEL SISTEMA DE MÚSICA
// ------------------------------------------------------------
let musicButton = null;
let lastMusicState = null;
let audioUnlocked = false;
let musicMuted = false;

// ------------------------------------------------------------
// BOTÓN PARA ACTIVAR O SILENCIAR LA MÚSICA
// ------------------------------------------------------------
function ensureMusicButton() {
    if (musicButton || !document.body) return;
    musicButton = document.createElement('button');
    musicButton.type = 'button';
    musicButton.textContent = '🔊 Música automática: activada';
    musicButton.setAttribute('aria-label', 'Silenciar o activar música');
    Object.assign(musicButton.style, {
        position: 'fixed', right: '14px', top: '14px', zIndex: '99999',
        padding: '10px 14px', border: '2px solid #00ffff', borderRadius: '8px',
        background: '#071b2b', color: '#ffffff', font: 'bold 14px Arial, sans-serif',
        cursor: 'pointer', boxShadow: '0 0 10px rgba(0,255,255,.35)'
    });
    musicButton.addEventListener('click', async () => {
        audioUnlocked = true;
        musicMuted = !musicMuted;
        if (musicMuted) {
            musicButton.textContent = '🔇 Música silenciada';
            stopAllMusic(false);
            return;
        }
        musicButton.textContent = '🔊 Música automática: activada';
        lastMusicState = null;
        syncMenuMusic();
    });
    document.body.appendChild(musicButton);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureMusicButton, { once: true });
} else {
    ensureMusicButton();
}

// ------------------------------------------------------------
// DETENER MÚSICAS
// ------------------------------------------------------------
function stopAllMusic(reset = true) {
    for (const track of Object.values(musicTracks)) {
        track.pause();
        if (reset) {
            try { track.currentTime = 0; } catch (_) { }
        }
    }
    // Detener también los sonidos de los Easter eggs.
    for (const sound of Object.values(easterEggSounds)) {
        sound.pause();

        if (reset) {
            try {
                sound.currentTime = 0;
            } catch (_) { }
        }
    }
}

// ------------------------------------------------------------
// DETERMINAR QUÉ MÚSICA CORRESPONDE A LA PANTALLA ACTUAL
// ------------------------------------------------------------
function getMusicScreen() {
    // Si una partida ha terminado, no reproducimos música de fondo.
    if (typeof gameOver !== 'undefined' && gameOver) return 'OTHER';
    if (typeof isFightOver !== 'undefined' && isFightOver) return 'OTHER';
    if (typeof fightFinished !== 'undefined' && fightFinished) return 'OTHER';
    if (typeof matchOver !== 'undefined' && matchOver) return 'OTHER';

    // Menús principales
    if (gameState === 'MENU') return 'MENU';
    if (gameState === 'MODE_SELECT') return 'MODE_SELECT';
    if (gameState === 'CHARACTER_SELECT') return 'CHARACTER_SELECT';
    if (gameState === 'CREDITS') return 'CREDITS';

    // Entrenamiento: bienvenida y explicación previa al tiro.
    switch (gameState) {
        case 'TRAINING_BRIDGE':
        case 'TRAINING_BRIEFING':
            return 'MODO4_BIENVENIDA';
        case 'TRAINING_SHOOTING_RANGE':
            return 'MODO4_TIRO_DIANA';

        // Batalla espacial
        case 'STARSHIP':
            return 'MODO4_BATALLA_ESPACIAL';

        // Carrera de naves
        case 'STARSHIP_RACE':
            return 'MODO4_BATALLA_ESPACIAL';

        // Holodeck: cuatro niveles, diferenciados por trainingCircuitIndex.
        case 'HOLODECK':
            switch (trainingCircuitIndex) {
                case 0:
                    return 'MODO4_MARIO_1';
                case 1:
                    return 'MODO4_MARIO_2';
                case 2:
                    return 'MODO4_MARIO_3';
                case 3:
                    return 'MODO4_MARIO_4';
                default:
                    return 'MODO4_MARIO_1';
            }

        // Pruebas posteriores al holodeck.
        case 'INTELLIGENCE_TEST':
        case 'STAR_TREK_TRIVIA':
        case 'KOBAYASHI_MARU':
        case 'TRAINING_COMPLETE':
            return 'MODO4_TEST_FINAL';

        // ComeCocos
        case 'COCO_GAME':
            return 'COCO_GAME';

        // Asteroides
        case 'ASTEROIDES_GAME':
            return 'ASTEROIDES_GAME';

        // Repara núcleo
        case 'NUCLEO_GAME':
            return 'NUCLEO_GAME';

        // Exploración
        case 'EXPLORACION_GAME':
            return 'EXPLORACION_GAME';
    }

    // Combate normal y modo historia: música según arena.
    if (gameState === 'FIGHT' || gameState === 'STORY_FIGHT') {
        switch (currentArena) {
            case 1: return 'ARENA_1_PUENTE';
            case 2: return 'ARENA_2_DS9';
            case 3: return 'ARENA_3_KLINGON';
            case 4: return 'ARENA_4_ROMULUS';
            case 5: return 'ARENA_5_INGENIERIA';
            case 6: return 'ARENA_6_PASILLO_BORG';
            case 7: return 'ARENA_7_SALA_TRANSPORTADOR';
            case 8: return 'ARENA_8_PLANETA_TALOS';
            case 9: return 'ARENA_9_DESIERTO_REMOTO';
            case 10: return 'ARENA_10_RUINAS_ANTIGUAS';
            case 11: return 'ARENA_11_ACADEMIA_FEDERACION';
            case 12: return 'ARENA_12_HANGAR_LANZADERAS';
            case 13: return 'ARENA_13_ASTEROIDES';
            case 14: return 'ARENA_14_SELVA_EXOTICA';
            case 15: return 'ARENA_15_OBSERVATORIO_ESTELAR';
            case 16: return 'ARENA_16_PUENTE_DANADO';
            case 17: return 'ARENA_17_ESTACION_ORBITAL';
            case 18: return 'ARENA_18_TEMPLO_BORG';
            case 19: return 'ARENA_19_NUCLEO_BORG';
        }
    }
    return 'OTHER';
}

// ------------------------------------------------------------
// REPRODUCIR LA MÚSICA CORRESPONDIENTE AL ESTADO ACTUAL
// ------------------------------------------------------------
async function playTrackForCurrentScreen() {
    if (musicMuted || !audioUnlocked) return;

    // Si salimos de un Easter egg, detener su sonido.
    for (const sound of Object.values(easterEggSounds)) {
        sound.pause();
        try {
            sound.currentTime = 0;
        } catch (_) { }
    }

    const desiredState = getMusicScreen();

    // Selección directa desde el objeto, eliminando el operador ternario gigante
    const track = musicTracks[desiredState] || null;

    // Detener todas las pistas excepto la que corresponde a la pantalla.
    for (const candidate of Object.values(musicTracks)) {
        if (candidate !== track) {
            candidate.pause();
            try {
                candidate.currentTime = 0;
            } catch (_) {
                // Ignorar si el audio todavía no está preparado.
            }
        }
    }

    if (!track) return;

    try {
        await track.play();
        if (musicButton && !musicMuted) {
            const labels = {
                MENU: '🔊 Música del menú',
                MODE_SELECT: '🔊 Selección de modo',
                CHARACTER_SELECT: '🔊 Selección de personaje',
                CREDITS: '🔊 Música de créditos',

                ARENA_1_PUENTE: '🔊 Arena 1: puente',
                ARENA_2_DS9: '🔊 Arena 2: DS9',
                ARENA_3_KLINGON: '🔊 Arena 3: Klingon',
                ARENA_4_ROMULUS: '🔊 Arena 4: Rómulus',
                ARENA_5_INGENIERIA: '🔊 Arena 5: Ingeniería',
                ARENA_6_PASILLO_BORG: '🔊 Arena 6: Pasillo Borg',
                ARENA_7_SALA_TRANSPORTADOR: '🔊 Arena 7: Transportador',
                ARENA_8_PLANETA_TALOS: '🔊 Arena 8: Talos IV',
                ARENA_9_DESIERTO_REMOTO: '🔊 Arena 9: Desierto remoto',
                ARENA_10_RUINAS_ANTIGUAS: '🔊 Arena 10: Ruinas antiguas',
                ARENA_11_ACADEMIA_FEDERACION: '🔊 Arena 11: Academia',
                ARENA_12_HANGAR_LANZADERAS: '🔊 Arena 12: Hangar',
                ARENA_13_ASTEROIDES: '🔊 Arena 13: Asteroides',
                ARENA_14_SELVA_EXOTICA: '🔊 Arena 14: Selva exótica',
                ARENA_15_OBSERVATORIO_ESTELAR: '🔊 Arena 15: Observatorio',
                ARENA_16_PUENTE_DANADO: '🔊 Arena 16: Puente dañado',
                ARENA_17_ESTACION_ORBITAL: '🔊 Arena 17: Estación orbital',
                ARENA_18_TEMPLO_BORG: '🔊 Arena 18: Templo Borg',
                ARENA_19_NUCLEO_BORG: '🔊 Arena 19: Núcleo Borg',

                MODO4_BIENVENIDA: '🔊 Modo 4: bienvenida',
                MODO4_TIRO_DIANA: '🔊 Modo 4: tiro a la diana',
                MODO4_CARRERA: '🔊 Modo 4: carrera',
                MODO4_BATALLA_ESPACIAL: '🔊 Modo 4: batalla espacial',
                MODO4_MARIO_1: '🔊 Holodeck: nivel 1',
                MODO4_MARIO_2: '🔊 Holodeck: nivel 2',
                MODO4_MARIO_3: '🔊 Holodeck: nivel 3',
                MODO4_MARIO_4: '🔊 Holodeck: nivel 4',
                MODO4_TEST_FINAL: '🔊 Evaluación del entrenamiento',

                COCO_GAME: '🔊 Música de ComeCocos',

                ASTEROIDES_GAME: '🔊 Música de Asteroides',

                NUCLEO_GAME: '🔊 Música de Núcleo',

                EXPLORACION_GAME: '🔊 Música de Exploración'
            };
            musicButton.textContent = labels[desiredState] || '🔊 Música automática';
            musicButton.style.borderColor = '#7CFC00';
        }
    } catch (error) {
        console.warn('No se pudo iniciar la pista de audio:', track.currentSrc, error);
        if (musicButton) musicButton.textContent = '▶ Pulsa para activar la música';
    }
}

// ------------------------------------------------------------
// SINCRONIZACIÓN AUTOMÁTICA
// Esta función debe llamarse desde gameLoop().
// ------------------------------------------------------------
function syncMenuMusic() {
    // Los Easter eggs necesitan identificarse por su estado real,
    // porque getMusicScreen() los clasifica como OTHER.
    const isEasterEgg = Object.prototype.hasOwnProperty.call(
        easterEggSounds,
        gameState
    );

    const desiredState = isEasterEgg
        ? gameState
        : getMusicScreen();

    // No repetir el sonido ni reiniciar la música cada fotograma.
    if (desiredState === lastMusicState) return;

    lastMusicState = desiredState;

    // Easter egg: detener la música y reproducir el sonido una vez.
    if (isEasterEgg) {
        stopAllMusic(true);

        if (musicMuted || !audioUnlocked) return;

        const sound = easterEggSounds[desiredState];

        sound.currentTime = 0;

        sound.play().catch(error => {
            console.warn(
                'No se pudo reproducir el sonido del Easter egg:',
                desiredState,
                error
            );
        });

        if (musicButton) {
            const labels = {
                TRIBBLES_EASTER_EGG: '🔊 Easter egg: Tribbles',
                SPOCK_EASTER_EGG: '🔊 Easter egg: Spock',
                EEN_EASTER_EGG: '🔊 Easter egg: EEN',
                DS9_EASTER_EGG: '🔊 Easter egg: DS9'
            };

            musicButton.textContent = labels[desiredState];
        }

        return;
    }

    // Pantallas sin música: detener las pistas.
    if (desiredState === 'OTHER') {
        stopAllMusic(true);

        if (musicButton && !musicMuted) {
            musicButton.textContent = '🔊 Música automática: activada';
        }

        return;
    }

    // Pantallas normales: reproducir su música correspondiente.
    playTrackForCurrentScreen();
}

// ------------------------------------------------------------
// Registro de errores para las pistas de audio de forma optimizada
// ------------------------------------------------------------
for (const track of Object.values(musicTracks)) {
    track.addEventListener('error', () => {
        const filename = track.src.split('/').pop(); // Extrae 'intro.mp3', etc., automáticamente
        console.error('No se pudo cargar assets/audios/' + filename, track.currentSrc, track.error);
        if (musicButton) musicButton.textContent = '⚠ Error: ' + filename;
    });
}

// ------------------------------------------------------------
// DESBLOQUEAR AUDIO CON LA PRIMERA INTERACCIÓN DEL USUARIO
// ------------------------------------------------------------
function unlockAudioFromGesture() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    playTrackForCurrentScreen();
}


document.addEventListener('pointerdown', unlockAudioFromGesture, true);
document.addEventListener('keydown', unlockAudioFromGesture, true);


// ------------------------------------------------------------
// REPRODUCIR EFECTOS DE SONIDO PUNTUALES
// No usar esta función para música de fondo.
// ------------------------------------------------------------
function playSound(soundObject) {
    if (!soundObject) return;

    const soundClone = soundObject.cloneNode();
    soundClone.volume = soundObject.volume;

    soundClone.play().catch(error => {
        console.log(
            'El navegador bloqueó la reproducción del sonido:',
            error
        );
    });
}
