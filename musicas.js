// Música automática por pantalla: menú, selección de combatientes y créditos.
// La primera interacción del usuario desbloquea el audio en los navegadores.
const menuMusic = new Audio('./assets/audios/intro.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.55;
menuMusic.preload = 'auto';

const modeMusic = new Audio('./assets/audios/mode.mp3');
modeMusic.loop = true;
modeMusic.volume = 0.55;
modeMusic.preload = 'auto';

const selectionMusic = new Audio('./assets/audios/selection.mp3');
selectionMusic.loop = true;
selectionMusic.volume = 0.55;
selectionMusic.preload = 'auto';

const endingMusic = new Audio('./assets/audios/ending.mp3');
endingMusic.loop = true;
endingMusic.volume = 0.55;
endingMusic.preload = 'auto';

const arena1Music = new Audio('./assets/audios/arena_1_puente.mp3');
arena1Music.loop = true;
arena1Music.volume = 0.55;
arena1Music.preload = 'auto';

const arena2Music = new Audio('./assets/audios/arena_2_ds9.mp3');
arena2Music.loop = true;
arena2Music.volume = 0.55;
arena2Music.preload = 'auto';

const arena3Music = new Audio('./assets/audios/arena_3_klingon.mp3');
arena3Music.loop = true;
arena3Music.volume = 0.55;
arena3Music.preload = 'auto';

const arena4Music = new Audio('./assets/audios/arena_4_romulus.mp3');
arena4Music.loop = true;
arena4Music.volume = 0.55;
arena4Music.preload = 'auto';

const arena5Music = new Audio('./assets/audios/arena_5_ingenieria.mp3');
arena5Music.loop = true;
arena5Music.volume = 0.55;
arena5Music.preload = 'auto';

const arena6Music = new Audio('./assets/audios/arena_6_pasillo_borg.mp3');
arena6Music.loop = true;
arena6Music.volume = 0.55;
arena6Music.preload = 'auto';

const arena7Music = new Audio('./assets/audios/arena_7_sala_transportador.mp3');
arena7Music.loop = true;
arena7Music.volume = 0.55;
arena7Music.preload = 'auto';

const arena9Music = new Audio('./assets/audios/arena_9_desierto_remoto.mp3');
arena9Music.loop = true;
arena9Music.volume = 0.55;
arena9Music.preload = 'auto';

let musicButton;
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
  for (const track of [menuMusic, modeMusic, selectionMusic, endingMusic, arena1Music, arena2Music, arena3Music, arena4Music, arena5Music, arena6Music, arena7Music, arena9Music]) {
    track.pause();
    if (reset) {
      try { track.currentTime = 0; } catch (_) {}
    }
  }
}

function stopAllGameMusic() {
  for (const track of [menuMusic, modeMusic, selectionMusic, endingMusic, arena1Music, arena2Music, arena3Music, arena4Music, arena5Music, arena6Music, arena7Music, arena9Music]) {
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
  if ((gameState === 'FIGHT' || gameState === 'STORY_FIGHT') && currentArena === 1) return 'ARENA_1_PUENTE';
  if ((gameState === 'FIGHT' || gameState === 'STORY_FIGHT') && currentArena === 2) return 'ARENA_2_DS9';
  if ((gameState === 'FIGHT' || gameState === 'STORY_FIGHT') && currentArena === 3) return 'ARENA_3_KLINGON';
  if ((gameState === 'FIGHT' || gameState === 'STORY_FIGHT') && currentArena === 4) return 'ARENA_4_ROMULUS';
  if ((gameState === 'FIGHT' || gameState === 'STORY_FIGHT') && currentArena === 5) return 'ARENA_5_INGENIERIA';
  if ((gameState === 'FIGHT' || gameState === 'STORY_FIGHT') && currentArena === 6) return 'ARENA_6_PASILLO_BORG';
  if ((gameState === 'FIGHT' || gameState === 'STORY_FIGHT') && currentArena === 7) return 'ARENA_7_SALA_TRANSPORTADOR';
  if ((gameState === 'FIGHT' || gameState === 'STORY_FIGHT') && currentArena === 9) return 'ARENA_9_DESIERTO_REMOTO';
  return 'OTHER';
}

async function playTrackForCurrentScreen() {
  if (musicMuted || !audioUnlocked) return;
  const desiredState = getMusicScreen();
  const track = desiredState === 'MENU' ? menuMusic
    : desiredState === 'MODE_SELECT' ? modeMusic
    : desiredState === 'CHARACTER_SELECT' ? selectionMusic
    : desiredState === 'CREDITS' ? endingMusic
    : desiredState === 'ARENA_1_PUENTE' ? arena1Music
    : desiredState === 'ARENA_2_DS9' ? arena2Music
    : desiredState === 'ARENA_3_KLINGON' ? arena3Music
    : desiredState === 'ARENA_4_ROMULUS' ? arena4Music
    : desiredState === 'ARENA_5_INGENIERIA' ? arena5Music
    : desiredState === 'ARENA_6_PASILLO_BORG' ? arena6Music
    : desiredState === 'ARENA_7_SALA_TRANSPORTADOR' ? arena7Music
    : desiredState === 'ARENA_9_DESIERTO_REMOTO' ? arena9Music : null;

  for (const candidate of [menuMusic, modeMusic, selectionMusic, endingMusic, arena1Music, arena2Music, arena3Music, arena4Music, arena5Music, arena6Music, arena7Music, arena9Music]) {
    if (candidate !== track) {
      candidate.pause();
      try { candidate.currentTime = 0; } catch (_) {}
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
        ARENA_3_KLINGON: '🔊 Música arena 3: Klingon'
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

for (const [track, filename] of [
  [menuMusic, 'intro.mp3'],
  [modeMusic, 'mode.mp3'],
  [selectionMusic, 'selection.mp3'],
  [endingMusic, 'ending.mp3'],
  [arena1Music, 'arena_1_puente.mp3'],
  [arena2Music, 'arena_2_ds9.mp3'],
  [arena3Music, 'arena_3_klingon.mp3'],
  [arena4Music, 'arena_4_romulus.mp3'],
  [arena5Music, 'arena_5_ingenieria.mp3'],
  [arena6Music, 'arena_6_pasillo_borg.mp3'],
  [arena7Music, 'arena_7_sala_transportador.mp3'],
  [arena9Music, 'arena_9_desierto_remoto.mp3']
]) {
  track.addEventListener('error', () => {
    console.error('No se pudo cargar assets/audio/' + filename, track.currentSrc, track.error);
    if (musicButton) musicButton.textContent = '⚠ Error: ' + filename;
  });
}

function unlockAudioFromGesture() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  playTrackForCurrentScreen();
}
document.addEventListener('pointerdown', unlockAudioFromGesture, true);
document.addEventListener('keydown', unlockAudioFromGesture, true);
