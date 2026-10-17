// ============================================================
// GESTIÓN DE MÚSICA CENTRALIZADA
// ============================================================

// Precargamos el sonido del golpe
const hitSound1 = new Audio('assets/audios/hit1.mp3'); // Cambia la ruta por la de tu archivo mp3
hitSound1.volume = 0.6; // Opcional: ajusta el volumen (de 0.0 a 1.0)
const hitSound2 = new Audio('assets/audios/hit2.mp3'); // Cambia la ruta por la de tu archivo mp3
hitSound2.volume = 0.6; // Opcional: ajusta el volumen (de 0.0 a 1.0)


// Función auxiliar para inicializar pistas con las propiedades comunes
function createAudioTrack(filename) {
    const audio = new Audio(`./assets/audios/${filename}`);
    audio.loop = true;
    audio.volume = 0.55;
    audio.preload = 'auto';
    return audio;
}

// Objeto que almacena todas las pistas de música indexadas por estado/arena
const musicTracks = {
    MENU: createAudioTrack('intro.mp3'),
    MODE_SELECT: createAudioTrack('mode.mp3'),
    CHARACTER_SELECT: createAudioTrack('selection.mp3'),
    CREDITS: createAudioTrack('ending.mp3'),
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
    ARENA_19_NUCLEO_BORG: createAudioTrack('arena_19_nucleo_borg.mp3')
};

// Aliases individuales por si alguna otra parte del juego busca estas variables globales
const {
    MENU: menuMusic,
    MODE_SELECT: modeMusic,
    CHARACTER_SELECT: selectionMusic,
    CREDITS: endingMusic,
    ARENA_1_PUENTE: arena1Music,
    ARENA_2_DS9: arena2Music,
    ARENA_3_KLINGON: arena3Music,
    ARENA_4_ROMULUS: arena4Music,
    ARENA_5_INGENIERIA: arena5Music,
    ARENA_6_PASILLO_BORG: arena6Music,
    ARENA_7_SALA_TRANSPORTADOR: arena7Music,
    ARENA_8_PLANETA_TALOS: arena8Music,
    ARENA_9_DESIERTO_REMOTO: arena9Music,
    ARENA_10_RUINAS_ANTIGUAS: arena10Music,
    ARENA_11_ACADEMIA_FEDERACION: arena11Music,
    ARENA_12_HANGAR_LANZADERAS: arena12Music,
    ARENA_13_ASTEROIDES: arena13Music,
    ARENA_14_SELVA_EXOTICA: arena14Music,
    ARENA_15_OBSERVATORIO_ESTELAR: arena15Music,
    ARENA_16_PUENTE_DANADO: arena16Music,
    ARENA_17_ESTACION_ORBITAL: arena17Music,
    ARENA_18_TEMPLO_BORG: arena18Music,
    ARENA_19_NUCLEO_BORG: arena19Music
} = musicTracks;

let musicButton = null;
let lastMusicState = null;
let audioUnlocked = false;
let musicMuted = false;

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
        await playTrackForCurrentScreen();
    });
    document.body.appendChild(musicButton);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureMusicButton, { once: true });
} else {
    ensureMusicButton();
}

function stopAllMusic(reset = true) {
    for (const track of Object.values(musicTracks)) {
        track.pause();
        if (reset) {
            try { track.currentTime = 0; } catch (_) { }
        }
    }
}

function stopAllGameMusic() {
    for (const track of Object.values(musicTracks)) {
        track.pause();
        track.currentTime = 0;
    }
}

