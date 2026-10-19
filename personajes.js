

class Character {
    constructor({
        id = 0,
        name,
        guardImg,
        punchImg,
        role,
        damage = 7,
        attackRange = 110,
        attackDuration = 18,
        movementSpeed = 5,
        width = 340,
        height = 600,
        // Propiedades especiales opcionales (con valores por defecto si no las tienen)
        victoryImg = null,
        extraGuardImg = null,
        extraPunchImg = null,
        extraDamage = 0,
        extraAttackRange = 0,
        extraAttackDuration = 0,
        extraAttackCooldown = 0,
        extraKnockback = 0,
        kickImg = null,
        kickDamage = 0,
        kickAttackRange = 0,
        kickAttackDuration = 0,
        kickAttackCooldown = 0,
        kickKnockback = 0
    }) {
        this.id = id,
        this.name = name;
        this.guardImg = guardImg;
        this.punchImg = punchImg;
        this.role = role;
        this.damage = damage;
        this.attackRange = attackRange;
        this.attackDuration = attackDuration;
        this.movementSpeed = movementSpeed;
        this.width = width;
        this.height = height;
        // Habilidades especiales
        this.victoryImg = victoryImg,
        this.extraGuardImg = extraGuardImg;
        this.extraPunchImg = extraPunchImg;
        this.extraDamage = extraDamage;
        this.extraAttackRange = extraAttackRange;
        this.extraAttackDuration = extraAttackDuration;
        this.extraAttackCooldown = extraAttackCooldown;
        this.extraKnockback = extraKnockback;
        this.kickImg = kickImg;
        this.kickDamage = kickDamage;
        this.kickAttackRange = kickAttackRange;
        this.kickAttackDuration = kickAttackDuration;
        this.kickAttackCooldown = kickAttackCooldown;
        this.kickKnockback = kickKnockback;
    }
}

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
    return loadImageWithFallback(
        [
            `assets/${filename}`,
            filename,
            `../assets/${filename}`,
            `../${filename}`,
            `../../assets/${filename}`
        ],
        filename
    );
}



