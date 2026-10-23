// ------------------------------------------------------------
// ASSETS ORIGINALES: se mantienen los nombres y rutas
// ------------------------------------------------------------
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

// Busca las imágenes tanto dentro de assets/ como junto al HTML/game.js.
// Esto hace que el modo siga funcionando aunque la carpeta del proyecto cambie de nivel.
function loadImageWithFallback(paths, label = paths[0]) {
    const img = new Image();
    let attempt = 0;
    const tryNextPath = () => {
        if (attempt >= paths.length) {
            console.warn(`[STAR TREK] No se pudo cargar ${label}. Rutas probadas: ${paths.join(', ')}`);
            return;
        }
        img.src = paths[attempt++];
    };
    img.onerror = () => tryNextPath();
    tryNextPath();
    return img;
}


function loadProjectAsset(filename) {
    return loadImageWithFallback([
        `assets/${filename}`,
        filename,
        `../assets/${filename}`,
        `../${filename}`,
        `../../assets/${filename}`
    ], filename);
}

const titleScreenImage = loadImage('assets/title_screen.png');

const qTalkImage = loadProjectAsset('q_talk.png');

const eenImage = loadImage('assets/een_logo.jpg');

const ds9Image = loadImage('assets/ds9_logo.jpg');

// Assets del minijuego Galileo. Coloca los tres PNG en la carpeta assets.
const galileoIntacta = loadImage('assets/galileo_intacta.png');
const galileoDanada = loadImage('assets/galileo_danada.png');
const galileoDestruida = loadImage('assets/galileo_destruida.png');
// Fondo exclusivo del minijuego de destrucción de la Galileo.
const shuttleHangarBackground = loadImage('assets/shuttle_hangar.png');

// Sprites del modo de pilotaje espacial (añádelos a la carpeta assets).
const enterprisePilotImage = loadProjectAsset('enterprise_pilot.png');
const starshipAttackersImage = loadProjectAsset('atacantes.png');

// ------------------------------------------------------------
// 19 ARENAS DE LA CAMPAÑA
// Las imágenes deben estar en la carpeta assets.
// ------------------------------------------------------------
const arenaImages = [
    loadImage('assets/arena_1_puente.png'),
    loadImage('assets/arena_2_ds9.png'),
    loadImage('assets/arena_3_klingon.png'),
    loadImage('assets/arena_4_romulus.png'),
    loadImage('assets/arena_5_ingenieria_enterprise.png'),
    loadImage('assets/arena_6_pasillo_borg.png'),
    loadImage('assets/arena_7_sala_transportador.png'),
    loadImage('assets/arena_8_planeta_talos.png'),
    loadImage('assets/arena_9_desierto_remoto.png'),
    loadImage('assets/arena_10_ruinas_antiguas.png'),
    loadImage('assets/arena_11_academia_federacion.png'),
    loadImage('assets/arena_12_hangar_lanzaderas.png'),
    loadImage('assets/arena_13_asteroides.png'),
    loadImage('assets/arena_14_selva_exotica.png'),
    loadImage('assets/arena_15_observatorio_estelar.png'),
    loadImage('assets/arena_16_puente_danado.png'),
    loadImage('assets/arena_17_estacion_orbital.png'),
    loadImage('assets/arena_18_templo_borg.png'),
    loadImage('assets/arena_19_nucleo_borg.png'),
];

const arenaNames = [
    'Puente de la U.S.S. Enterprise',
    'Estación Espacial 9',
    'Nave Klingon',
    'Terraza Romulana',
    'Ingeniería de la Enterprise',
    'Pasillo Borg',
    'Sala del Transportador',
    'Planeta Talos IV',
    'Desierto Remoto',
    'Ruinas Antiguas',
    'Academia de la Federación',
    'Hangar de Lanzaderas',
    'Cinturón de Asteroides',
    'Selva Exótica',
    'Observatorio Estelar',
    'Puente Dañado',
    'Estación Orbital',
    'Templo Borg',
    'Núcleo Borg',
];


const TOTAL_ARENAS = arenaImages.length;
const TOTAL_MISIONES = 19; // Una arena por personaje; Khan penúltimo y Locutus final.

// Cada arena tiene su propio enfrentamiento.
// Los índices corresponden a availableCharacters:
// 0 KIRK, 1 SPOCK, 2 UHURA, 3 SULU, 4 MCCOY,
// 5 SCOTTY, 6 JORDI, 7 MARINA, 8 KAN, 9 PICARD,
// 10 RIKER, 11 DATA, 12 WORF, 13 LAFORGE, 14 CHEKOV,
// 15 GORN, 16 TASHA YAR, 17 SEVEN OF NINE, 18 LOCUTUS,
// 19 ANDREU, 20 JESÚS, 21 EMILIO, 22 RAMON, 23 TXUS.
const arenaCombatants = [
    [availableCharacters[0].id, availableCharacters[1].id],   // Misión 1: Kirk vs Spock
    [availableCharacters[2].id, availableCharacters[3].id],   // Misión 2: Uhura vs Sulu
    [availableCharacters[4].id, availableCharacters[5].id],   // Misión 3: McCoy vs Scotty
    [availableCharacters[6].id, availableCharacters[7].id],   // Misión 4: Jordi vs Marina
    [availableCharacters[8].id, availableCharacters[10].id],  // Misión 5: Khan vs Riker
    [availableCharacters[10].id, availableCharacters[11].id], // Misión 6: Riker vs Data
    [availableCharacters[12].id, availableCharacters[13].id], // Misión 7: Worf vs Laforge
    [availableCharacters[14].id, availableCharacters[15].id], // Misión 8: Chekov vs Gorn
    [availableCharacters[16].id, availableCharacters[0].id],  // Misión 9: Tasha Yar vs Kirk
    [availableCharacters[1].id, availableCharacters[2].id],   // Misión 10: Spock vs Uhura
    [availableCharacters[3].id, availableCharacters[4].id],   // Misión 11: Sulu vs McCoy
    [availableCharacters[17].id, availableCharacters[6].id],  // Misión 12: Seven of Nine vs Jordi
    [availableCharacters[7].id, availableCharacters[10].id],  // Misión 13: Marina vs Riker
    [availableCharacters[11].id, availableCharacters[12].id], // Misión 14: Data vs Worf
    [availableCharacters[13].id, availableCharacters[14].id], // Misión 15: Laforge vs Chekov
    [availableCharacters[15].id, availableCharacters[3].id],  // Misión 16: Gorn vs Sulu
    [availableCharacters[4].id, availableCharacters[8].id],   // Misión 17: McCoy vs Khan
    [availableCharacters[8].id, availableCharacters[17].id],  // Misión 18: Khan vs Seven of Nine
    [availableCharacters[9].id, availableCharacters[18].id],  // Misión 19: Picard vs Locutus (¡Gran final de campaña!)
];