function getMusicScreen() {
    if (gameOver) return 'OTHER';
    if (typeof isFightOver !== 'undefined' && isFightOver) return 'OTHER';
    if (typeof fightFinished !== 'undefined' && fightFinished) return 'OTHER';
    if (typeof matchOver !== 'undefined' && matchOver) return 'OTHER';
    if (gameState === 'MENU') return 'MENU';
    if (gameState === 'MODE_SELECT') return 'MODE_SELECT';
    if (gameState === 'CHARACTER_SELECT') return 'CHARACTER_SELECT';
    if (gameState === 'CREDITS') return 'CREDITS';

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

async function playTrackForCurrentScreen() {
    if (musicMuted || !audioUnlocked) return;
    const desiredState = getMusicScreen();

    // Selección directa desde el objeto, eliminando el operador ternario gigante
    const track = musicTracks[desiredState] || null;

    // Pausar el resto de pistas de forma limpia
    for (const candidate of Object.values(musicTracks)) {
        if (candidate !== track) {
            candidate.pause();
            try { candidate.currentTime = 0; } catch (_) { }
        }
    }

    if (!track) return;
    try {
        await track.play();
        if (musicButton && !musicMuted) {
            const labels = {
                MENU: '🔊 Música del menú',
                MODE_SELECT: '🔊 Música selección de modo',
                CHARACTER_SELECT: '🔊 Música selección',
                CREDITS: '🔊 Música de créditos',
                ARENA_1_PUENTE: '🔊 Música arena 1: puente',
                ARENA_2_DS9: '🔊 Música arena 2: DS9',
                ARENA_3_KLINGON: '🔊 Música arena 3: Klingon',
                ARENA_4_ROMULUS: '🔊 Música arena 4: Rómulus',
                ARENA_5_INGENIERIA: '🔊 Música arena 5: Ingeniería',
                ARENA_6_PASILLO_BORG: '🔊 Música arena 6: Pasillo Borg',
                ARENA_7_SALA_TRANSPORTADOR: '🔊 Música arena 7: Transportador',
                ARENA_8_PLANETA_TALOS: '🔊 Música arena 8: Talos IV',
                ARENA_9_DESIERTO_REMOTO: '🔊 Música arena 9: Desierto remoto',
                ARENA_10_RUINAS_ANTIGUAS: '🔊 Música arena 10: Ruinas antiguas',
                ARENA_11_ACADEMIA_FEDERACION: '🔊 Música arena 11: Academia federación',
                ARENA_12_HANGAR_LANZADERAS: '🔊 Música arena 12: Hangar lanzaderas',
                ARENA_13_ASTEROIDES: '🔊 Música arena 13: Asteroides',
                ARENA_14_SELVA_EXOTICA: '🔊 Música arena 14: Selva exótica',
                ARENA_15_OBSERVATORIO_ESTELAR: '🔊 Música arena 15: Observatorio estelar',
                ARENA_16_PUENTE_DANADO: '🔊 Música arena 16: Puente dañado',
                ARENA_17_ESTACION_ORBITAL: '🔊 Música arena 17: Estación orbital',
                ARENA_18_TEMPLO_BORG: '🔊 Música arena 18: Templo Borg',
                ARENA_19_NUCLEO_BORG: '🔊 Música arena 19: Núcleo Borg',
            };
            musicButton.textContent = labels[desiredState] || '🔊 Música automática';
            musicButton.style.borderColor = '#7CFC00';
        }
    } catch (error) {
        console.warn('No se pudo iniciar la pista de audio:', track.currentSrc, error);
        if (musicButton) musicButton.textContent = '▶ Pulsa para activar la música';
    }
}

function syncMenuMusic() {
    const desiredState = getMusicScreen();
    if (desiredState === lastMusicState) return;
    lastMusicState = desiredState;
    if (desiredState === 'OTHER') {
        stopAllMusic(true);
        if (musicButton && !musicMuted) musicButton.textContent = '🔊 Música automática: activada';
        return;
    }
    playTrackForCurrentScreen();
}

// Registro de errores para las pistas de audio de forma optimizada
for (const track of Object.values(musicTracks)) {
    track.addEventListener('error', () => {
        const filename = track.src.split('/').pop(); // Extrae 'intro.mp3', etc., automáticamente
        console.error('No se pudo cargar assets/audios/' + filename, track.currentSrc, track.error);
        if (musicButton) musicButton.textContent = '⚠ Error: ' + filename;
    });
}

function unlockAudioFromGesture() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    playTrackForCurrentScreen();
}



// Sonido del golpe
function playHitSound(soundObject) {
    if (!soundObject) return;

    // Clonamos el objeto recibido para permitir superposición sin cortar el audio
    const soundClone = soundObject.cloneNode();
    soundClone.volume = soundObject.volume;

    soundClone.play().catch(error => {
        console.log("El navegador bloqueó la reproducción automática:", error);
    });
}



document.addEventListener('pointerdown', unlockAudioFromGesture, true);
document.addEventListener('keydown', unlockAudioFromGesture, true);