// Imagenes de los personajes
// Kirk
const kirkGuard = loadImage('assets/kirk_guard.png');
const kirkPunch = loadImage('assets/kirk_punch.png');
// Spock
const spockGuard = loadImage('assets/spok_guard.png');
const spockPunch = loadImage('assets/spok_punch.png');
// Uhura
const ohuraGuard = loadImage('assets/ohura_guard.png');
const ohuraKick = loadImage('assets/ohura_kick.png');
// Sulu
const suluGuard = loadImage('assets/sulu_guard.png');
const suluThrust = loadImage('assets/sulu_thrust.png');
// McCoy
const mccoyGuard = loadImage('assets/mccoy_guard.png');
const mccoyPunch = loadImage('assets/mccoy_punch.png');
// scotty
const scottyGuard = loadImage('assets/scotty_guard.png');
const scottyPunch = loadImage('assets/scotty_punch.png');
// Jordi
const jordiGuard = loadImage('assets/jordi_guard.png');
const jordiKick = loadImage('assets/jordi_kick.png');
// Marina
const marinaGuard = loadImage('assets/marina_guard.png');
const marinaKick = loadImage('assets/marina_kick.png');
// Khan
const kanImage = loadImage('assets/khan_guard.png');
const khanPunch = loadImage('assets/khan_punch.png');
// Picard
const picardGuard = loadImage('assets/picard_guard.png');
const picardKick = loadImage('assets/picard_kick.png');
const picardVictoryImg = loadImage('assets/picard_flute.png');
// Riker tiene guardia y golpe normales, ademÃ¡s de dos poses con silla.
const rikerGuard = loadImage('assets/ricker_guard.png');
const rikerPunch = loadImage('assets/ricker_kick.png');
const rikerChairGuard = loadProjectAsset('ricker_silla_guard.png');
const rikerChairPunch = loadProjectAsset('ricker_silla_punch.png');
// DATA: androide de la Flota Estelar, con guardia y ataque normales.
const dataGuard = loadProjectAsset('data_guard.png');
const dataPunch = loadProjectAsset('data_punch.png');
// WORF: guardia y ataque normal.
const worfGuard = loadProjectAsset('worf_guard.png');
const worfPunch = loadProjectAsset('worf_punch.png');
// LAFORGE: guardia, ataque normal y patada especial.
const laforgeGuard = loadProjectAsset('laforge_guard.png');
const laforgePunch = loadProjectAsset('laforge_punch.png');
const laforgeKick = loadProjectAsset('laforge_kick.png');
// CHEKOV: guardia y ataque normal.
const chekovGuard = loadProjectAsset('chekov_guard.png');
const chekovPunch = loadProjectAsset('chekov_punch.png');
// GORN: guardia y ataque normal.
const gornGuard = loadProjectAsset('gorn_guard.png');
const gornPunch = loadProjectAsset('gorn_punch.png');
// TASHA YAR: jefa de seguridad; sprites propios opcionales en assets/.
const tashaGuard = loadProjectAsset('tasha_guard.png');
const tashaPunch = loadProjectAsset('tasha_punch.png');
// Seven of Nine
const sevenGuard = loadImage('assets/seven_guard.png');
const sevenKick = loadImage('assets/seven_kick.png');
const sevenVictory = loadImage('assets/seven_victory.png');
// Locutus de Borg
const locutusGuard = loadImage('assets/locutus_guard.png');
const locutusPunch = loadImage('assets/locutus_punch.png');
// Andreu
const andreuGuard = loadImage('assets/andreu_guard.png');
const andreuPunch = loadImage('assets/andreu_kick.png');
// Jesús
const jesusGuard = loadImage('assets/jesus_guard.png');
const jesusPunch = loadImage('assets/jesus_kick.png');
// Emilio
const emilioGuard = loadImage('assets/emilio_guard.png');
const emilioPunch = loadImage('assets/emilio_kick.png');
// Ramón
const ramonGuard = loadImage('assets/ramon_guard.png');
const ramonPunch = loadImage('assets/ramon_kick.png');
// Txús
const txusGuard = loadImage('assets/txus_guard.png');
const txusPunch = loadImage('assets/txus_kick.png');


// Y luego creas tu array usando la clase:
const availableCharacters = [
    new Character(
        {
            id: 1,
            name: 'KIRK',
            guardImg: kirkGuard,
            punchImg: kirkPunch,
            role: 'Capitán estelar'
        }
    ),
    new Character(
        {
            id: 2,
            name: 'SPOCK',
            guardImg: spockGuard,
            punchImg: spockPunch,
            role: 'Oficial científico'
        }
    ),
    new Character(
        {
            id: 3,
            name: 'UHURA',
            guardImg: ohuraGuard,
            punchImg: ohuraKick,
            role: 'Oficial de comunicaciones'
        }
    ),
    new Character(
        {
            id: 4,
            name: 'SULU',
            guardImg: suluGuard,
            punchImg: suluThrust,
            role: 'Experto en esgrima'
        }
    ),
    new Character(
        {
            id: 5,
            name: 'MCCOY',
            guardImg: mccoyGuard,
            punchImg: mccoyPunch,
            role: 'Oficial médico jefe'
        }
    ),
    new Character(
        {
            id: 6,
            name: 'SCOTTY',
            guardImg: scottyGuard,
            punchImg: scottyPunch,
            role: 'Ingeniero jefe'
        }
    ),
    new Character(
        {
            id: 7,
            name: 'JORDI',
            guardImg: jordiGuard,
            punchImg: jordiKick,
            role: 'Explorador de la Flota'
        }
    ),
    new Character(
        {
            id: 8,
            name: 'MARINA',
            guardImg: marinaGuard,
            punchImg: marinaKick,
            role: 'Oficial de la Flota'
        }
    ),
    new Character(
        {
            id: 9,
            name: 'KHAN',
            guardImg: kanImage,
            punchImg: khanPunch,
            role: 'Superhumano aumentado',
            damage: 9,
            attackRange: 100,
            attackDuration: 30
        }
    ),
    new Character(
        {
            id: 10,
            name: 'PICARD',
            guardImg: picardGuard,
            punchImg: picardKick,
            victoryImg: picardVictoryImg,
            role: 'Capitán de la Flota Estelar'
        }
    ),
    new Character(
        {
            id: 11,
            name: 'RIKER',
            guardImg: rikerGuard,
            punchImg: rikerPunch,
            extraGuardImg: rikerChairGuard,
            extraPunchImg: rikerChairPunch,
            role: 'Primer oficial de la Flota Estelar',
            extraDamage: 10,
            extraAttackRange: 155,
            extraAttackDuration: 22,
            extraAttackCooldown: 18,
            extraKnockback: 19
        }
    ),
        new Character(
        {
            id: 12,
            name: 'DATA',
            guardImg: dataGuard,
            punchImg: dataPunch,
            role: 'Oficial de operaciones androide',
            damage: 8,
            attackRange: 115
        }
    ),
    new Character(
        {
            id: 13,
            name: 'WORF',
            guardImg: worfGuard,
            punchImg: worfPunch,
            role: 'Oficial de seguridad klingon',
            damage: 9,
            attackRange: 115,
            attackDuration: 20,
            movementSpeed: 4.8
        }
    ),
    new Character(
        {
            id: 14,
            name: 'LAFORGE',
            guardImg: laforgeGuard,
            punchImg: laforgePunch,
            kickImg: laforgeKick,
            role: 'Ingeniero jefe del Enterprise',
            kickDamage: 10,
            kickAttackRange: 145,
            kickAttackDuration: 22,
            kickAttackCooldown: 15,
            kickKnockback: 20
        }
    ),
    new Character(
        {
            id: 15,
            name: 'CHEKOV',
            guardImg: chekovGuard,
            punchImg: chekovPunch,
            role: 'Oficial de navegación',
            attackRange: 112,
            movementSpeed: 5.2
        }
    ),
    new Character(
        {
            id: 16,
            name: 'GORN',
            guardImg: gornGuard,
            punchImg: gornPunch,
            role: 'Guerrero reptiliano',
            damage: 10,
            attackRange: 118,
            attackDuration: 21,
            movementSpeed: 4.2
        }
    ),
    new Character(
        {
            id: 17,
            name: 'TASHA YAR',
            guardImg: tashaGuard,
            punchImg: tashaPunch,
            role: 'Jefa de seguridad del Enterprise-D',
            damage: 8,
            attackRange: 112,
            attackDuration: 16,
            movementSpeed: 5.8
        }
    ),
    new Character(
        {
            id: 18,
            name: 'SEVEN OF NINE',
            guardImg: sevenGuard,
            punchImg: sevenKick,
            victoryImg: sevenVictory,
            role: 'Especialista Borg',
            damage: 8,
            attackRange: 118,
            attackDuration: 15,
            movementSpeed: 5.8,
        },
    ),
    new Character(
        {
            id: 19,
            name: 'LOCUTUS',
            guardImg: locutusGuard,
            punchImg: locutusPunch,
            role: 'Voz del Colectivo Borg',
            damage: 13,
            attackRange: 120,
            attackDuration: 21,
            movementSpeed: 4.5,
            width: 350,
            height: 610
        }
    ),
    new Character(
        {
            id: 20,
            name: 'ANDREU',
            guardImg: andreuGuard,
            punchImg: andreuPunch,
            role: 'Padrino 1',
        }
    ),
    new Character(
        {
            id: 21,
            name: 'JESÚS',
            guardImg: jesusGuard,
            punchImg: jesusPunch,
            role: 'Padrino 2',
         }
    ),
    new Character(
        {
            id: 22,
            name: 'EMILIO',
            guardImg: emilioGuard,
            punchImg: emilioPunch,
            role: 'AKA Anónimo Aguacate',
        }
    ),
    new Character(
        {
            id: 23,
            name: 'RAMON',
            guardImg: ramonGuard,
            punchImg: ramonPunch,
            role: 'Bro 1',
        }
    ), new Character(
        {
            id: 24,
            name: 'TXUS',
            guardImg: txusGuard,
            punchImg: txusPunch,
            role: 'Bro2',
        }
    )
  // ... y así con el resto de personajes
];