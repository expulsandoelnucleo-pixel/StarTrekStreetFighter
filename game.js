'use strict';

// ============================================================
// STAR TREK: EXPULSANDO EL NÚCLEO
// ============================================================
const GAME_FONT = "'StarTrekFont', monospace";
const GAME_FONTDS9 = "'StarTrekDs9', monospace";
const GAME_FONTKLINGON = "'StarTrekKlingon', monospace";
const GAME_FONTROMULAN = "'StarTrekRomulan', monospace";
const GAME_FONTTNG = "'StarTrekTng', monospace";


const canvas = document.getElementById('gameCanvas');
if (!canvas)
    throw new Error('Falta el canvas gameCanvas.');

const ctx = canvas.getContext('2d');
if (!ctx)
    throw new Error('No se pudo crear el contexto 2D.');

if (canvas.width < 1)
    canvas.width = 800;
if (canvas.height < 1)
    canvas.height = 450;

function nextArena() {
    currentArena = currentArena >= TOTAL_ARENAS
        ? 1
        : currentArena + 1;
    setArenaCombatants(currentArena);
}

function previousArena() {
    currentArena = currentArena <= 1
        ? TOTAL_ARENAS
        : currentArena - 1;
    setArenaCombatants(currentArena);
}

// ------------------------------------------------------------
// JUGADORES Y ESTADO
// ------------------------------------------------------------

const floorY = 60;
const BASE_HEIGHT = 600;
const keys = Object.create(null);

function makePlayer(x, charIndex, facing) {
    return {
        x,
        y: floorY,
        width: 340,
        height: 600,
        speed: 5,
        vy: 0,
        jumpForce: -12,
        gravity: 0.6,
        health: 100,
        maxHealth: 100,
        energy: 100,
        maxEnergy: 100,
        isAttacking: false,
        attackTimer: 0,
        attackCooldown: 0,
        attackStyle: 'normal',
        activeAttackDuration: 0,
        hasHitThisAttack: false,
        charIndex,
        name: availableCharacters[charIndex].name,
        facing,
        stunTimer: 0,
        hitFlashTimer: 0,
        hitReactTimer: 0,
        hitReactDirection: 0,
        hitReactStep: 0,
        invulnerabilityTimer: 0,
        comboCount: 0,
        comboTimer: 0,
        comboDisplayTimer: 0
    };
}

const player1 = makePlayer(100, 0, 1);
const player2 = makePlayer(460, 1, -1);

let gameState = 'MENU';
let gameOver = false;

// Easter eggs secretos del menú principal.
const TRIBBLES_SECRET_SEQUENCE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'
];
let easterEggKeySequence = [];
let easterEggLetterBuffer = '';

let qEasterEggActive = false;

// Mostrar al personaje derrotado en el suelo durante 5 segundos antes del rótulo de resultado.
let gameOverFrame = 0;
const GAME_OVER_PAUSE_FRAMES = 5 * 60;

let frameCount = 0;
let matchStartFrame = 0;
let screenShakeTimer = 0;
let impactEffects = [];
let currentArena = 1;
let matchTimeLeft = 120;
let timeText = '02:00';
let roundWinnerMessage = '';
let roundWinnerHasTwoLines = false;
let picardVictory = false;
let matchStartDelay = 0;

// Juicio final de Q: desafío táctico para expulsar el núcleo a tiempo.
let qTrialTimer = 60;
let qTrialPower = 3;
let qTrialStability = 0;
let qTrialStep = 0;
let qTrialMessage = '';
let qTrialOutcome = '';
let qTrialFrame = 0;
let qTrialResultFrame = 0;

let isStoryMode = false;
let isVsMachine = false;
let humanPlayerIndex = 1;
let machineDifficulty = 'NORMAL';
let machineAttackCooldown = 0;
let machineJumpCooldown = 0;
let storyPhase = 1;

let campaignAttempts = 3;
let campaignCompleted = false;
let campaignFailed = false;
let campaignEndFrame = 0;
// Final alternativo de historia: solo para quien complete la campaña como Picard.
let picardNexusStep = 0;

// Modo historia: 10 segundos para decidir si reintentar inmediatamente tras perder.
let storyDefeatCountdownStart = 0;
const STORY_DEFEAT_COUNTDOWN_FRAMES = 10 * 60;
let storyDefeatAttemptCounted = false;

// Cada misión de historia se decide al mejor de tres combates.
let storySeriesHumanWins = 0;
let storySeriesMachineWins = 0;
let storySeriesRoundsPlayed = 0;
let storySeriesHumanHealthTotal = 0;
let storySeriesMachineHealthTotal = 0;
let storyRoundRecorded = false;

// Bonus arcade independiente de las 19 misiones de historia.
let shuttleMaxHealth = 300;
let shuttleHealth = 300;
let shuttleTimer = 60 * 60;
let shuttleHits = 0;
let shuttlePlayerPunchTimer = 0;
// Posición independiente del personaje seleccionado durante el minijuego.
let shuttlePlayerX = 64;
let shuttlePlayerY = null;
let shuttleResult = '';
let shuttleResultTimer = 0;
let shuttleSparks = [];
let shuttleBonus = 0;
// Fase narrativa exacta a la que se debe volver tras el bonus de lanzadera.
let shuttleResumeStoryPhase = null;

// Modo entrenamiento: puente, combate espacial, holodeck, razonamiento y Preguntas Trekkies.
let starshipGame = null;
let trainingRangeGame = null;
let starshipRaceGame = null;
let trainingDialogueIndex = 0;
const trainingDialogue = [{
        speaker: trainingSpeaker1,
        text: trainingSpeakerText1
    }, {
        speaker: trainingSpeaker2,
        text: trainingSpeakerText2
    }, {
        speaker: trainingSpeaker3,
        text: trainingSpeakerText3
    }
];
let holodeckGame = null;

// Bancos de preguntas: cada sesión mantiene el formato original de cinco preguntas,
// pero selecciona una muestra aleatoria sin repetir dentro de esa sesión.
const intelligenceQuestionBank = [{
        id: 1,
        question: intelligenceQuestQuestion1,
        options: [intelligenceQuestQuestion1Option1, intelligenceQuestQuestion1Option2, intelligenceQuestQuestion1Option3, intelligenceQuestQuestion1Option4],
        answer: 2,
        explanation: intelligenceQuestQuestion1Explanation
    }, {
        id: 2,
        question: intelligenceQuestQuestion2,
        options: [intelligenceQuestQuestion2Option1, intelligenceQuestQuestion2Option2, intelligenceQuestQuestion2Option3, intelligenceQuestQuestion2Option4],
        answer: 1,
        explanation: intelligenceQuestQuestion2Explanation
    }, {
      id: 3,
        question: intelligenceQuestQuestion3,
        options: [intelligenceQuestQuestion3Option1, intelligenceQuestQuestion3Option2, intelligenceQuestQuestion3Option3, intelligenceQuestQuestion3Option4],
        answer: 2,
        explanation: intelligenceQuestQuestion3Explanation
    }, {
      id: 4,
        question: intelligenceQuestQuestion4,
        options: [intelligenceQuestQuestion4Option1, intelligenceQuestQuestion4Option2, intelligenceQuestQuestion4Option3, intelligenceQuestQuestion4Option4],
        answer: 1,
        explanation: intelligenceQuestQuestion4Explanation
    }, {
        id: 5,
        question: intelligenceQuestQuestion5,
        options: [intelligenceQuestQuestion5Option1, intelligenceQuestQuestion5Option2, intelligenceQuestQuestion5Option3, intelligenceQuestQuestion5Option4],
        answer: 2,
        explanation: intelligenceQuestQuestion5Explanation
    }, {
        id: 6,
        question: intelligenceQuestQuestion6,
        options: [intelligenceQuestQuestion6Option1, intelligenceQuestQuestion6Option2, intelligenceQuestQuestion6Option3, intelligenceQuestQuestion6Option4],
        answer: 2,
        explanation: intelligenceQuestQuestion6Explanation
    }, {
        id: 7,
        question: intelligenceQuestQuestion7,
        options: [intelligenceQuestQuestion7Option1, intelligenceQuestQuestion7Option2, intelligenceQuestQuestion7Option3, intelligenceQuestQuestion7Option4],
        answer: 0,
        explanation: intelligenceQuestQuestion7Explanation
    }, {
        id: 8,
        question: intelligenceQuestQuestion8,
        options: [intelligenceQuestQuestion8Option1, intelligenceQuestQuestion8Option2, intelligenceQuestQuestion8Option3, intelligenceQuestQuestion8Option4],
        answer: 1,
        explanation: intelligenceQuestQuestion8Explanation
    }, {
        id: 9,
        question: intelligenceQuestQuestion9,
        options: [intelligenceQuestQuestion9Option1, intelligenceQuestQuestion9Option2, intelligenceQuestQuestion9Option3, intelligenceQuestQuestion9Option4],
        answer: 1,
        explanation: intelligenceQuestQuestion9Explanation
    }, {
        id: 10,
        question: intelligenceQuestQuestion10,
        options: [intelligenceQuestQuestion10Option1, intelligenceQuestQuestion10Option2, intelligenceQuestQuestion10Option3, intelligenceQuestQuestion10Option4],
        answer: 1,
        explanation: intelligenceQuestQuestion10Explanation
    }, {
        id: 11,
        question: intelligenceQuestQuestion11,
        options: [intelligenceQuestQuestion11Option1, intelligenceQuestQuestion11Option2, intelligenceQuestQuestion11Option3, intelligenceQuestQuestion11Option4],
        answer: 3,
        explanation: intelligenceQuestQuestion11Explanation
    }, {
        id: 12,
        question: intelligenceQuestQuestion12,
        options: [intelligenceQuestQuestion12Option1, intelligenceQuestQuestion12Option2, intelligenceQuestQuestion12Option3, intelligenceQuestQuestion12Option4],
        answer: 2,
        explanation: intelligenceQuestQuestion12Explanation
    }, {
        id: 13,
        question: intelligenceQuestQuestion13,
        options: [intelligenceQuestQuestion13Option1, intelligenceQuestQuestion13Option2, intelligenceQuestQuestion13Option3, intelligenceQuestQuestion13Option4],
        answer: 1,
        explanation: intelligenceQuestQuestion13Explanation
    }, {
        id: 14,
        question: intelligenceQuestQuestion14,
        options: [intelligenceQuestQuestion14Option1, intelligenceQuestQuestion14Option2, intelligenceQuestQuestion14Option3, intelligenceQuestQuestion14Option4],
        answer: 2,
        explanation: intelligenceQuestQuestion14Explanation
    }, {
        id: 15,
        question: intelligenceQuestQuestion15,
        options: [intelligenceQuestQuestion15Option1, intelligenceQuestQuestion15Option2, intelligenceQuestQuestion15Option3, intelligenceQuestQuestion15Option4],
        answer: 2,
        explanation: intelligenceQuestQuestion15Explanation
    }, {
        id: 16,
        question: intelligenceQuestQuestion16,
        options: [intelligenceQuestQuestion16Option1, intelligenceQuestQuestion16Option2, intelligenceQuestQuestion16Option3, intelligenceQuestQuestion16Option4],
        answer: 2,
        explanation: intelligenceQuestQuestion16Explanation
    }, {
        id: 17,
        question: intelligenceQuestQuestion17,
        options: [intelligenceQuestQuestion17Option1, intelligenceQuestQuestion17Option2, intelligenceQuestQuestion17Option3, intelligenceQuestQuestion17Option4],
        answer: 2,
        explanation: intelligenceQuestQuestion17Explanation
    }, {
        id: 18,
        question: intelligenceQuestQuestion18,
        options: [intelligenceQuestQuestion18Option1, intelligenceQuestQuestion18Option2, intelligenceQuestQuestion18Option3, intelligenceQuestQuestion18Option4],
        answer: 2,
        explanation: intelligenceQuestQuestion18Explanation
    }, {
        id: 19,
        question: intelligenceQuestQuestion19,
        options: [intelligenceQuestQuestion19Option1, intelligenceQuestQuestion19Option2, intelligenceQuestQuestion19Option3, intelligenceQuestQuestion19Option4],
        answer: 1,
        explanation: intelligenceQuestQuestion19Explanation
    }, {
        id: 20,
        question: intelligenceQuestQuestion20,
        options: [intelligenceQuestQuestion20Option1, intelligenceQuestQuestion20Option2, intelligenceQuestQuestion20Option3, intelligenceQuestQuestion20Option4],
        answer: 3,
        explanation: intelligenceQuestQuestion20Explanation
    }
];
let intelligenceQuestions = [];

// Banco de 50 preguntas de Star Trek, con una única respuesta correcta por pregunta.
const starTrekTriviaQuestionBank = [{
        id: 1,
        question: triviaQuestion1,
        options: [triviaQuestion1Option1, triviaQuestion1Option2, triviaQuestion1Option3, triviaQuestion1Option4],
        answer: 2,
        explanation: triviaQuestion1Explanation
    }, {
        id: 2,
        question: triviaQuestion2,
        options: [triviaQuestion2Option1, triviaQuestion2Option2, triviaQuestion2Option3, triviaQuestion2Option4],
        answer: 1,
        explanation: triviaQuestion2Explanation
    }, {
        id: 3,
        question: triviaQuestion3,
        options: [triviaQuestion3Option1, triviaQuestion3Option2, triviaQuestion3Option3, triviaQuestion3Option4],
        answer: 3,
        explanation: triviaQuestion3Explanation
    }, {
        id: 4,
        question: triviaQuestion4,
        options: [triviaQuestion4Option1, triviaQuestion4Option2, triviaQuestion4Option3, triviaQuestion4Option4],
        answer: 0,
        explanation: triviaQuestion4Explanation
    }, {
        id: 5,
        question: triviaQuestion5,
        options: [triviaQuestion5Option1, triviaQuestion5Option2, triviaQuestion5Option3, triviaQuestion5Option4],
        answer: 2,
        explanation: triviaQuestion5Explanation
    }, {
        id: 6,
        question: triviaQuestion6,
        options: [triviaQuestion6Option1, triviaQuestion6Option2, triviaQuestion6Option3, triviaQuestion6Option4],
        answer: 1,
        explanation: triviaQuestion6Explanation
    }, {
        id: 7,
        question: triviaQuestion7,
        options: [triviaQuestion7Option1, triviaQuestion7Option2, triviaQuestion7Option3, triviaQuestion7Option4],
        answer: 0,
        explanation: triviaQuestion7Explanation
    }, {
        id: 8,
        question: triviaQuestion8,
        options: [triviaQuestion8Option1, triviaQuestion8Option2, triviaQuestion8Option3, triviaQuestion8Option4],
        answer: 3,
        explanation: triviaQuestion8Explanation
    }, {
        id: 9,
        question: triviaQuestion9,
        options: [triviaQuestion9Option1, triviaQuestion9Option2, triviaQuestion9Option3, triviaQuestion9Option4],
        answer: 1,
        explanation: triviaQuestion9Explanation
    }, {
        id: 10,
        question: triviaQuestion10,
        options: [triviaQuestion10Option1, triviaQuestion10Option2, triviaQuestion10Option3, triviaQuestion10Option4],
        answer: 2,
        explanation: triviaQuestion10Explanation
    }, {
        id: 11,
        question: triviaQuestion11,
        options: [triviaQuestion11Option1, triviaQuestion11Option2, triviaQuestion11Option3, triviaQuestion11Option4],
        answer: 0,
        explanation: triviaQuestion11Explanation
    }, {
        id: 12,
        question: triviaQuestion12,
        options: [triviaQuestion12Option1, triviaQuestion12Option2, triviaQuestion12Option3, triviaQuestion12Option4],
        answer: 3,
        explanation: triviaQuestion12Explanation
    }, {
        id: 13,
        question: triviaQuestion13,
        options: [triviaQuestion13Option1, triviaQuestion13Option2, triviaQuestion13Option3, triviaQuestion13Option4],
        answer: 1,
        explanation: triviaQuestion13Explanation
    }, {
        id: 14,
        question: triviaQuestion14,
        options: [triviaQuestion14Option1, triviaQuestion14Option2, triviaQuestion14Option3, triviaQuestion14Option4],
        answer: 2,
        explanation: triviaQuestion14Explanation
    }, {
        id: 15,
        question: triviaQuestion15,
        options: [triviaQuestion15Option1, triviaQuestion15Option2, triviaQuestion15Option3, triviaQuestion15Option4],
        answer: 0,
        explanation: triviaQuestion15Explanation
    }, {
        id: 16,
        question: triviaQuestion16,
        options: [triviaQuestion16Option1, triviaQuestion16Option2, triviaQuestion16Option3, triviaQuestion16Option4],
        answer: 3,
        explanation: triviaQuestion16Explanation
    }, {
        id: 17,
        question: triviaQuestion17,
        options: [triviaQuestion17Option1, triviaQuestion17Option2, triviaQuestion17Option3, triviaQuestion17Option4],
        answer: 1,
        explanation: triviaQuestion17Explanation
    }, {
        id: 18,
        question: triviaQuestion18,
        options: [triviaQuestion18Option1, triviaQuestion18Option2, triviaQuestion18Option3, triviaQuestion18Option4],
        answer: 2,
        explanation: triviaQuestion18Explanation
    }, {
        id: 19,
        question: triviaQuestion19,
        options: [triviaQuestion19Option1, triviaQuestion19Option2, triviaQuestion19Option3, triviaQuestion19Option4],
        answer: 0,
        explanation: triviaQuestion19Explanation
    }, {
        id: 20,
        question: triviaQuestion20,
        options: [triviaQuestion20Option1, triviaQuestion20Option2, triviaQuestion20Option3, triviaQuestion20Option4],
        answer: 0,
        explanation: triviaQuestion20Explanation
    }, {
        id: 21,
        question: triviaQuestion21,
        options: [triviaQuestion21Option1, triviaQuestion21Option2, triviaQuestion21Option3, triviaQuestion21Option4],
        answer: 1,
        explanation: triviaQuestion21Explanation
    }, {
        id: 22,
        question: triviaQuestion22,
        options: [triviaQuestion22Option1, triviaQuestion22Option2, triviaQuestion22Option3, triviaQuestion22Option4],
        answer: 2,
        explanation: triviaQuestion22Explanation
    }, {
        id: 23,
        question: triviaQuestion23,
        options: [triviaQuestion23Option1, triviaQuestion23Option2, triviaQuestion23Option3, triviaQuestion23Option4],
        answer: 0,
        explanation: triviaQuestion23Explanation
    }, {
        id: 24,
        question: triviaQuestion24,
        options: [triviaQuestion24Option1, triviaQuestion24Option2, triviaQuestion24Option3, triviaQuestion24Option4],
        answer: 2,
        explanation: triviaQuestion24Explanation
    }, {
        id: 25,
        question: triviaQuestion25,
        options: [triviaQuestion25Option1, triviaQuestion25Option2, triviaQuestion25Option3, triviaQuestion25Option4],
        answer: 1,
        explanation: triviaQuestion25Explanation
    }, {
        id: 26,
        question: triviaQuestion26,
        options: [triviaQuestion26Option1, triviaQuestion26Option2, triviaQuestion26Option3, triviaQuestion26Option4],
        answer: 3,
        explanation: triviaQuestion26Explanation
    }, {
        id: 27,
        question: triviaQuestion27,
        options: [triviaQuestion27Option1, triviaQuestion27Option2, triviaQuestion27Option3, triviaQuestion27Option4],
        answer: 0,
        explanation: triviaQuestion27Explanation
    }, {
        id: 28,
        question: triviaQuestion28,
        options: [triviaQuestion28Option1, triviaQuestion28Option2, triviaQuestion28Option3, triviaQuestion28Option4],
        answer: 2,
        explanation: triviaQuestion28Explanation
    }, {
        id: 29,
        question: triviaQuestion29,
        options: [triviaQuestion29Option1, triviaQuestion29Option2, triviaQuestion29Option3, triviaQuestion29Option4],
        answer: 1,
        explanation: triviaQuestion29Explanation
    }, {
        id: 30,
        question: triviaQuestion30,
        options: [triviaQuestion30Option1, triviaQuestion30Option2, triviaQuestion30Option3, triviaQuestion30Option4],
        answer: 0,
        explanation: triviaQuestion30Explanation
    }, {
        id: 31,
        question: triviaQuestion31,
        options: [triviaQuestion31Option1, triviaQuestion31Option2, triviaQuestion31Option3, triviaQuestion31Option4],
        answer: 3,
        explanation: triviaQuestion31Explanation
    }, {
        id: 32,
        question: triviaQuestion32,
        options: [triviaQuestion32Option1, triviaQuestion32Option2, triviaQuestion32Option3, triviaQuestion32Option4],
        answer: 1,
        explanation: triviaQuestion32Explanation
    }, {
        id: 33,
        question: triviaQuestion33,
        options: [triviaQuestion33Option1, triviaQuestion33Option2, triviaQuestion33Option3, triviaQuestion33Option4],
        answer: 2,
        explanation: triviaQuestion33Explanation
    }, {
        id: 34,
        question: triviaQuestion34,
        options: [triviaQuestion34Option1, triviaQuestion34Option2, triviaQuestion34Option3, triviaQuestion34Option4],
        answer: 0,
        explanation: triviaQuestion34Explanation
    }, {
        id: 35,
        question: triviaQuestion35,
        options: [triviaQuestion35Option1, triviaQuestion35Option2, triviaQuestion35Option3, triviaQuestion35Option4],
        answer: 2,
        explanation: triviaQuestion35Explanation
    }, {
        id: 36,
        question: triviaQuestion36,
        options: [triviaQuestion36Option1, triviaQuestion36Option2, triviaQuestion36Option3, triviaQuestion36Option4],
        answer: 1,
        explanation: triviaQuestion36Explanation
    }, {
        id: 37,
        question: triviaQuestion37,
        options: [triviaQuestion37Option1, triviaQuestion37Option2, triviaQuestion37Option3, triviaQuestion37Option4],
        answer: 3,
        explanation: triviaQuestion37Explanation
    }, {
        id: 38,
        question: triviaQuestion38,
        options: [triviaQuestion38Option1, triviaQuestion38Option2, triviaQuestion38Option3, triviaQuestion38Option4],
        answer: 0,
        explanation: triviaQuestion38Explanation
    }, {
        id: 39,
        question: triviaQuestion39,
        options: [triviaQuestion39Option1, triviaQuestion39Option2, triviaQuestion39Option3, triviaQuestion39Option4],
        answer: 2,
        explanation: triviaQuestion39Explanation
    }, {
        id: 40,
        question: triviaQuestion40,
        options: [triviaQuestion40Option1, triviaQuestion40Option2, triviaQuestion40Option3, triviaQuestion40Option4],
        answer: 1,
        explanation: triviaQuestion40Explanation
    }, {
        id: 41,
        question: triviaQuestion41,
        options: [triviaQuestion41Option1, triviaQuestion41Option2, triviaQuestion41Option3, triviaQuestion41Option4],
        answer: 1,
        explanation: triviaQuestion41Explanation
    }, {
        id: 42,
        question: triviaQuestion42,
        options: [triviaQuestion42Option1, triviaQuestion42Option2, triviaQuestion42Option3, triviaQuestion42Option4],
        answer: 3,
        explanation: triviaQuestion42Explanation
    }, {
        id: 43,
        question: triviaQuestion43,
        options: [triviaQuestion43Option1, triviaQuestion43Option2, triviaQuestion43Option3, triviaQuestion43Option4],
        answer: 0,
        explanation: triviaQuestion43Explanation
    }, {
        id: 44,
        question: triviaQuestion44,
        options: [triviaQuestion44Option1, triviaQuestion44Option2, triviaQuestion44Option3, triviaQuestion44Option4],
        answer: 1,
        explanation: triviaQuestion44Explanation
    }, {
        id: 45,
        question: triviaQuestion45,
        options: [triviaQuestion45Option1, triviaQuestion45Option2, triviaQuestion45Option3, triviaQuestion45Option4],
        answer: 2,
        explanation: triviaQuestion45Explanation
    }, {
        id: 46,
        question: triviaQuestion46,
        options: [triviaQuestion46Option1, triviaQuestion46Option2, triviaQuestion46Option3, triviaQuestion46Option4],
        answer: 0,
        explanation: triviaQuestion46Explanation
    }, {
        id: 47,
        question: triviaQuestion47,
        options: [triviaQuestion47Option1, triviaQuestion47Option2, triviaQuestion47Option3, triviaQuestion47Option4],
        answer: 3,
        explanation: triviaQuestion47Explanation
    }, {
        id: 48,
        question: triviaQuestion48,
        options: [triviaQuestion48Option1, triviaQuestion48Option2, triviaQuestion48Option3, triviaQuestion48Option4],
        answer: 1,
        explanation: triviaQuestion48Explanation
    }, {
        id: 49,
        question: triviaQuestion49,
        options: [triviaQuestion49Option1, triviaQuestion49Option2, triviaQuestion49Option3, triviaQuestion49Option4],
        answer: 0,
        explanation: triviaQuestion49Explanation
    }, {
        id: 50,
        question: triviaQuestion50,
        options: [triviaQuestion50Option1, triviaQuestion50Option2, triviaQuestion50Option3, triviaQuestion50Option4],
        answer: 2,
        explanation: triviaQuestion50Explanation
    },
];
let starTrekTriviaQuestions = [];

function pickRandomQuestions(bank, count) {
    const shuffled = bank.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

let intelligenceQuestionIndex = 0;
let intelligenceScore = 0;
let intelligenceFeedback = null;
let triviaQuestionIndex = 0;
let triviaScore = 0;
let triviaFeedback = null;

// Fase final del entrenamiento: simulación de mando Kobayashi Maru.
// Es un homenaje jugable con texto original y gráficos generados con canvas.
let kobayashiMaruStage = 0; // 0: alerta, 1: decisión, 2: crisis, 3: análisis
let kobayashiMaruChoice = -1;
let kobayashiMaruOutcome = '';
const kobayashiMaruChoices = [{
        title: kobayashiMaruSpeaker1,
        detail: kobayashiMaruSpeakerText1
    }, {
        title: kobayashiMaruSpeaker2,
        detail: kobayashiMaruSpeakerText2
    }, {
        title: kobayashiMaruSpeaker3,
        detail: kobayashiMaruSpeakerText3
    }
];

// Personaje elegido solo para el circuito del holodeck; no cambia la selección
// de los modos de combate ni el personaje que usa la historia.
let trainingCharacterIndex = 0;
const trainingScoreTarget = 3000;
let trainingCircuitIndex = 0;
const holodeckCourses = [{
        name: holodeckCourseName1,
        theme: 'classic',
        worldWidth: 2650,
        ground: [[0, 350], [415, 330], [810, 370], [1245, 405], [1715, 365], [2145, 505]],
        upper: [[175, 105, 100], [495, 140, 100], [660, 86, 110], [885, 122, 112], [1065, 172, 115], [1325, 115, 106], [1515, 155, 120], [1775, 105, 100], [1935, 172, 110], [2225, 125, 112]],
        coins: [[215, 139], [535, 176], [703, 122], [929, 159], [1118, 209], [1377, 151], [1576, 193], [1826, 142], [1989, 211], [2278, 161]],
        enemies: [[275, 245, 325, 1.1], [555, 510, 700, 1.2], [940, 860, 1120, 1.35], [1455, 1280, 1600, 1.25], [1870, 1740, 2020, 1.35], [2320, 2210, 2500, 1.5]]
    }, {
        name: holodeckCourseName2,
        theme: 'space',
        worldWidth: 2850,
        ground: [[0, 310], [385, 300], [760, 315], [1135, 310], [1510, 330], [1905, 300], [2280, 310], [2660, 190]],
        upper: [[130, 92, 90], [470, 138, 95], [650, 85, 95], [860, 124, 105], [1100, 160, 100], [1285, 108, 110], [1555, 145, 100], [1770, 90, 100], [1980, 158, 105], [2215, 118, 105], [2480, 147, 105]],
        coins: [[170, 130], [510, 176], [695, 123], [910, 161], [1145, 198], [1335, 146], [1595, 183], [1815, 128], [2020, 196], [2255, 156], [2520, 185]],
        enemies: [[245, 210, 290, 1.3], [540, 430, 640, 1.45], [900, 820, 1060, 1.5], [1360, 1190, 1480, 1.55], [1690, 1570, 1830, 1.6], [2075, 1950, 2200, 1.65], [2430, 2340, 2600, 1.8], [2760, 2700, 2815, 1.7]]
    }, {
        name: holodeckCourseName3,
        theme: 'volcano',
        worldWidth: 3020,
        ground: [[0, 280], [350, 300], [715, 290], [1070, 300], [1435, 300], [1800, 300], [2165, 300], [2530, 490]],
        upper: [[90, 82, 85], [405, 132, 95], [590, 92, 90], [785, 155, 100], [990, 105, 95], [1160, 170, 105], [1370, 118, 95], [1580, 145, 105], [1770, 95, 100], [1980, 160, 95], [2195, 110, 105], [2420, 148, 100], [2730, 105, 95]],
        coins: [[125, 121], [445, 169], [630, 128], [825, 191], [1030, 141], [1200, 206], [1410, 154], [1620, 181], [1810, 131], [2020, 196], [2235, 146], [2460, 184], [2765, 141]],
        enemies: [[215, 190, 250, 1.45], [490, 420, 600, 1.55], [855, 790, 1000, 1.65], [1230, 1150, 1360, 1.65], [1515, 1460, 1720, 1.7], [1900, 1840, 2070, 1.8], [2290, 2220, 2470, 1.9], [2780, 2650, 2925, 1.95]]
    }, {
        name: holodeckCourseName4,
        theme: 'ice',
        worldWidth: 3200,
        ground: [[0, 330], [405, 290], [760, 285], [1110, 285], [1460, 285], [1810, 290], [2170, 300], [2540, 290], [2900, 300]],
        upper: [[140, 98, 95], [445, 145, 90], [635, 88, 100], [820, 132, 95], [1015, 174, 95], [1180, 105, 105], [1395, 146, 100], [1590, 95, 100], [1795, 164, 95], [1985, 120, 105], [2215, 153, 100], [2425, 96, 95], [2630, 145, 100], [2960, 112, 95]],
        coins: [[180, 136], [480, 182], [675, 126], [860, 169], [1055, 212], [1220, 143], [1435, 184], [1630, 133], [1835, 202], [2025, 158], [2255, 191], [2465, 134], [2670, 183], [3000, 150]],
        enemies: [[245, 215, 295, 1.5], [525, 455, 640, 1.6], [870, 800, 1020, 1.65], [1220, 1150, 1355, 1.75], [1535, 1480, 1715, 1.8], [1870, 1840, 2070, 1.9], [2260, 2200, 2450, 1.95], [2640, 2580, 2820, 2.0], [3040, 2940, 3160, 2.1]]
    }
];

function beginTrainingMode() {
    trainingCircuitIndex = 0;
    trainingDialogueIndex = 0;
    intelligenceQuestionIndex = 0;
    intelligenceScore = 0;
    intelligenceFeedback = null;
    triviaQuestionIndex = 0;
    triviaScore = 0;
    triviaFeedback = null;
    kobayashiMaruStage = 0;
    kobayashiMaruChoice = -1;
    kobayashiMaruOutcome = '';
    // Parte del personaje que ya tenía seleccionado el jugador 1. Se puede
    // cambiar desde el puente con A/D o las flechas.
    trainingCharacterIndex = clamp(player1.charIndex, 0, availableCharacters.length - 1);
    starshipGame = null;
    trainingRangeGame = null;
    starshipRaceGame = null;
    holodeckGame = null;
    for (const k in keys)
        keys[k] = false;
    gameState = 'TRAINING_BRIDGE';
}

function changeTrainingCharacter(direction) {
    trainingCharacterIndex = (trainingCharacterIndex + direction + availableCharacters.length) % availableCharacters.length;
}

function beginStarshipMode() {
    const w = canvas.width,
    h = canvas.height;
    starshipGame = {
        frame: 0,
        score: 0,
        lives: 3,
        over: false,
        player: {
            x: w / 2,
            y: h - 66,
            radius: 13,
            speed: 4.4,
            invulnerable: 0
        },
        playerShots: [],
        enemyShips: [],
        enemyShots: [],
        particles: [],
        stars: Array.from({
            length: 90
        }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                speed: 0.5 + Math.random() * 2.4,
                size: Math.random() < 0.82 ? 1 : 2
            })),
        spawnTimer: 24,
        fireCooldown: 0
    };
    for (const k in keys)
        keys[k] = false;
    gameState = 'STARSHIP';
}

function addStarshipExplosion(x, y, color = '#ffb347', amount = 15) {
    if (!starshipGame)
        return;
    for (let i = 0; i < amount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3.6;
        starshipGame.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 18 + Math.floor(Math.random() * 18),
            maxLife: 36,
            size: 1.5 + Math.random() * 2.5,
            color
        });
    }
}

function fireStarshipWeapons() {
    const g = starshipGame;
    if (!g || g.over || g.fireCooldown > 0)
        return;
    const p = g.player;
    // Doble phaser, estilo arcade clásico.
    g.playerShots.push({
        x: p.x - 7,
        y: p.y - 19,
        vx: 0,
        vy: -8.5,
        radius: 3,
        damage: 1
    });
    g.playerShots.push({
        x: p.x + 7,
        y: p.y - 19,
        vx: 0,
        vy: -8.5,
        radius: 3,
        damage: 1
    });
    g.fireCooldown = 8;
}

function damageStarshipPlayer() {
    const g = starshipGame;
    if (!g || g.over || g.player.invulnerable > 0)
        return;
    g.lives--;
    g.player.invulnerable = 85;
    addStarshipExplosion(g.player.x, g.player.y, '#ff6655', 22);
    if (g.lives <= 0) {
        g.lives = 0;
        g.over = true;
        g.overFrame = g.frame;
    }
}

function updateStarshipMode() {
    const g = starshipGame;
    if (gameState !== 'STARSHIP' || !g || g.over)
        return;
    const w = canvas.width,
    h = canvas.height,
    p = g.player;
    g.frame++;
    if (p.invulnerable > 0)
        p.invulnerable--;
    if (g.fireCooldown > 0)
        g.fireCooldown--;

    let dx = 0,
    dy = 0;
    if (keys.ArrowLeft || keys.a || keys.A)
        dx--;
    if (keys.ArrowRight || keys.d || keys.D)
        dx++;
    if (keys.ArrowUp || keys.w || keys.W)
        dy--;
    if (keys.ArrowDown || keys.s || keys.S)
        dy++;
    // Diagonal movement is normalized, so it is not faster than straight movement.
    if (dx && dy) {
        dx *= 0.7071;
        dy *= 0.7071;
    }
    p.x = clamp(p.x + dx * p.speed, 22, w - 22);
    p.y = clamp(p.y + dy * p.speed, 62, h - 28);
    if (keys[' '] || keys.Enter)
        fireStarshipWeapons();

    for (const star of g.stars) {
        star.y += star.speed;
        if (star.y > h) {
            star.y = 0;
            star.x = Math.random() * w;
        }
    }

    g.spawnTimer--;
    if (g.spawnTimer <= 0) {
        const tough = g.score >= 800 && Math.random() < 0.32;
        g.enemyShips.push({
            x: 30 + Math.random() * (w - 60),
            y: -28,
            vx: (Math.random() - 0.5) * (tough ? 2.2 : 1.3),
            vy: (tough ? 1.5 : 1.1) + Math.random() * 1.1,
            hp: tough ? 2 : 1,
            radius: tough ? 17 : 13,
            shootTimer: 45 + Math.floor(Math.random() * 65),
            phase: Math.random() * Math.PI * 2,
            variant: Math.floor(Math.random() * 4),
            tough
        });
        g.spawnTimer = Math.max(18, 43 - Math.floor(g.score / 350));
    }

    // Phaser beams from the player.
    for (const shot of g.playerShots) {
        shot.x += shot.vx;
        shot.y += shot.vy;
    }
    g.playerShots = g.playerShots.filter(s => s.y > -20);

    // Enemy movement, aimed disruptor shots, and collision against the Enterprise.
    for (const enemy of g.enemyShips) {
        enemy.phase += 0.035;
        enemy.x += enemy.vx + Math.sin(enemy.phase) * 0.65;
        enemy.y += enemy.vy;
        if (enemy.x < 20 || enemy.x > w - 20)
            enemy.vx *= -1;
        enemy.x = clamp(enemy.x, 20, w - 20);
        enemy.shootTimer--;
        if (enemy.shootTimer <= 0 && enemy.y > 0 && enemy.y < h * 0.78) {
            const vx = p.x - enemy.x,
            vy = p.y - enemy.y;
            const len = Math.max(1, Math.hypot(vx, vy));
            const speed = enemy.tough ? 3.2 : 2.7;
            g.enemyShots.push({
                x: enemy.x,
                y: enemy.y + 13,
                vx: vx / len * speed,
                vy: vy / len * speed,
                radius: 4
            });
            enemy.shootTimer = 78 + Math.floor(Math.random() * 48);
        }
        if (Math.hypot(p.x - enemy.x, p.y - enemy.y) < p.radius + enemy.radius) {
            addStarshipExplosion(enemy.x, enemy.y, '#ff8059', 17);
            enemy.y = h + 80;
            damageStarshipPlayer();
        }
    }
    g.enemyShips = g.enemyShips.filter(e => e.y < h + 35);

    // Each hit is counted once per laser-enemy pair.
    for (const shot of g.playerShots) {
        if (shot.used)
            continue;
        for (const enemy of g.enemyShips) {
            if (enemy.y > h + 25)
                continue;
            if (Math.hypot(shot.x - enemy.x, shot.y - enemy.y) < shot.radius + enemy.radius) {
                shot.used = true;
                enemy.hp -= shot.damage;
                addStarshipExplosion(shot.x, shot.y, '#6ffcff', 4);
                if (enemy.hp <= 0) {
                    g.score += enemy.tough ? 200 : 100;
                    addStarshipExplosion(enemy.x, enemy.y, enemy.tough ? '#ffcf6e' : '#ff775e', enemy.tough ? 24 : 17);
                    enemy.y = h + 80;
                    if (g.score >= trainingScoreTarget) {
                        g.missionComplete = true;
                        g.over = true;
                        g.overFrame = g.frame;
                    }
                }
                break;
            }
        }
    }
    g.playerShots = g.playerShots.filter(s => !s.used);
    g.enemyShips = g.enemyShips.filter(e => e.y < h + 35);

    for (const shot of g.enemyShots) {
        shot.x += shot.vx;
        shot.y += shot.vy;
        if (Math.hypot(shot.x - p.x, shot.y - p.y) < shot.radius + p.radius - 2) {
            shot.used = true;
            damageStarshipPlayer();
        }
    }
    g.enemyShots = g.enemyShots.filter(s => !s.used && s.x > -15 && s.x < w + 15 && s.y > -15 && s.y < h + 15);

    for (const particle of g.particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.life--;
    }
    g.particles = g.particles.filter(particle => particle.life > 0);
}

function drawEnterpriseArcadeShip(x, y, invulnerable = 0) {
    // Si existe el asset personalizado, lo usamos; si no, mantenemos el dibujo clásico.
    ctx.save();
    if (invulnerable > 0 && Math.floor(invulnerable / 5) % 2 === 0)
        ctx.globalAlpha = 0.38;
    if (enterprisePilotImage.complete && enterprisePilotImage.naturalWidth > 0) {
        const aspect = enterprisePilotImage.naturalWidth / enterprisePilotImage.naturalHeight;
        const maxW = 78,
        maxH = 58;
        const dw = Math.min(maxW, maxH * aspect);
        const dh = dw / aspect;
        ctx.shadowColor = '#67eaff';
        ctx.shadowBlur = 10;
        ctx.drawImage(enterprisePilotImage, x - dw / 2, y - dh / 2, dw, dh);
    } else {
        ctx.translate(x, y);
        ctx.shadowColor = '#67eaff';
        ctx.shadowBlur = 12;
        // Dibujo alternativo hasta que se cargue enterprise_pilot.png o si falta el archivo.
        ctx.fillStyle = '#b6f6ff';
        ctx.fillRect(-19, -1, 6, 23);
        ctx.fillRect(13, -1, 6, 23);
        ctx.fillStyle = '#39a8de';
        ctx.fillRect(-18, 3, 4, 16);
        ctx.fillRect(14, 3, 4, 16);
        ctx.fillStyle = '#9eabbc';
        ctx.strokeStyle = '#e5fbff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(8, -8);
        ctx.lineTo(7, 11);
        ctx.lineTo(0, 19);
        ctx.lineTo(-7, 11);
        ctx.lineTo(-8, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#dce8ef';
        ctx.beginPath();
        ctx.ellipse(0, -12, 14, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#3faad0';
        ctx.beginPath();
        ctx.ellipse(0, -12, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 7;
        ctx.fillStyle = '#40e9ff';
        ctx.fillRect(-3, 14, 6, 6);
    }
    ctx.restore();
}

function drawArcadeEnemyShip(enemy) {
    ctx.save();
    const image = starshipAttackersImage;
    if (image.complete && image.naturalWidth > 0) {
        // Los atacantes deben mirar hacia abajo, hacia la nave del jugador.
        // El asset estaba orientado al revés: giramos cada sprite 180 grados
        // alrededor de su propio centro. El recorte de hojas de sprites se conserva.
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(Math.PI);
        const ratio = image.naturalWidth / image.naturalHeight;
        if (ratio >= 2.4) {
            const columns = clamp(Math.round(ratio), 2, 5);
            const cellW = image.naturalWidth / columns;
            const variant = enemy.tough ? columns - 1 : (enemy.variant || 0) % Math.max(1, columns - 1);
            const sx = variant * cellW;
            const sw = cellW;
            const maxW = enemy.tough ? 66 : 48;
            const maxH = enemy.tough ? 56 : 42;
            const aspect = sw / image.naturalHeight;
            const dw = Math.min(maxW, maxH * aspect);
            const dh = dw / aspect;
            ctx.shadowColor = enemy.tough ? '#ffbd59' : '#ff433d';
            ctx.shadowBlur = enemy.tough ? 10 : 7;
            ctx.drawImage(image, sx, 0, sw, image.naturalHeight, -dw / 2, -dh / 2, dw, dh);
        } else {
            const maxW = enemy.tough ? 66 : 48;
            const maxH = enemy.tough ? 56 : 42;
            const aspect = image.naturalWidth / image.naturalHeight;
            const dw = Math.min(maxW, maxH * aspect);
            const dh = dw / aspect;
            ctx.shadowColor = enemy.tough ? '#ffbd59' : '#ff433d';
            ctx.shadowBlur = enemy.tough ? 10 : 7;
            ctx.drawImage(image, -dw / 2, -dh / 2, dw, dh);
        }
    } else {
        // Dibujo alternativo si aún no se ha cargado atacantes.png o si falta el archivo.
        // Este dibujo ya apunta hacia abajo y por eso no se gira.
        ctx.translate(enemy.x, enemy.y);
        ctx.shadowColor = enemy.tough ? '#ffbd59' : '#ff433d';
        ctx.shadowBlur = 9;
        ctx.fillStyle = enemy.tough ? '#b56b32' : '#852c3f';
        ctx.strokeStyle = enemy.tough ? '#ffe2a1' : '#ff8c8c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 18);
        ctx.lineTo(8, 3);
        ctx.lineTo(21, -5);
        ctx.lineTo(12, -7);
        ctx.lineTo(7, -15);
        ctx.lineTo(0, -10);
        ctx.lineTo(-7, -15);
        ctx.lineTo(-12, -7);
        ctx.lineTo(-21, -5);
        ctx.lineTo(-8, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffc4bd';
        ctx.fillRect(-3, -5, 6, 10);
        if (enemy.tough) {
            ctx.fillStyle = '#ffcf6e';
            ctx.fillRect(-15, 0, 30, 2);
        }
    }
    ctx.restore();
}

function drawStarshipMode() {
    const g = starshipGame;
    const w = canvas.width,
    h = canvas.height;
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#030716');
    bg.addColorStop(1, '#0b2645');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    if (!g)
        return;
    for (const star of g.stars) {
        ctx.globalAlpha = 0.45 + star.speed / 4;
        ctx.fillStyle = '#c8f3ff';
        ctx.fillRect(star.x, star.y, star.size, star.size * (star.speed > 2 ? 2 : 1));
    }
    ctx.globalAlpha = 1;
    // Soft nebula bands.
    ctx.fillStyle = 'rgba(32, 103, 170, 0.10)';
    ctx.beginPath();
    ctx.ellipse(w * 0.76, h * 0.36, w * 0.3, h * 0.18, -0.4, 0, Math.PI * 2);
    ctx.fill();

    for (const shot of g.playerShots) {
        ctx.save();
        ctx.shadowColor = '#53f8ff';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#a4ffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(shot.x, shot.y + 7);
        ctx.lineTo(shot.x, shot.y - 5);
        ctx.stroke();
        ctx.restore();
    }
    for (const shot of g.enemyShots) {
        ctx.save();
        ctx.shadowColor = '#ff4c54';
        ctx.shadowBlur = 9;
        ctx.fillStyle = '#ff5c65';
        ctx.beginPath();
        ctx.ellipse(shot.x, shot.y, 3.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    for (const enemy of g.enemyShips)
        drawArcadeEnemyShip(enemy);
    for (const particle of g.particles) {
        ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
    if (!g.over)
        drawEnterpriseArcadeShip(g.player.x, g.player.y, g.player.invulnerable);

    // HUD.
    ctx.fillStyle = 'rgba(0, 8, 20, 0.7)';
    ctx.fillRect(0, 0, w, 43);
    text(hudStarshipModeText1, 150, 27, 36, '#7eeeff', false);
    text(`${hudStarshipModeText2}${String(g.score).padStart(6, '0')}`, w / 2, 27, 30, '#ffffff', false);
    text(`${hudStarshipModeText3}${'◆ '.repeat(g.lives).trim()}`, w - 88, 27, 30, '#ffcf70', false);
    text(hudStarshipModeText4, w / 2, h - 10, 24, '#b4d7e8', false);

    if (g.over) {
        ctx.fillStyle = 'rgba(0, 4, 14, 0.80)';
        ctx.fillRect(0, 0, w, h);

        if (!g.overFrame) g.overFrame = frameCount;
        const elapsed = frameCount - g.overFrame;

        if (g.missionComplete) {
            //text(hudStarshipModeText5, w / 2, h / 2 - 40, 25, '#ffdf70', true);
            textWithAnimation(
                hudStarshipModeText5,
                w / 2,
                h / 2 - 80,
                10,            // Tamaño inicial pequeño
                120,           // Tamaño final
                25,
                elapsed,
                '#ffdf70',
                false
            );
            text(`${hudStarshipModeText6A}: ${g.score}${hudStarshipModeText6B}`, w / 2, h / 2 - 5, 36, '#ffffff', false);
            text(hudStarshipModeText7, w / 2, h / 2 + 40, 33, '#78f7ff', false);
        } else {
            //text(hudStarshipModeText8, w / 2, h / 2 - 36, 29, '#ff625b', true);
            textWithAnimation(
                hudStarshipModeText8,
                w / 2,
                h / 2 - 80,
                10,            // Tamaño inicial pequeño
                125,            // Tamaño final
                25,
                elapsed,
                '#ff625b',
                false
            );
            text(`${hudStarshipModeText9}${g.score}`, w / 2, h / 2 + 2, 28, '#ffffff', false);
            text(hudStarshipModeText10, w / 2, h / 2 + 40, 24, '#78f7ff', false);
        }
        text(hudStarshipModeText11, w / 2, h / 2 + 80, 22, '#c8dbe8');
    }
}

// ------------------------------------------------------------
// SEGUNDA PRUEBA DE PILOTAJE: CARRERA DE NAVES
// Carrera arcade vista desde arriba. El personaje corre con la Enterprise
// contra tres rivales; salirse del trazado o golpear boyas resta distancia.
// ------------------------------------------------------------
const RACE_SCREEN_SCALE = 0.34;
const RACE_FINISH_DISTANCE = 20000;
const RACE_TRACK_WIDTH = () => Math.min(canvas.width * 0.68, 500);

function raceTrackCenterAt(distance) {
    const w = canvas.width;
    return w / 2 + Math.sin(distance / 610) * w * 0.145 + Math.sin(distance / 245) * w * 0.038;
}

function beginStarshipRace() {
    const w = canvas.width,
    h = canvas.height;
    starshipRaceGame = {
        frame: 0,
        progress: 0,
        finishDistance: RACE_FINISH_DISTANCE,
        over: false,
        won: false,
        player: {
            x: w / 2,
            y: h * 0.70,
            speed: 5.1,
            hitTimer: 0
        },
        rivals: [{
                name: 'PHOENIX',
                progress: 185,
                lane: -0.27,
                speed: 4.88,
                variant: 0,
                phase: 0
            }, {
                name: 'DEFIANT',
                progress: 55,
                lane: 0.27,
                speed: 4.69,
                variant: 1,
                phase: 2.1
            }, {
                name: 'VOYAGER',
                progress: -125,
                lane: -0.03,
                speed: 4.57,
                variant: 2,
                phase: 4.2
            }
        ],
        hazards: Array.from({
            length: 8
        }, (_, i) => ({
                progress: 690 + i * 910 + Math.random() * 210,
                lane: (Math.random() * 1.35) - 0.675,
                hit: false,
                spin: Math.random() * Math.PI * 2
            })),
        stars: Array.from({
            length: 100
        }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                speed: 0.5 + Math.random() * 2.5,
                size: Math.random() < 0.85 ? 1 : 2
            })),
        sparks: [],
        offTrack: false,
        lastImpact: ''
    };
    for (const k in keys)
        keys[k] = false;
    gameState = 'STARSHIP_RACE';
}

function raceRivalScreenY(rival, g = starshipRaceGame) {
    return g.player.y - (rival.progress - g.progress) * RACE_SCREEN_SCALE;
}

function raceRivalX(rival) {
    return raceTrackCenterAt(rival.progress) + rival.lane * RACE_TRACK_WIDTH();
}

function updateStarshipRace() {
    const g = starshipRaceGame;
    if (gameState !== 'STARSHIP_RACE' || !g || g.over)
        return;
    const w = canvas.width,
    h = canvas.height,
    p = g.player;
    g.frame++;
    if (p.hitTimer > 0)
        p.hitTimer--;

    let dx = 0;
    if (keys.ArrowLeft || keys.a || keys.A)
        dx--;
    if (keys.ArrowRight || keys.d || keys.D)
        dx++;
    p.x = clamp(p.x + dx * 5.0, 18, w - 18);

    const trackWidth = RACE_TRACK_WIDTH();
    const trackCenter = raceTrackCenterAt(g.progress);
    const lateral = Math.abs(p.x - trackCenter);
    g.offTrack = lateral > trackWidth / 2 - 24;
    const speed = g.offTrack ? 2.2 : p.speed;
    g.progress += speed;

    for (const star of g.stars) {
        star.y += star.speed + speed * 0.65;
        if (star.y > h) {
            star.y = 0;
            star.x = Math.random() * w;
        }
    }

    // Los rivales mantienen su propia velocidad y avanzan hacia la meta.
    for (const rival of g.rivals) {
        rival.phase += 0.025;
        rival.progress += rival.speed + Math.sin(g.frame / 85 + rival.phase) * 0.035;
        // Cambios suaves de carril; todos permanecen dentro de los límites.
        rival.lane = clamp(rival.lane + Math.sin(g.frame / 90 + rival.phase) * 0.0009, -0.31, 0.31);
    }

    // Boyas energéticas que el cadete debe esquivar.
    for (const hazard of g.hazards) {
        if (hazard.hit)
            continue;
        const y = p.y - (hazard.progress - g.progress) * RACE_SCREEN_SCALE;
        const x = raceTrackCenterAt(hazard.progress) + hazard.lane * trackWidth;
        if (Math.abs(y - p.y) < 27 && Math.abs(x - p.x) < 31) {
            hazard.hit = true;
            g.progress = Math.max(0, g.progress - 125);
            p.x += p.x < x ? -22 : 22;
            p.hitTimer = 35;
            g.lastImpact = starshipRaceImpactBoya;
            for (let i = 0; i < 14; i++) {
                const a = Math.random() * Math.PI * 2,
                v = 1 + Math.random() * 3;
                g.sparks.push({
                    x,
                    y,
                    vx: Math.cos(a) * v,
                    vy: Math.sin(a) * v,
                    life: 22,
                    color: '#ffbe62'
                });
            }
        }
    }

    // Contacto entre naves: pequeño empujón y pérdida de distancia.
    if (p.hitTimer === 0) {
        for (const rival of g.rivals) {
            const ry = raceRivalScreenY(rival, g),
            rx = raceRivalX(rival);
            if (Math.abs(ry - p.y) < 28 && Math.abs(rx - p.x) < 32) {
                g.progress = Math.max(0, g.progress - 75);
                p.x += p.x < rx ? -25 : 25;
                p.hitTimer = 32;
                g.lastImpact = starshipRaceImpactShip;
                break;
            }
        }
    }

    for (const spark of g.sparks) {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.97;
        spark.vy *= 0.97;
        spark.life--;
    }
    g.sparks = g.sparks.filter(s => s.life > 0);

    // La carrera termina cuando cualquiera cruza la línea de meta.
    const fastestRival = Math.max(...g.rivals.map(r => r.progress));
    if (g.progress >= g.finishDistance || fastestRival >= g.finishDistance) {
        g.over = true;
        g.won = g.progress >= g.finishDistance && g.progress >= fastestRival;
        g.overFrame = g.frame;
        for (const k in keys)
            keys[k] = false;
    }
}

function drawRaceRival(rival, x, y) {
    ctx.save();
    ctx.translate(x, y);
    const image = starshipAttackersImage;
    if (image.complete && image.naturalWidth > 0) {
        const ratio = image.naturalWidth / image.naturalHeight;
        if (ratio >= 2.4) {
            const columns = clamp(Math.round(ratio), 2, 5);
            const cellW = image.naturalWidth / columns;
            const index = rival.variant % columns;
            const aspect = cellW / image.naturalHeight;
            const dw = Math.min(47, 42 * aspect),
            dh = dw / aspect;
            ctx.shadowColor = '#ff624f';
            ctx.shadowBlur = 7;
            // El sprite original apunta hacia arriba, la misma dirección que la carrera.
            ctx.drawImage(image, index * cellW, 0, cellW, image.naturalHeight, -dw / 2, -dh / 2, dw, dh);
        } else {
            const aspect = image.naturalWidth / image.naturalHeight;
            const dw = Math.min(47, 42 * aspect),
            dh = dw / aspect;
            ctx.shadowColor = '#ff624f';
            ctx.shadowBlur = 7;
            ctx.drawImage(image, -dw / 2, -dh / 2, dw, dh);
        }
    } else {
        ctx.shadowColor = '#ff665e';
        ctx.shadowBlur = 8;
        ctx.fillStyle = ['#a33d46', '#8c5e36', '#6e4c9c'][rival.variant % 3];
        ctx.strokeStyle = '#ffd3ba';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -21);
        ctx.lineTo(15, -5);
        ctx.lineTo(9, 13);
        ctx.lineTo(0, 8);
        ctx.lineTo(-9, 13);
        ctx.lineTo(-15, -5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffb65e';
        ctx.fillRect(-3, -5, 6, 12);
    }
    ctx.restore();
}

function drawStarshipRace() {
    const g = starshipRaceGame,
    w = canvas.width,
    h = canvas.height;
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#030716');
    bg.addColorStop(1, '#071b31');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    if (!g)
        return;
    for (const star of g.stars) {
        ctx.globalAlpha = 0.45 + star.speed / 4;
        ctx.fillStyle = '#c8f3ff';
        ctx.fillRect(star.x, star.y, star.size, star.size * (star.speed > 2 ? 2 : 1));
    }
    ctx.globalAlpha = 1;
    const trackWidth = RACE_TRACK_WIDTH();
    const playerY = g.player.y;
    // El trazado se dibuja por tramos, de modo que los virajes se desplacen bajo la nave.
    for (let y = 45; y < h + 8; y += 8) {
        const d1 = g.progress + (playerY - y) / RACE_SCREEN_SCALE;
        const d2 = g.progress + (playerY - (y + 8)) / RACE_SCREEN_SCALE;
        const c1 = raceTrackCenterAt(d1),
        c2 = raceTrackCenterAt(d2);
        ctx.fillStyle = '#122e43';
        ctx.beginPath();
        ctx.moveTo(c1 - trackWidth / 2, y);
        ctx.lineTo(c1 + trackWidth / 2, y);
        ctx.lineTo(c2 + trackWidth / 2, y + 8);
        ctx.lineTo(c2 - trackWidth / 2, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(66, 207, 240, 0.55)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(c1 - trackWidth / 2, y);
        ctx.lineTo(c2 - trackWidth / 2, y + 8);
        ctx.moveTo(c1 + trackWidth / 2, y);
        ctx.lineTo(c2 + trackWidth / 2, y + 8);
        ctx.stroke();
        // Bordes de seguridad luminosos.
        ctx.strokeStyle = 'rgba(255, 178, 77, 0.75)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c1 - trackWidth / 2 + 8, y);
        ctx.lineTo(c2 - trackWidth / 2 + 8, y + 8);
        ctx.moveTo(c1 + trackWidth / 2 - 8, y);
        ctx.lineTo(c2 + trackWidth / 2 - 8, y + 8);
        ctx.stroke();
    }
    // Marcas de carril que avanzan hacia el jugador.
    for (let y = 45; y < h; y += 20) {
        const world = g.progress + (playerY - y) / RACE_SCREEN_SCALE;
        if (Math.floor(world / 155) % 2 !== 0)
            continue;
        const cx = raceTrackCenterAt(world);
        ctx.fillStyle = 'rgba(160, 230, 255, 0.56)';
        ctx.fillRect(cx - 2, y, 4, 10);
        ctx.fillRect(cx - trackWidth * 0.22 - 1, y, 2, 8);
        ctx.fillRect(cx + trackWidth * 0.22 - 1, y, 2, 8);
    }
    // Boyas de la pista.
    for (const hazard of g.hazards) {
        if (hazard.hit)
            continue;
        const y = playerY - (hazard.progress - g.progress) * RACE_SCREEN_SCALE;
        if (y < 35 || y > h + 35)
            continue;
        const x = raceTrackCenterAt(hazard.progress) + hazard.lane * trackWidth;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(g.frame * 0.035 + hazard.spin);
        ctx.shadowColor = '#ffb35c';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#b66d43';
        ctx.strokeStyle = '#ffdda0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4;
            const r = i % 2 === 0 ? 14 : 9;
            const px = Math.cos(a) * r,
            py = Math.sin(a) * r;
            if (i === 0)
                ctx.moveTo(px, py);
            else
                ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    // Rivales y destellos de colisión.
    for (const rival of g.rivals) {
        const y = raceRivalScreenY(rival, g);
        if (y < 34 || y > h + 30)
            continue;
        drawRaceRival(rival, raceRivalX(rival), y);
    }
    for (const spark of g.sparks) {
        ctx.globalAlpha = Math.max(0, spark.life / 22);
        ctx.fillStyle = spark.color;
        ctx.fillRect(spark.x, spark.y, 4, 4);
    }
    ctx.globalAlpha = 1;
    if (!g.over || g.won) {
        if (g.player.hitTimer > 0 && Math.floor(g.player.hitTimer / 4) % 2 === 0)
            ctx.globalAlpha = 0.35;
        drawEnterpriseArcadeShip(g.player.x, g.player.y, 0);
        ctx.globalAlpha = 1;
    }
    const place = 1 + g.rivals.filter(r => r.progress > g.progress).length;
    const pct = Math.min(100, Math.floor(g.progress / g.finishDistance * 100));
    ctx.fillStyle = 'rgba(0,8,20,0.82)';
    ctx.fillRect(0, 0, w, 47);
    text(starshipRaceInstructions1, w / 2, 19, 24, '#7eeeff', false);
    text(`${starshipRaceInstructions2} ${pct}%`, w * 0.22, 38, 24, '#ffffff', false);
    ctx.fillStyle = '#19394d';
    ctx.fillRect(w * 0.36, 29, w * 0.28, 9);
    ctx.fillStyle = '#58e9ff';
    ctx.fillRect(w * 0.36, 29, w * 0.28 * pct / 100, 9);
    text(`${starshipRaceInstructions3} ${place}/4`, w * 0.80, 38, 24, '#ffdc72', false);
    text(starshipRaceInstructions4, w / 2, h - 10, 24, '#c5e7f5', false);
    if (g.offTrack && !g.over)
        text(starshipRaceInstructions5, w / 2, h - 34, 12, '#ffbb67', false);
    else if (g.lastImpact && g.player.hitTimer > 0)
        text(g.lastImpact, w / 2, h - 34, 12, '#ff8e77', false);
    if (g.over) {
        ctx.fillStyle = 'rgba(1,6,17,0.82)';
        ctx.fillRect(0, 0, w, h);

        if (!g.overFrame) g.overFrame = frameCount;
        const elapsed = frameCount - g.overFrame;

        //text(g.won ? starshipRaceEndWin1 : starshipRaceEndLoose1, w / 2, h / 2 - 35, 26, g.won ? '#ffdc72' : '#ff716d', true);
        textWithAnimation(
            g.won ? starshipRaceEndWin1 : starshipRaceEndLoose1,
            w / 2,
            h / 2 - 35,
            10,            // Tamaño inicial pequeño
            120,            // Tamaño final
            25,
            elapsed,
            g.won ? '#ffdc72' : '#ff716d',
            false
        );
        text(g.won ? starshipRaceEndWin2 : starshipRaceEndLoose2, w / 2, h / 2, 30, '#ffffff');
        text(starshipRaceEndText1 + (g.won ? starshipRaceEndText2 : starshipRaceEndText3), w / 2, h / 2 + 45, 30, '#7eeeff', false);
        text(starshipRaceEndText4, w / 2, h / 2 + 90, 30, '#c5e7f5');
    }
}

// ------------------------------------------------------------
// MODO ENTRENAMIENTO: PUENTE, MENSAJES DE LA FLOTA Y HOLODECK
// El puente y el escenario de plataformas se dibujan con canvas.
// ------------------------------------------------------------

function drawTrainingBridgeBackdrop() {
    const w = canvas.width,
        h = canvas.height;
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#09182a');
    bg.addColorStop(0.58, '#152d44');
    bg.addColorStop(1, '#050a13');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Ventanal panorámico y espacio exterior.
    ctx.fillStyle = '#020916';
    ctx.fillRect(w * 0.12, h * 0.10, w * 0.76, h * 0.40);
    ctx.save();
    ctx.beginPath();
    ctx.rect(w * 0.12, h * 0.10, w * 0.76, h * 0.40);
    ctx.clip();

    const windowWidth = w * 0.76;
    const windowHeight = h * 0.40;

    // Nivel 1: Estrellas lejanas (lentas, pequeñas y tenues)
    for (let i = 0; i < 45; i++) {
        const rx = Math.abs(Math.sin(i * 12.9898 + 1.1) * 43758.5453) % 1;
        const ry = Math.abs(Math.sin(i * 78.233 + 2.3) * 43758.5453) % 1;

        const rawX = (rx * windowWidth + frameCount * 0.05) % windowWidth;
        const sx = w * 0.12 + rawX;
        const sy = h * 0.10 + ry * windowHeight;

        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx, sy, 1, 1);
    }

    // Nivel 2: Estrellas medianas (velocidad media)
    for (let i = 0; i < 28; i++) {
        const rx = Math.abs(Math.sin(i * 31.415 + 55.2) * 22159.876) % 1;
        const ry = Math.abs(Math.sin(i * 64.882 + 11.4) * 22159.876) % 1;

        const rawX = (rx * windowWidth + frameCount * 0.18) % windowWidth;
        const sx = w * 0.12 + rawX;
        const sy = h * 0.10 + ry * windowHeight;

        ctx.globalAlpha = 0.65;
        ctx.fillStyle = i % 3 === 0 ? '#7de9ff' : '#ffffff';
        ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Nivel 3: Estrellas cercanas / brillantes (más rápidas)
    for (let i = 0; i < 15; i++) {
        const rx = Math.abs(Math.sin(i * 93.123 + 129.5) * 15481.993) % 1;
        const ry = Math.abs(Math.sin(i * 27.451 + 77.1) * 15481.993) % 1;

        const rawX = (rx * windowWidth + frameCount * 0.40) % windowWidth;
        const sx = w * 0.12 + rawX;
        const sy = h * 0.10 + ry * windowHeight;

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#7de9ff';
        ctx.fillRect(sx, sy, 2.5, 2.5);
    }

    ctx.restore();
    ctx.strokeStyle = '#4b758d';
    ctx.lineWidth = 8;
    ctx.strokeRect(w * 0.12, h * 0.10, w * 0.76, h * 0.40);

    // Estructura del puente, consolas y suelo.
    ctx.fillStyle = '#263b50';
    ctx.fillRect(0, h * 0.49, w, h * 0.18);
    ctx.fillStyle = '#40566a';
    ctx.fillRect(0, h * 0.49, w, 7);
    for (let i = 0; i < 7; i++) {
        const x = 16 + i * (w - 32) / 7;
        ctx.fillStyle = i % 2 ? '#1a3349' : '#18283b';
        ctx.fillRect(x, h * 0.53, w / 8 - 7, h * 0.10);
        for (let j = 0; j < 5; j++) {
            ctx.fillStyle = ['#53d8ea', '#ffc65c', '#e45c68'][(i + j) % 3];
            ctx.globalAlpha = 0.45 + (j % 2) * 0.25;
            ctx.fillRect(x + 7 + j * 8, h * 0.56 + (j % 2) * 7, 4, 3);
        }
        ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#101a27';
    ctx.fillRect(0, h * 0.68, w, h * 0.32);
    ctx.fillStyle = '#34495c';
    ctx.fillRect(0, h * 0.68, w, 5);
    ctx.strokeStyle = 'rgba(104,202,235,0.35)';
    ctx.lineWidth = 2;
    for (let x = 0; x < w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, h * 0.70);
        ctx.lineTo(x - 34, h);
        ctx.stroke();
    }

    // Consola de mando principal en primer plano.
    ctx.fillStyle = '#3b5366';
    ctx.beginPath();
    ctx.moveTo(w * 0.30, h * 0.75);
    ctx.lineTo(w * 0.70, h * 0.75);
    ctx.lineTo(w * 0.77, h * 0.93);
    ctx.lineTo(w * 0.23, h * 0.93);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#091724';
    ctx.fillRect(w * 0.34, h * 0.77, w * 0.32, h * 0.07);
    for (let i = 0; i < 12; i++) {
        ctx.fillStyle = i % 3 === 0 ? '#ffc65c' : '#5be7f4';
        ctx.fillRect(w * 0.36 + i * w * 0.023, h * 0.795, 9, 3);
    }
    ctx.fillStyle = '#8aa0b3';
    ctx.font = `bold 11px ${GAME_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(trainingBridge, w / 2, h * 0.972);
}

function wrapCanvasText(str, centerX, startY, maxWidth, lineHeight, color, font = GAME_FONT) {
    ctx.font = `25px ${font}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    const words = str.split(/\s+/);
    let line = '';
    let y = startY;
    for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, centerX, y);
            y += lineHeight;
            line = word;
        } else
            line = test;
    }
    if (line)
        ctx.fillText(line, centerX, y);
}

function drawTrainingBridge() {
    drawTrainingBridgeBackdrop();
    ctx.fillStyle = 'rgba(2, 8, 19, 0.78)';
    ctx.fillRect(38, 24, canvas.width - 76, 80);
    text(trainingBridgeAcademy, canvas.width / 2, 52, 37, '#79edff', false);
    text(trainingBridgeModus, canvas.width / 2, 78, 22, '#ffd66b', false);
    const d = trainingDialogue[trainingDialogueIndex];
    ctx.fillStyle = 'rgba(3, 12, 25, 0.91)';
    ctx.fillRect(52, canvas.height * 0.64, canvas.width - 104, 126);
    ctx.strokeStyle = '#64dff4';
    ctx.lineWidth = 2;
    ctx.strokeRect(52, canvas.height * 0.64, canvas.width - 104, 126);
    text(d.speaker, canvas.width / 2, canvas.height * 0.64 + 25, 22, '#ffd66b', false);
    wrapCanvasText(d.text, canvas.width / 2, canvas.height * 0.64 + 58, canvas.width - 150, 22, '#ffffff');
    // Muestra un personaje real del elenco en el puente y permite escoger
    // quién hará el circuito del holodeck. El selector es exclusivo del entrenamiento.
    const selected = availableCharacters[trainingCharacterIndex] || availableCharacters[0];
    const previewX = canvas.width * 0.74;
    const previewY = canvas.height * 0.31;
    ctx.fillStyle = 'rgba(2, 10, 22, 0.68)';
    ctx.fillRect(previewX - 75, previewY - 65, 150, 130);
    ctx.strokeStyle = '#69dff1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(previewX - 75, previewY - 65, 150, 130);
    if (imageIsReady(selected.guardImg)) {
        const previewW = 130;
        const previewH = previewW * selected.guardImg.naturalHeight / selected.guardImg.naturalWidth;
        ctx.drawImage(selected.guardImg, previewX - previewW / 2, previewY - previewH / 2 - 4, previewW, previewH);
    } else {
        ctx.fillStyle = '#d9b77d';
        ctx.fillRect(previewX - 9, previewY - 25, 18, 18);
        ctx.fillStyle = '#e3b72f';
        ctx.fillRect(previewX - 12, previewY - 7, 24, 30);
        ctx.fillStyle = '#172638';
        ctx.fillRect(previewX - 10, previewY + 22, 8, 14);
        ctx.fillRect(previewX + 2, previewY + 22, 8, 14);
    }
    text(selected.name, previewX, previewY + 48, 22, '#ffdc72', false);
    text(trainingBridgeInstructions1, previewX, previewY + 86, 22, '#8ff5ff', false);
    text(trainingBridgeInstructions2, canvas.width / 2, canvas.height - 16, 20, '#8ff5ff', false);
    text(`${trainingDialogueIndex + 1} / ${trainingDialogue.length}`, canvas.width - 70, 125, 28, '#c6d8e6');
}

function drawTrainingMissionBriefing() {
    drawTrainingBridgeBackdrop();
    overlay(0.55);
    text(trainingMissionBriefing1, canvas.width / 2, 66, 40, '#7feeff', true);
    text(trainingMissionBriefing2, canvas.width / 2, 115, 32, '#ffdc72', false);
    text(trainingMissionBriefing3, canvas.width / 2, 175, 24, '#ffffff');
    text(trainingMissionBriefing4, canvas.width / 2, 235, 23, '#8ff5ff', false);
    text(trainingMissionBriefing5, canvas.width / 2, 275, 23, '#8ff5ff', false);
    text(trainingMissionBriefing6, canvas.width / 2, 380, 22, '#d4e6f0');
    text(trainingMissionBriefing7, canvas.width / 2, 522, 28, '#ffdc72', false);
}

// Galería de tiro previa al pilotaje. Se apunta con WASD/flechas y se dispara
// con Espacio/Intro. Hay 16 disparos y hacen falta 8 aciertos para aprobar.
function spawnTrainingRangeTarget(g) {
    const w = canvas.width,
    h = canvas.height;
    const amp = Math.min(90, w * 0.12);
    g.target = {
        baseX: w * 0.22 + Math.random() * w * 0.56,
        y: h * 0.23 + Math.random() * h * 0.24,
        amplitude: amp * (0.45 + Math.random() * 0.55),
        speed: 0.025 + Math.random() * 0.022,
        phase: Math.random() * Math.PI * 2,
        radius: 20
    };
}

function beginTrainingShootingRange() {
    const w = canvas.width,
    h = canvas.height;
    trainingRangeGame = {
        frame: 0,
        aimX: w / 2,
        aimY: h * 0.66,
        shots: 30,
        hits: 0,
        requiredHits: 8,
        timeLeft: 60 * 45,
        over: false,
        passed: false,
        feedback: '',
        feedbackTimer: 0,
        targetCooldown: 0,
        beam: null,
        beamTimer: 0,
        target: null
    };
    spawnTrainingRangeTarget(trainingRangeGame);
    for (const k in keys)
        keys[k] = false;
    gameState = 'TRAINING_SHOOTING_RANGE';
}

function fireTrainingRangeShot() {
    const g = trainingRangeGame;
    // Durante la breve reaparición del blanco no se consume munición.
    if (!g || g.over || !g.target || g.shots <= 0 || g.beamTimer > 0)
        return;
    g.shots--;
    const t = g.target;
    const targetX = t ? t.baseX + Math.sin(g.frame * t.speed + t.phase) * t.amplitude : g.aimX;
    const targetY = t ? t.y + Math.sin(g.frame * 0.045 + t.phase) * 7 : g.aimY;
    const hit = !!t && Math.hypot(g.aimX - targetX, g.aimY - targetY) <= t.radius + 11;
    g.beam = {
        x1: g.aimX,
        y1: g.aimY,
        x2: targetX,
        y2: targetY,
        hit
    };
    g.beamTimer = 7;
    if (hit) {
        g.hits++;
        g.feedback = trainingRangeImpact;
        g.feedbackTimer = 30;
        g.target = null;
        g.targetCooldown = 14;
        if (g.hits >= g.requiredHits) {
            g.over = true;
            g.passed = true;
        }
    } else {
        g.feedback = trainingRangeImpactFail;
        g.feedbackTimer = 22;
        if (g.shots <= 0)
            g.over = true;
    }
    if (g.shots <= 0 && g.hits < g.requiredHits)
        g.over = true;
}

function updateTrainingShootingRange() {
    const g = trainingRangeGame;
    if (gameState !== 'TRAINING_SHOOTING_RANGE' || !g || g.over)
        return;
    g.frame++;
    g.timeLeft--;
    if (g.feedbackTimer > 0)
        g.feedbackTimer--;
    if (g.beamTimer > 0)
        g.beamTimer--;
    const speed = 5.2;
    if (keys.ArrowLeft || keys.a || keys.A)
        g.aimX -= speed;
    if (keys.ArrowRight || keys.d || keys.D)
        g.aimX += speed;
    if (keys.ArrowUp || keys.w || keys.W)
        g.aimY -= speed;
    if (keys.ArrowDown || keys.s || keys.S)
        g.aimY += speed;
    g.aimX = clamp(g.aimX, 22, canvas.width - 22);
    g.aimY = clamp(g.aimY, 82, canvas.height - 54);
    if (g.targetCooldown > 0) {
        g.targetCooldown--;
        if (g.targetCooldown === 0 && g.hits < g.requiredHits)
            spawnTrainingRangeTarget(g);
    }
    if (g.timeLeft <= 0) {
        g.timeLeft = 0;
        g.over = true;
    }
}

function drawTrainingShootingRange() {
    const w = canvas.width,
    h = canvas.height,
    g = trainingRangeGame;
    drawTrainingBridgeBackdrop();
    // Overlay que transforma el puente en una galería táctica de la Flota.
    ctx.fillStyle = 'rgba(2,8,18,0.58)';
    ctx.fillRect(25, 24, w - 50, h - 48);
    text(trainingShootingRangeText1, w / 2, 46, 43, '#82eeff', false);
    text(trainingShootingRangeText2, w / 2, 82, 40, '#ffdc72', false);
    if (!g)
        return;
    // Líneas de telémetro en el fondo.
    ctx.strokeStyle = 'rgba(91,211,236,0.14)';
    ctx.lineWidth = 1;
    for (let x = 70; x < w; x += 70) {
        ctx.beginPath();
        ctx.moveTo(x, 95);
        ctx.lineTo(x, h - 65);
        ctx.stroke();
    }
    for (let y = 115; y < h - 65; y += 55) {
        ctx.beginPath();
        ctx.moveTo(45, y);
        ctx.lineTo(w - 45, y);
        ctx.stroke();
    }
    if (g.target && !g.over) {
        const t = g.target,
        tx = t.baseX + Math.sin(g.frame * t.speed + t.phase) * t.amplitude;
        const ty = t.y + Math.sin(g.frame * 0.045 + t.phase) * 7;
        ctx.save();
        ctx.shadowColor = '#ff5c68';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#4e1830';
        ctx.strokeStyle = '#ff7880';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(tx, ty, t.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffb5b9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tx, ty, t.radius * 0.58, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffcf73';
        ctx.beginPath();
        ctx.arc(tx, ty, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    if (g.beam && g.beamTimer > 0) {
        ctx.save();
        ctx.globalAlpha = g.beamTimer / 7;
        ctx.strokeStyle = g.beam.hit ? '#8bffdc' : '#ff6170';
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(g.beam.x1, g.beam.y1);
        ctx.lineTo(g.beam.x2, g.beam.y2);
        ctx.stroke();
        ctx.restore();
    }
    // Mira controlable.
    ctx.save();
    ctx.strokeStyle = '#7dffff';
    ctx.shadowColor = '#55f7ff';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(g.aimX, g.aimY, 14, 0, Math.PI * 2);
    ctx.moveTo(g.aimX - 23, g.aimY);
    ctx.lineTo(g.aimX - 7, g.aimY);
    ctx.moveTo(g.aimX + 7, g.aimY);
    ctx.lineTo(g.aimX + 23, g.aimY);
    ctx.moveTo(g.aimX, g.aimY - 23);
    ctx.lineTo(g.aimX, g.aimY - 7);
    ctx.moveTo(g.aimX, g.aimY + 7);
    ctx.lineTo(g.aimX, g.aimY + 23);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(1,7,17,0.86)';
    ctx.fillRect(35, 88, w - 70, 35);
    text(`${trainingShootingRangeHits}${g.hits}/${g.requiredHits}${trainingShootingRangeShoots}${g.shots}${trainingShootingRangeTime}${Math.ceil(g.timeLeft / 60)}s`, w / 2, 110, 23, '#ffffff', false);
    if (g.feedbackTimer > 0)
        text(g.feedback, w / 2, h - 78, 23, g.feedback.startsWith('¡') ? '#8dffc9' : '#ff9b9b', false);
    if (g.over) {
        ctx.fillStyle = 'rgba(0,4,12,0.84)';
        ctx.fillRect(0, 0, w, h);
        text(g.passed ? trainingShootingRangeWin : trainingShootingRangeFail, w / 2, h / 2 - 45, 54, g.passed ? '#ffdc72' : '#ff716d', false);
        text(`${trainingShootingRangeDoneA}${g.hits}/${g.requiredHits}${trainingShootingRangeDoneB}${g.shots}`, w / 2, h / 2, 34, '#ffffff', false);
        text(g.passed ? trainingShootingRangePrecise : trainingShootingRangeNoPrecise, w / 2, h / 2 + 42, 32, '#d6e9f4');
        text(g.passed ? trainingShootingRangeKeyNext : trainingShootingRangeKeyRepeat, w / 2, h / 2 + 80, 32, '#8ff5ff', false);
    }
    text(trainingShootingRangeInstructions, w / 2, h - 18, 22, '#b6d9e8', false);
}

function beginHolodeckLevel(circuitIndex = trainingCircuitIndex) {
    trainingCircuitIndex = clamp(circuitIndex, 0, holodeckCourses.length - 1);
    const w = canvas.width,
    h = canvas.height,
    floor = h - 43;
    const course = holodeckCourses[trainingCircuitIndex];
    const platforms = course.ground.map(([x, width]) => ({
                x,
                y: floor,
                w: width,
                h: 43,
                ground: true
            }));
    for (const [x, heightAboveFloor, width] of course.upper) {
        platforms.push({
            x,
            y: floor - heightAboveFloor,
            w: width,
            h: 18,
            ground: false
        });
    }
    holodeckGame = {
        circuitIndex: trainingCircuitIndex,
        courseName: course.name,
        theme: course.theme,
        worldWidth: course.worldWidth,
        cameraX: 0,
        score: 0,
        lives: 3,
        collected: 0,
        over: false,
        complete: false,
        frame: 0,
        player: {
            x: 35,
            y: floor - 37,
            w: 25,
            h: 37,
            vy: 0,
            speed: 3.6,
            jump: -10.6,
            onGround: true,
            invulnerable: 0,
            jumpRequested: false,
            facing: 1
        },
        characterIndex: trainingCharacterIndex,
        platforms,
        coins: course.coins.map(([x, heightAboveFloor]) => ({
                x,
                y: floor - heightAboveFloor,
                got: false
            })),
        enemies: course.enemies.map(([x, min, max, speed], i) => ({
                x,
                min,
                max,
                dir: i % 2 ? -1 : 1,
                speed,
                alive: true
            }))
    };
    for (const k in keys)
        keys[k] = false;
    gameState = 'HOLODECK';
}

function updateHolodeckLevel() {
    const g = holodeckGame;
    if (gameState !== 'HOLODECK' || !g || g.over || g.complete)
        return;
    const p = g.player,
    h = canvas.height;
    g.frame++;
    if (p.invulnerable > 0)
        p.invulnerable--;
    let dx = 0;
    if (keys.ArrowLeft || keys.a || keys.A)
        dx--;
    if (keys.ArrowRight || keys.d || keys.D)
        dx++;
    if (dx !== 0)
        p.facing = dx > 0 ? 1 : -1;
    p.x = clamp(p.x + dx * p.speed, 0, g.worldWidth - p.w);
    if (p.jumpRequested && p.onGround) {
        p.vy = p.jump;
        p.onGround = false;
    }
    p.jumpRequested = false;
    const prevBottom = p.y + p.h;
    p.vy = Math.min(12, p.vy + 0.48);
    p.y += p.vy;
    p.onGround = false;
    for (const plat of g.platforms) {
        const overlapsX = p.x + p.w > plat.x && p.x < plat.x + plat.w;
        const newBottom = p.y + p.h;
        if (overlapsX && p.vy >= 0 && prevBottom <= plat.y + 5 && newBottom >= plat.y) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.onGround = true;
        }
    }
    if (p.y > h + 90) {
        g.lives--;
        p.x = 35;
        p.y = h - 43 - p.h;
        p.vy = 0;
        p.onGround = true;
        p.invulnerable = 75;
        if (g.lives <= 0) {
            g.lives = 0;
            g.over = true;
            g.overFrame = g.frame;
        }
    }
    for (const coin of g.coins) {
        if (!coin.got && Math.abs((p.x + p.w / 2) - coin.x) < 25 && Math.abs((p.y + p.h / 2) - coin.y) < 28) {
            coin.got = true;
            g.collected++;
            g.score += 50;
        }
    }
    for (const e of g.enemies) {
        if (!e.alive)
            continue;
        e.x += e.dir * e.speed;
        if (e.x < e.min || e.x > e.max)
            e.dir *= -1;
        const overlapX = p.x < e.x + 22 && p.x + p.w > e.x - 22;
        const groundTop = h - 43;
        const enemyTop = groundTop - 32;
        const overlapY = p.y < groundTop && p.y + p.h > enemyTop;
        if (overlapX && overlapY && p.invulnerable <= 0) {
            if (p.vy > 1.2 && p.y + p.h < h - 47) {
                e.alive = false;
                p.vy = -6.2;
                g.score += 100;
            } else {
                g.lives--;
                p.invulnerable = 90;
                p.vy = -5;
                p.x = Math.max(0, p.x - 60);
                if (g.lives <= 0) {
                    g.lives = 0;
                    g.over = true;
                    g.overFrame = g.frame;
                }
            }
        }
    }
    g.cameraX = clamp(p.x - canvas.width * 0.34, 0, g.worldWidth - canvas.width);
    if (p.x + p.w >= g.worldWidth - 78) {
        g.complete = true;
        g.score += g.collected * 10;
    }
}

function drawPixelStar(cx, cy, outer, inner, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5,
        r = i % 2 ? inner : outer;
        const x = cx + Math.cos(a) * r,
        y = cy + Math.sin(a) * r;
        if (!i)
            ctx.moveTo(x, y);
        else
            ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
}

// Enemigos del holodeck: drones Borg dibujados en pixel-art.
// Conservan el tamaño aproximado y el punto de apoyo de los enemigos originales.
function drawBorgHolodeckEnemy(x, y, facing = 1, frame = 0) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(facing < 0 ? -1 : 1, 1);
    // Sombra al pie, pegada al suelo.
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 25, 18, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Conductos y soporte mecánico detrás de la cabeza.
    ctx.strokeStyle = '#263a35';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, -11);
    ctx.lineTo(-13, -17);
    ctx.lineTo(-13, -8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -11);
    ctx.lineTo(13, -16);
    ctx.lineTo(13, -6);
    ctx.stroke();
    ctx.fillStyle = '#8ca59a';
    ctx.fillRect(-15, -18, 5, 8);
    ctx.fillRect(10, -17, 5, 8);
    ctx.fillStyle = '#263a35';
    ctx.fillRect(-14, -17, 3, 6);
    ctx.fillRect(11, -16, 3, 6);
    // Piernas articuladas y botas.
    ctx.fillStyle = '#25342f';
    ctx.fillRect(-11, 15, 8, 9);
    ctx.fillRect(3, 15, 8, 9);
    ctx.fillStyle = '#63766d';
    ctx.fillRect(-12, 19, 9, 4);
    ctx.fillRect(3, 19, 9, 4);
    ctx.fillStyle = '#111d1a';
    ctx.fillRect(-13, 22, 10, 4);
    ctx.fillRect(3, 22, 10, 4);
    // Torso biomecánico con armadura segmentada.
    ctx.fillStyle = '#344b42';
    ctx.fillRect(-14, -2, 28, 20);
    ctx.fillStyle = '#899c90';
    ctx.fillRect(-11, 0, 22, 14);
    ctx.fillStyle = '#4c6257';
    ctx.fillRect(-8, 2, 16, 10);
    ctx.fillStyle = '#192a25';
    ctx.fillRect(-5, 3, 10, 8);
    ctx.fillStyle = '#8cff5b';
    ctx.fillRect(-2, 5, 4, 3);
    // Hombros y brazos, uno reforzado con implantes.
    ctx.fillStyle = '#6e8175';
    ctx.fillRect(-18, 0, 7, 10);
    ctx.fillRect(11, 0, 7, 10);
    ctx.fillStyle = '#26352f';
    ctx.fillRect(-17, 8, 6, 8);
    ctx.fillRect(11, 8, 6, 8);
    ctx.fillStyle = '#87978b';
    ctx.fillRect(-18, 5, 7, 4);
    ctx.fillRect(11, 5, 7, 4);
    ctx.fillStyle = '#8cff5b';
    ctx.fillRect(12, 2, 3, 3);
    // Cabeza gris verdosa, placa ocular y asimetría cibernética.
    ctx.fillStyle = '#1a2924';
    ctx.fillRect(-12, -17, 24, 17);
    ctx.fillStyle = '#9aa99c';
    ctx.fillRect(-9, -16, 18, 14);
    ctx.fillStyle = '#64766b';
    ctx.fillRect(-8, -15, 16, 4);
    ctx.fillStyle = '#1c2924';
    ctx.fillRect(-10, -11, 20, 5);
    ctx.fillStyle = '#b5c1b6';
    ctx.fillRect(-7, -10, 14, 3);
    // Visor ocular rojo y luz de implante verde.
    ctx.fillStyle = '#2a1418';
    ctx.fillRect(-8, -11, 7, 5);
    ctx.fillStyle = '#ff4147';
    ctx.fillRect(-7, -10, 5, 3);
    ctx.fillStyle = '#d7ffe0';
    ctx.fillRect(-6, -10, 2, 1);
    ctx.fillStyle = '#34453d';
    ctx.fillRect(3, -12, 7, 7);
    ctx.fillStyle = '#8cff5b';
    ctx.fillRect(5, -10, 3, 3);
    // Boca, panel lateral y luces pulsantes.
    ctx.fillStyle = '#23332d';
    ctx.fillRect(-4, -5, 8, 2);
    ctx.fillStyle = '#76877b';
    ctx.fillRect(-8, -5, 3, 2);
    ctx.fillRect(5, -5, 3, 2);
    ctx.fillStyle = '#101a17';
    ctx.fillRect(8, -15, 5, 11);
    ctx.fillStyle = '#8cff5b';
    ctx.fillRect(9, -13, 3, 2);
    ctx.fillRect(9, -8, 3, 2);
    const pulse = Math.floor(frame / 12) % 2 === 0;
    ctx.fillStyle = pulse ? '#9dff65' : '#4fbe55';
    ctx.fillRect(13, -20, 4, 4);
    ctx.fillStyle = 'rgba(140,255,91,0.28)';
    ctx.fillRect(10, -22, 9, 2);
    ctx.restore();
}

function drawHolodeckLevel() {
    const g = holodeckGame;
    const w = canvas.width,
    h = canvas.height;
    if (!g)
        return;
    const camera = g.cameraX;
    const palettes = {
        classic: {
            sky: ['#55c7ff', '#b4efff', '#e8faff'],
            hills: ['#63c97c', '#80d98b'],
            ground: '#2dbb61',
            dirt: '#b86a36',
            groundLine: '#78421f',
            block: '#db8037',
            blockTop: '#ffcf65',
            blockLine: '#9a4e2a',
            dot: '#f5b341',
            tube: '#168c8c',
            tubeTop: '#41e0bd',
            tubeShade: '#0b5f70'
        },
        space: {
            sky: ['#04091f', '#172b5b', '#090f25'],
            hills: ['#1b3970', '#263d88'],
            ground: '#39a9c9',
            dirt: '#243b68',
            groundLine: '#66dff5',
            block: '#245a8a',
            blockTop: '#69e4ff',
            blockLine: '#163858',
            dot: '#b2f5ff',
            tube: '#8b4de0',
            tubeTop: '#d7a3ff',
            tubeShade: '#48246d'
        },
        volcano: {
            sky: ['#280e20', '#85361f', '#f29a46'],
            hills: ['#642c38', '#a44332'],
            ground: '#ff6944',
            dirt: '#38313d',
            groundLine: '#ffcf6b',
            block: '#60404a',
            blockTop: '#ff8448',
            blockLine: '#2e2634',
            dot: '#ffe16b',
            tube: '#9c342d',
            tubeTop: '#ff9757',
            tubeShade: '#60212c'
        },
        ice: {
            sky: ['#9ce9ff', '#e1fbff', '#f6fdff'],
            hills: ['#a1d8e9', '#c8f0f6'],
            ground: '#83deef',
            dirt: '#6b9fb9',
            groundLine: '#e5fcff',
            block: '#8ac4e0',
            blockTop: '#dffaff',
            blockLine: '#4e8fae',
            dot: '#ffffff',
            tube: '#3679b6',
            tubeTop: '#8ee8ff',
            tubeShade: '#24527c'
        }
    };
    const palette = palettes[g.theme] || palettes.classic;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, palette.sky[0]);
    sky.addColorStop(0.63, palette.sky[1]);
    sky.addColorStop(1, palette.sky[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    if (g.theme === 'space') {
        // Asteroides y estrellas en el corredor espacial.
        for (let i = 0; i < 65; i++) {
            const x = ((i * 137 - camera * 0.17) % (w + 50) + w + 50) % (w + 50) - 25;
            const y = (i * 71) % (h - 65);
            ctx.fillStyle = i % 7 === 0 ? '#a6f6ff' : 'rgba(255,255,255,0.62)';
            ctx.fillRect(x, y, i % 7 === 0 ? 3 : 1, i % 7 === 0 ? 3 : 1);
        }
        for (let i = 0; i < 5; i++) {
            const x = ((i * 245 - camera * 0.30) % (w + 180) + w + 180) % (w + 180) - 90,
            y = 105 + (i % 3) * 75;
            ctx.fillStyle = '#33466f';
            ctx.beginPath();
            ctx.arc(x, y, 30 + (i % 2) * 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#5e779f';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    } else {
        // Nubes/ceniza y colinas con desplazamiento parallax según el circuito.
        for (let i = 0; i < 9; i++) {
            const x = ((i * 167 - camera * 0.22) % (w + 170) + w + 170) % (w + 170) - 70,
            y = 52 + (i % 3) * 38;
            ctx.fillStyle = g.theme === 'volcano' ? 'rgba(255,190,126,0.30)' : g.theme === 'ice' ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.90)';
            ctx.fillRect(x, y, 58, 15);
            ctx.fillRect(x + 12, y - 10, 22, 14);
            ctx.fillRect(x + 35, y - 5, 18, 10);
        }
        for (let i = 0; i < 7; i++) {
            const x = ((i * 220 - camera * 0.38) % (w + 240) + w + 240) % (w + 240) - 110;
            ctx.fillStyle = palette.hills[i % 2];
            ctx.beginPath();
            ctx.ellipse(x, h - 28, 125, 95, 0, Math.PI, Math.PI * 2);
            ctx.fill();
        }
    }
    // Plataformas y terreno de bloques, con paletas diferentes en cada circuito.
    for (const plat of g.platforms) {
        const sx = plat.x - camera;
        if (sx + plat.w < -10 || sx > w + 10)
            continue;
        if (plat.ground) {
            ctx.fillStyle = palette.ground;
            ctx.fillRect(sx, plat.y, plat.w, 7);
            ctx.fillStyle = palette.dirt;
            ctx.fillRect(sx, plat.y + 7, plat.w, plat.h - 7);
            ctx.strokeStyle = palette.groundLine;
            ctx.lineWidth = 2;
            for (let bx = sx; bx < sx + plat.w; bx += 28) {
                ctx.strokeRect(bx, plat.y + 9, 28, 17);
                if (((bx - sx) / 28 | 0) % 2 === 0)
                    ctx.strokeRect(bx, plat.y + 26, 28, 14);
            }
        } else {
            ctx.fillStyle = palette.block;
            ctx.fillRect(sx, plat.y, plat.w, plat.h);
            ctx.fillStyle = palette.blockTop;
            ctx.fillRect(sx, plat.y, plat.w, 4);
            ctx.strokeStyle = palette.blockLine;
            ctx.lineWidth = 2;
            for (let bx = sx; bx < sx + plat.w; bx += 25)
                ctx.strokeRect(bx, plat.y, 25, plat.h);
            ctx.fillStyle = palette.dot;
            for (let bx = sx + 12; bx < sx + plat.w; bx += 25)
                ctx.fillRect(bx, plat.y + 6, 3, 3);
        }
    }
    // Elementos decorativos del holodeck, con siluetas distintas por sector.
    for (const xw of[365, 770, 1195, 1668, 2087, 2500, 2850]) {
        const x = xw - camera;
        if (x < -80 || x > w + 30)
            continue;
        ctx.fillStyle = palette.tube;
        ctx.fillRect(x, h - 85, 44, 42);
        ctx.fillStyle = palette.tubeTop;
        ctx.fillRect(x - 5, h - 88, 54, 10);
        ctx.fillStyle = palette.tubeShade;
        ctx.fillRect(x + 8, h - 74, 28, 31);
    }
    for (const coin of g.coins) {
        if (coin.got)
            continue;
        const x = coin.x - camera;
        ctx.save();
        ctx.shadowColor = '#ffe26f';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffda4d';
        ctx.beginPath();
        ctx.arc(x, coin.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff3ad';
        ctx.fillRect(x - 2, coin.y - 5, 3, 10);
        ctx.restore();
    }
    for (const e of g.enemies) {
        if (!e.alive)
            continue;
        const x = e.x - camera;
        const y = h - 61;
        const facing = (g.player.x + g.player.w / 2) < e.x ? -1 : 1;
        drawBorgHolodeckEnemy(x, y, facing, g.frame);
    }
    // El avatar del holodeck usa el sprite de guardia del personaje elegido.
    // La caja de colisión se conserva pequeña, pero el arte se dibuja a escala
    // proporcional y con los pies alineados al suelo/plataforma.
    const p = g.player,
    sx = p.x - camera,
    sy = p.y;
    const character = availableCharacters[g.characterIndex] || availableCharacters[0];
    const avatar = character && character.guardImg;
    if (!(p.invulnerable > 0 && Math.floor(p.invulnerable / 5) % 2 === 0)) {
        ctx.fillStyle = 'rgba(0,0,0,0.20)';
        ctx.beginPath();
        ctx.ellipse(sx + p.w / 2, sy + p.h + 2, 32, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        if (imageIsReady(avatar)) {
            // Doble tamaño visual en la prueba del holodeck; los pies siguen anclados a la plataforma.
            const spriteW = 76;
            const spriteH = spriteW * avatar.naturalHeight / avatar.naturalWidth;
            const spriteX = sx + p.w / 2 - spriteW / 2;
            const spriteY = sy + p.h - spriteH;
            ctx.save();
            if (p.facing < 0) {
                ctx.translate(sx + p.w / 2, 0);
                ctx.scale(-1, 1);
                ctx.translate( - (sx + p.w / 2), 0);
            }
            ctx.drawImage(avatar, spriteX, spriteY, spriteW, spriteH);
            ctx.restore();
        } else {
            // Respaldo visual por si el PNG de este personaje aún no ha cargado.
            ctx.save();
            ctx.translate(sx, sy);
            ctx.fillStyle = '#172538';
            ctx.fillRect(4, 24, 7, 12);
            ctx.fillRect(15, 24, 7, 12);
            ctx.fillStyle = '#e8b98a';
            ctx.fillRect(6, 3, 14, 12);
            ctx.fillStyle = '#d5a72d';
            ctx.fillRect(3, 14, 20, 12);
            ctx.fillStyle = '#101d2d';
            ctx.fillRect(0, 15, 4, 13);
            ctx.fillRect(22, 15, 4, 13);
            ctx.restore();
        }
    }
    const goalX = g.worldWidth - 80 - camera;
    if (goalX > -40 && goalX < w + 30) {
        ctx.fillStyle = '#e8f8ff';
        ctx.fillRect(goalX, h - 145, 5, 102);
        ctx.fillStyle = '#16a8b8';
        ctx.beginPath();
        ctx.moveTo(goalX + 5, h - 145);
        ctx.lineTo(goalX + 53, h - 129);
        ctx.lineTo(goalX + 5, h - 111);
        ctx.closePath();
        ctx.fill();
        text('META', goalX + 23, h - 157, 11, '#153c58', false);
    }
    ctx.fillStyle = 'rgba(3,20,40,0.78)';
    ctx.fillRect(0, 0, w, 38);
    text(`${holodeckLevelTitle}${g.circuitIndex + 1}/${holodeckCourses.length}: ${g.courseName}`, w / 2, 24, 24, '#ffffff', false);
    text(`${holodeckLevelLives}${'◆ '.repeat(g.lives).trim()}`, 95, 61, 23, '#d33f47', false);
    text(`${holodeckLevelStars}${g.collected}/${g.coins.length}`, w - 112, 61, 23, g.theme === 'classic' ? '#60420b' : '#ffffff', false);
    text(holodeckLevelInstructions, w / 2, h - 12, 26, g.theme === 'volcano' ? '#ffffff' : '#153c58', false);
    if (g.over || g.complete) {
        ctx.fillStyle = 'rgba(4,12,27,0.82)';
        ctx.fillRect(0, 0, w, h);

        if (!g.overFrame) g.overFrame = frameCount;
        const elapsed = frameCount - g.overFrame;
        const isLastCircuit = g.circuitIndex >= holodeckCourses.length - 1;
        //text(g.complete ? `${holodeckLevelCompleted1}${g.circuitIndex + 1}${holodeckLevelCompleted2}` : holodeckLevelFail, w / 2, h / 2 - 42, 23, g.complete ? '#ffe071' : '#ff746d', false);
        textWithAnimation(
            g.complete ? `${holodeckLevelCompleted1}${g.circuitIndex + 1}${holodeckLevelCompleted2}` : holodeckLevelFail,
            w / 2,
            h / 2 - 80,
            10,
            120,
            25,
            elapsed,
            g.complete ? '#ffe071' : '#ff746d',
            false
        );
        text(`${g.courseName}${holodeckLevelPoints}${g.score}`, w / 2, h / 2 - 5, 36, '#ffffff', false);
        text(`${holodeckLevelStars}${g.collected}/${g.coins.length}`, w / 2, h / 2 + 40, 33, '#d4e6f0', false);
        text(g.complete ? (isLastCircuit ? holodeckLevelKeyStart : `${holodeckLevelKeyNext}${g.circuitIndex + 2}`) : holodeckLevelKeyRepeat, w / 2, h / 2 + 80, 22, '#8ff5ff', false);
        text(holodeckLevelKeyMenu, w / 2, h / 2 + 115, 22, '#c8dbe8');
    }
}

function beginIntelligenceTest() {
    intelligenceQuestions = pickRandomQuestions(intelligenceQuestionBank, 5);
    intelligenceQuestionIndex = 0;
    intelligenceScore = 0;
    intelligenceFeedback = null;
    for (const k in keys)
        keys[k] = false;
    gameState = 'INTELLIGENCE_TEST';
}

function beginStarTrekTrivia() {
    starTrekTriviaQuestions = pickRandomQuestions(starTrekTriviaQuestionBank, 5);
    triviaQuestionIndex = 0;
    triviaScore = 0;
    triviaFeedback = null;
    for (const k in keys)
        keys[k] = false;
    gameState = 'STAR_TREK_TRIVIA';
}

function answerTrainingQuestion(type, optionIndex) {
    const isIntelligence = type === 'intelligence';
    const questions = isIntelligence ? intelligenceQuestions : starTrekTriviaQuestions;
    const index = isIntelligence ? intelligenceQuestionIndex : triviaQuestionIndex;
    const q = questions[index];
    if (!q)
        return;
    const correct = optionIndex === q.answer;
    if (isIntelligence) {
        if (intelligenceFeedback !== null)
            return;
        if (correct)
            intelligenceScore++;
        intelligenceFeedback = {
            correct,
            text: (correct ? trainingQuestionCorrect : trainingQuestionFail) + q.explanation
        };
    } else {
        if (triviaFeedback !== null)
            return;
        if (correct)
            triviaScore++;
        triviaFeedback = {
            correct,
            text: (correct ? trainingQuestionCorrect : trainingQuestionResponseCorrect + q.options[q.answer] + '. ') + q.explanation
        };
    }
}

function advanceTrainingQuestion(type) {
    if (type === 'intelligence') {
        if (intelligenceFeedback === null)
            return;
        intelligenceFeedback = null;
        if (intelligenceQuestionIndex < intelligenceQuestions.length - 1)
            intelligenceQuestionIndex++;
        else
            beginStarTrekTrivia();
    } else {
        if (triviaFeedback === null)
            return;
        triviaFeedback = null;
        if (triviaQuestionIndex < starTrekTriviaQuestions.length - 1)
            triviaQuestionIndex++;
        else
            beginKobayashiMaru();
    }
}

function beginKobayashiMaru() {
    kobayashiMaruStage = 0;
    kobayashiMaruChoice = -1;
    kobayashiMaruOutcome = '';
    for (const k in keys)
        keys[k] = false;
    gameState = 'KOBAYASHI_MARU';
}

function chooseKobayashiMaruOption(optionIndex) {
    if (kobayashiMaruStage !== 1 || !kobayashiMaruChoices[optionIndex])
        return;
    kobayashiMaruChoice = optionIndex;
    const responses = [
        chooseKobayashiMaruResponses1,
        chooseKobayashiMaruResponses2,
        chooseKobayashiMaruResponses3
    ];
    kobayashiMaruOutcome = responses[optionIndex];
    kobayashiMaruStage = 2;
    for (const k in keys)
        keys[k] = false;
}

function advanceKobayashiMaru() {
    if (kobayashiMaruStage === 0)
        kobayashiMaruStage = 1;
    else if (kobayashiMaruStage === 2)
        kobayashiMaruStage = 3;
    else if (kobayashiMaruStage === 3)
        gameState = 'TRAINING_COMPLETE';
}

// Siluetas vectoriales para el visor del puente; no necesita nuevos assets.
function drawKobayashiShip(cx, cy, scale, kind = 'civilian', damage = false) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    if (kind === 'hostile') {
        ctx.fillStyle = '#687a8f';
        ctx.strokeStyle = '#ff5364';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, -19);
        ctx.lineTo(10, -4);
        ctx.lineTo(28, 5);
        ctx.lineTo(11, 8);
        ctx.lineTo(6, 18);
        ctx.lineTo(0, 11);
        ctx.lineTo(-6, 18);
        ctx.lineTo(-11, 8);
        ctx.lineTo(-28, 5);
        ctx.lineTo(-10, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ff5364';
        ctx.fillRect(-3, -5, 6, 10);
    } else {
        ctx.fillStyle = '#93a9b7';
        ctx.strokeStyle = '#d9f2ff';
        ctx.lineWidth = 1.6;
        // Casco central y dos góndolas, una silueta civil original y compacta.
        ctx.beginPath();
        ctx.ellipse(0, -2, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#718796';
        ctx.fillRect(-5, 5, 10, 12);
        ctx.fillStyle = '#7fdcf5';
        ctx.fillRect(-26, -4, 6, 20);
        ctx.fillRect(20, -4, 6, 20);
        ctx.strokeStyle = '#a9deef';
        ctx.beginPath();
        ctx.moveTo(-15, 1);
        ctx.lineTo(-20, 0);
        ctx.moveTo(15, 1);
        ctx.lineTo(20, 0);
        ctx.stroke();
        ctx.fillStyle = damage ? '#ff684f' : '#4dffcf';
        ctx.fillRect(-3, -5, 6, 4);
    }
    if (damage) {
        ctx.strokeStyle = '#ff6c58';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(17, -17);
        ctx.lineTo(28, -27);
        ctx.moveTo(20, -13);
        ctx.lineTo(34, -10);
        ctx.stroke();
        ctx.fillStyle = '#ffbd57';
        ctx.fillRect(25, -26, 4, 4);
        ctx.fillRect(31, -12, 3, 3);
    }
    ctx.restore();
}

function drawKobayashiViewscren(hostiles = false) {
    const w = canvas.width,
        h = canvas.height;
    const x = 50,
        y = 85,
        vw = w - 100,
        vh = 205;
    ctx.fillStyle = '#020914';
    ctx.fillRect(x, y, vw, vh);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, vw, vh);
    ctx.clip();

    // Nivel 1: Estrellas lejanas (lentas, pequeñas y tenues)
    for (let i = 0; i < 45; i++) {
        const rx = Math.abs(Math.sin(i * 12.9898 + 1.1) * 43758.5453) % 1;
        const ry = Math.abs(Math.sin(i * 78.233 + 2.3) * 43758.5453) % 1;

        const rawX = (rx * vw + frameCount * 0.05) % vw;
        const sx = x + rawX;
        const sy = y + ry * vh;

        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx, sy, 1, 1);
    }

    // Nivel 2: Estrellas medianas (velocidad media)
    for (let i = 0; i < 28; i++) {
        const rx = Math.abs(Math.sin(i * 31.415 + 55.2) * 22159.876) % 1;
        const ry = Math.abs(Math.sin(i * 64.882 + 11.4) * 22159.876) % 1;

        const rawX = (rx * vw + frameCount * 0.18) % vw;
        const sx = x + rawX;
        const sy = y + ry * vh;

        ctx.globalAlpha = 0.65;
        ctx.fillStyle = i % 3 === 0 ? '#7de9ff' : '#ffffff';
        ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Nivel 3: Estrellas cercanas / brillantes (más rápidas)
    for (let i = 0; i < 15; i++) {
        const rx = Math.abs(Math.sin(i * 93.123 + 129.5) * 15481.993) % 1;
        const ry = Math.abs(Math.sin(i * 27.451 + 77.1) * 15481.993) % 1;

        const rawX = (rx * vw + frameCount * 0.40) % vw;
        const sx = x + rawX;
        const sy = y + ry * vh;

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#7de9ff';
        ctx.fillRect(sx, sy, 2.5, 2.5);
    }

    ctx.restore();
    ctx.globalAlpha = 1;
    // La nave de rescate permanece visible en la pantalla principal.
    drawKobayashiShip(x + vw * 0.64, y + vh * 0.52, 1.12, 'civilian', true);
    drawKobayashiShip(x + vw * 0.27, y + vh * 0.66, 0.78, 'civilian', false);
    ctx.strokeStyle = 'rgba(108, 226, 255, 0.45)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x + vw * 0.32, y + vh * 0.62);
    ctx.lineTo(x + vw * 0.59, y + vh * 0.53);
    ctx.stroke();
    ctx.setLineDash([]);
    if (hostiles) {
        drawKobayashiShip(x + vw * 0.45, y + vh * 0.19, 0.74, 'hostile');
        drawKobayashiShip(x + vw * 0.81, y + vh * 0.25, 0.82, 'hostile');
        drawKobayashiShip(x + vw * 0.84, y + vh * 0.78, 0.8, 'hostile');
        ctx.strokeStyle = 'rgba(255, 74, 94, 0.72)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + vw * 0.45, y + vh * 0.28);
        ctx.lineTo(x + vw * 0.30, y + vh * 0.57);
        ctx.moveTo(x + vw * 0.80, y + vh * 0.33);
        ctx.lineTo(x + vw * 0.67, y + vh * 0.50);
        ctx.moveTo(x + vw * 0.81, y + vh * 0.70);
        ctx.lineTo(x + vw * 0.68, y + vh * 0.56);
        ctx.stroke();
    }
    ctx.strokeStyle = hostiles ? '#ff5265' : '#65dff5';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, vw, vh);
    ctx.strokeStyle = 'rgba(175,224,245,0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 5, y + 5, vw - 10, vh - 10);
}

function drawKobayashiMaru() {
    drawTrainingBridgeBackdrop();
    const w = canvas.width,
        h = canvas.height;
    overlay(0.58);
    const alarmOn = Math.floor(frameCount / 18) % 2 === 0;
    if (alarmOn && kobayashiMaruStage >= 1 && kobayashiMaruStage <= 2) {
        ctx.fillStyle = 'rgba(235, 33, 53, 0.15)';
        ctx.fillRect(0, 0, w, h);
    }

    // Cabecera superior
    ctx.fillStyle = kobayashiMaruStage >= 1 && kobayashiMaruStage <= 2 ? '#8b1728' : '#173a50';
    ctx.fillRect(0, 0, w, 42);
    text(kobayashiMaruInformation1, w / 2, 27, 20, '#ffffff', false);

    if (kobayashiMaruStage === 0) {
        text(kobayashiMaruInformation2, w / 2, 70, 36, '#ff827f', false);
        drawKobayashiViewscren(false);

        // Caja de texto reorganizada
        ctx.fillStyle = 'rgba(4, 12, 23, 0.95)';
        ctx.fillRect(50, 305, w - 100, 95);
        ctx.strokeStyle = '#f06b70';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 305, w - 100, 95);
        wrapCanvasText(kobayashiMaruInformation3, w / 2, 330, w - 130, 20, '#ffffff');
        text(kobayashiMaruInformation4, w / 2, h - 16, 24, '#8ff5ff', false);

    } else if (kobayashiMaruStage === 1) {
        text(kobayashiMaruInformation5, w / 2, 70, 36, '#ffcf6b', false);
        drawKobayashiViewscren(false);

        ctx.fillStyle = 'rgba(4, 12, 23, 0.96)';
        ctx.fillRect(50, 295, w - 100, 140);
        ctx.strokeStyle = '#f06b70';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 295, w - 100, 140);

        kobayashiMaruChoices.forEach((choice, i) => {
            const yy = 332 + i * 43;
            text(`${i + 1}. ${choice.title} — ${choice.detail}`, w / 2, yy, 19, '#ffffff', i === 0);
        });
        text(kobayashiMaruInformation6, w / 2, h - 16, 24, '#8ff5ff', false);

    } else if (kobayashiMaruStage === 2) {
        text(kobayashiMaruInformation7, w / 2, 70, 36, '#ff777f', false);
        drawKobayashiViewscren(true);

        ctx.fillStyle = 'rgba(4, 9, 17, 0.96)';
        ctx.fillRect(50, 305, w - 100, 95);
        ctx.strokeStyle = '#f06b70';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 305, w - 100, 95);
        wrapCanvasText(kobayashiMaruOutcome + kobayashiMaruInformation8, w / 2, 330, w - 130, 20, '#ffffff');
        text(kobayashiMaruInformation9, w / 2, h - 16, 24, '#8ff5ff', true);

    } else {
        drawKobayashiViewscren(true);

        ctx.fillStyle = 'rgba(2, 8, 17, 0.97)';
        ctx.fillRect(50, 298, w - 100, 115);
        ctx.strokeStyle = '#70d7ed';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 298, w - 100, 115);

        text(kobayashiMaruInformation10, w / 2, 322, 22, '#ffdc72', true);
        const selected = kobayashiMaruChoices[kobayashiMaruChoice];
        text(selected ? `${kobayashiMaruInformation11}${selected.title}` : kobayashiMaruInformation12, w / 2, 346, 20, '#8ceeff', false);
        wrapCanvasText(kobayashiMaruInformation13, w / 2, 372, w - 130, 18, '#ffffff');
        text(kobayashiMaruInformation14, w / 2, h - 16, 24, '#ffdc72', false);
    }
}

function drawTrainingQuiz(type) {
    drawTrainingBridgeBackdrop();
    overlay(0.67);
    const isIntelligence = type === 'intelligence';
    const questions = isIntelligence ? intelligenceQuestions : starTrekTriviaQuestions;
    const index = isIntelligence ? intelligenceQuestionIndex : triviaQuestionIndex;
    const score = isIntelligence ? intelligenceScore : triviaScore;
    const feedback = isIntelligence ? intelligenceFeedback : triviaFeedback;
    const q = questions[index];
    const title = isIntelligence ? trainingQuizIntelligence : trainingQuizQuestions;
    text(trainingQuizAcademy, canvas.width / 2, 40, 20, '#8ceeff', false);
    text(title, canvas.width / 2, 85, 50, '#ffdc72', false);
    text(`${trainingQuizQuestionText}${index + 1} / ${questions.length}${trainingQuizCorrects}${score}`, canvas.width / 2, 120, 20, '#c4e5f0', false);
    ctx.fillStyle = 'rgba(3, 13, 27, 0.94)';
    ctx.fillRect(58, 140, canvas.width - 116, 74);
    ctx.strokeStyle = '#51cfe9';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(58, 140, canvas.width - 116, 74);
    wrapCanvasText(q.question, canvas.width / 2, 172, canvas.width - 150, 22, '#ffffff');
    q.options.forEach((option, i) => {
        const y = 240 + i * 50;
        ctx.fillStyle = feedback && i === q.answer ? 'rgba(33, 116, 83, 0.88)' : 'rgba(12, 35, 56, 0.92)';
        ctx.fillRect(90, y, canvas.width - 180, 40);
        ctx.strokeStyle = feedback && i === q.answer ? '#76f0a8' : '#416c83';
        ctx.strokeRect(90, y, canvas.width - 180, 40);
        text(`${i + 1}. ${option}`, canvas.width / 2, y + 26, 20, '#f3fbff', i === q.answer && !!feedback);
    });
    if (feedback) {
        ctx.fillStyle = 'rgba(2, 11, 21, 0.96)';
        ctx.fillRect(45, 320, canvas.width - 90, 75);
        ctx.strokeStyle = feedback.correct ? '#62e49b' : '#f0b75e';
        ctx.strokeRect(45, 320, canvas.width - 90, 75);
        // Cálculo dinámico para centrar verticalmente el texto (1 o 2 líneas) dentro de la caja (Y: 320 a 395)
        ctx.font = `25px ${GAME_FONT}`;
        const maxWidth = canvas.width - 120;
        const words = feedback.text.split(/\s+/);
        let line = '';
        let lines = [];
        for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        if (line) lines.push(line);
        const lineHeight = 18;
        const totalTextHeight = lines.length * lineHeight;
        const startY = 357.5 - (totalTextHeight / 2) + (lineHeight / 2);

        let currentY = startY;
        ctx.textAlign = 'center';
        ctx.fillStyle = feedback.correct ? '#a8ffc9' : '#ffe0a0';
        for (const l of lines) {
            ctx.fillText(l, canvas.width / 2, currentY);
            currentY += lineHeight;
        }
        text(trainingQuizKeys1, canvas.width / 2, canvas.height - 12, 20, '#8ceeff', false);
    } else {
        text(trainingQuizKeys2, canvas.width / 2, canvas.height - 15, 20, '#8ceeff', false);
    }
} 

function drawTrainingComplete() {
    drawTrainingBridgeBackdrop();
    overlay(0.64);
    text(trainingComplete1, canvas.width / 2, 90, 30, '#ffdc72', false, GAME_FONTTNG);
    text(trainingComplete2, canvas.width / 2, 165, 30, '#ffffff');
    text(`${trainingComplete3A}${intelligenceScore}/${intelligenceQuestions.length}${trainingComplete3B}${triviaScore}/${starTrekTriviaQuestions.length}`, canvas.width / 2, 235, 30, '#ffdc72', false);
    text(trainingComplete4, canvas.width / 2, 295, 30, '#7feeff');
    text(trainingComplete5, canvas.width / 2, 385, 26, '#ffdc72', false);

    // Easster Eggde Q
    if (qEasterEggActive) {
        ctx.save();

        // Fondo semitransparente para el mensaje secreto
        ctx.fillStyle = 'rgba(2, 6, 16, 0.96)';
        ctx.fillRect(50, 95, canvas.width - 100, 420);

        // Borde dorado
        ctx.strokeStyle = '#ffdc72';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 95, canvas.width - 100, 420);

        ctx.restore();

        // Retrato de Q (qTalkImage)
        const qBoxX = canvas.width / 2 - 60;
        const qBoxY = 145;
        const qBoxW = 120;
        const qBoxH = 180;
        if (qTalkImage.complete && qTalkImage.naturalWidth > 0) {
            const ratio = Math.min((qBoxW - 8) / qTalkImage.naturalWidth, (qBoxH - 8) / qTalkImage.naturalHeight);
            const drawW = qTalkImage.naturalWidth * ratio,
                drawH = qTalkImage.naturalHeight * ratio;
            ctx.drawImage(qTalkImage, canvas.width / 2 - drawW / 2, qBoxY + (qBoxH - drawH) / 2, drawW, drawH);
        }

        // Texto del Easter Egg
        text(qEasterEgg1, canvas.width / 2, 125, 30, '#ffdc72');
        text(qEasterEgg2, canvas.width / 2, 380, 22, '#ffffff');
        text(qEasterEgg3, canvas.width / 2, 420, 22, '#ffffff');
        text(qEasterEgg4, canvas.width / 2, 480, 24, '#7feeff', false);
    }
}

// Ventajas y consecuencias de las decisiones de la historia.

let storyBonusDamage = 0;
let storyBonusHealth = 0;
let storyMachineDamage = 0;
let storyDecision = '';
let storyDecisionText = '';
let storyIntroSeen = false;

const energyParticles = Array.from({
    length: 25
}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedY: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3
    }));

// 19 destinos de campaña, uno por misión.
const galaxyNodesHorizontal = [
    { id: 1,    name: 'Puente de la U.S.S. Enterprise',     x: 100, y: 65 },
    { id: 2,    name: 'Estación Espacial 9',                x: 200, y: 95},
    { id: 3,    name: 'Nave Klingon',                       x: 356, y: 95},
    { id: 4,    name: 'Terraza Romulana',                   x: 504, y: 95 },
    { id: 5,    name: 'Ingeniería de la Enterprise',        x: 652, y: 95 },
    { id: 6,    name: 'Pasillo Borg',                       x: 800, y: 95 },
    { id: 7,    name: 'Sala del Transportador',             x: 950, y: 95},
    { id: 8,    name: 'Planeta Talos IV',                   x: 950, y: 207 },
    { id: 9,    name: 'Desierto Remoto',                    x: 772, y: 207 },
    { id: 10,   name: 'Ruinas Antiguas',                    x: 594, y: 207 },
    { id: 11,   name: 'Academia de la Federación',          x: 416, y: 207 },
    { id: 12,   name: 'Hangar de Lanzaderas',               x: 238, y: 207 },
    { id: 13,   name: 'Cinturón de Asteroides',             x: 60, y: 207 },
    { id: 14,   name: 'Selva Exótica',                      x: 60, y: 320 },
    { id: 15,   name: 'Observatorio Estelar',               x: 238, y: 320 },
    { id: 16,   name: 'Puente Dañado',                      x: 416, y: 320 },
    { id: 17,   name: 'Estación Orbital',                   x: 594, y: 320},
    { id: 18,   name: 'Templo Borg',                        x: 772, y: 320 },
    { id: 19,   name: 'Núcleo Borg',                        x: 930, y: 360 }
];
// Ocho destinos de campaña, uno por misión (reorganizados en zigzag vertical)
const galaxyNodesVertical = [
    { id: 1,    name: 'Puente de la U.S.S. Enterprise',     x: 100, y: 80 },   // Arriba-Izquierda
    { id: 2,    name: 'Estación Espacial 9',                x: 100, y: 220 },  // Baja 1
    { id: 3,    name: 'Nave Klingon',                       x: 100, y: 360 },  // Baja 2 (Fondo)
    { id: 4,    name: 'Terraza Romulana',                   x: 230, y: 360 },  // Salto a la derecha
    { id: 5,    name: 'Ingeniería de la Enterprise',        x: 230, y: 220 },  // Sube 1
    { id: 6,    name: 'Pasillo Borg',                       x: 230, y: 80 },   // Sube 2 (Arriba)
    { id: 7,    name: 'Sala del Transportador',             x: 360, y: 80 },   // Salto a la derecha
    { id: 8,    name: 'Planeta Talos IV',                   x: 360, y: 220 },  // Baja 1
    { id: 9,    name: 'Desierto Remoto',                    x: 360, y: 360 },  // Baja 2 (Fondo)
    { id: 10,   name: 'Ruinas Antiguas',                    x: 490, y: 360 },  // Salto a la derecha
    { id: 11,   name: 'Academia de la Federación',          x: 490, y: 220 },  // Sube 1
    { id: 12,   name: 'Hangar de Lanzaderas',               x: 490, y: 80 },   // Sube 2 (Arriba)
    { id: 13,   name: 'Cinturón de Asteroides',             x: 620, y: 80 },   // Salto a la derecha
    { id: 14,   name: 'Selva Exótica',                      x: 620, y: 220 },  // Baja 1
    { id: 15,   name: 'Observatorio Estelar',               x: 620, y: 360 },  // Baja 2 (Fondo)
    { id: 16,   name: 'Puente Dañado',                      x: 750, y: 360 },  // Salto a la derecha
    { id: 17,   name: 'Estación Orbital',                   x: 750, y: 220 },  // Sube 1
    { id: 18,   name: 'Templo Borg',                        x: 750, y: 80 },   // Sube 2 (Arriba)
    { id: 19,   name: 'Núcleo Borg',                        x: 910, y: 220 }   // Meta final a la derecha
];



const galaxyNodes = galaxyNodesVertical;


let shuttleX = galaxyNodes[0].x;
let shuttleY = galaxyNodes[0].y;

const storyMissionDetails = [
    [storyDetailsTitle1, storyDetailsDescription1],
    [storyDetailsTitle2, storyDetailsDescription2],
    [storyDetailsTitle3, storyDetailsDescription3],
    [storyDetailsTitle4, storyDetailsDescription4],
    [storyDetailsTitle5, storyDetailsDescription5],
    [storyDetailsTitle6, storyDetailsDescription6],
    [storyDetailsTitle7, storyDetailsDescription7],
    [storyDetailsTitle8, storyDetailsDescription8],
    [storyDetailsTitle9, storyDetailsDescription9],
    [storyDetailsTitle10, storyDetailsDescription10],
    [storyDetailsTitle11, storyDetailsDescription11],
    [storyDetailsTitle12, storyDetailsDescription12],
    [storyDetailsTitle13, storyDetailsDescription13],
    [storyDetailsTitle14, storyDetailsDescription14],
    [storyDetailsTitle15, storyDetailsDescription15],
    [storyDetailsTitle16, storyDetailsDescription16],
    [storyDetailsTitle17, storyDetailsDescription17],
    [storyDetailsTitle18, storyDetailsDescription18],
    [storyDetailsTitle19, storyDetailsDescription19]
];


// Una entrada narrativa por arena de la campaña.
const storyDetails = Object.fromEntries(storyMissionDetails.map(([title, desc], index) => [
    index + 1,
    { title, desc }
]));

const machineSettings = {
    FACIL: {
        approachDistance: 100,
        attackDistance: 100,
        attackChance: 0.014,
        jumpChance: 0.004,
        movementMultiplier: 0.62,
        reactionFrames: 38,
        retreatChance: 0.012
    },
    NORMAL: {
        approachDistance: 92,
        attackDistance: 108,
        attackChance: 0.025,
        jumpChance: 0.006,
        movementMultiplier: 0.74,
        reactionFrames: 28,
        retreatChance: 0.02
    },
    DIFICIL: {
        approachDistance: 78,
        attackDistance: 125,
        attackChance: 0.055,
        jumpChance: 0.014,
        movementMultiplier: 1,
        reactionFrames: 12,
        retreatChance: 0.04
    }
};

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function getHumanPlayer() {
    return humanPlayerIndex === 1 ? player1 : player2;
}

function getMachinePlayer() {
    return humanPlayerIndex === 1 ? player2 : player1;
}

function getCharacter(p) {
    return availableCharacters[
        clamp(p.charIndex, 0, availableCharacters.length - 1)
    ];
}

function updatePlayerAttributes(p) {
    const c = getCharacter(p);
    p.name = c.name;
    p.width = c.width;
    p.height = c.height;
    p.speed = c.movementSpeed;
    p.x = clamp(p.x, 0, Math.max(0, canvas.width - p.width));
}

function resetMachineAI() {
    machineAttackCooldown = 0;
    machineJumpCooldown = 0;
}

// ------------------------------------------------------------
// ACTUALIZACIÓN DE LOS COMBATIENTES SEGÚN LA ARENA
// ------------------------------------------------------------

function setArenaCombatants(arenaNumber) {
    const arenaIndex = clamp(
            arenaNumber - 1,
            0,
            arenaCombatants.length - 1);

    const [character1, character2] = arenaCombatants[arenaIndex];

    if (isVsMachine) {
        // En los modos contra la máquina, se conserva el personaje
        // elegido por el jugador humano y se adapta el rival a la arena.
        const human = getHumanPlayer();
        const machine = getMachinePlayer();

        if (human.charIndex === character1) {
            machine.charIndex = character2;
        } else if (human.charIndex === character2) {
            machine.charIndex = character1;
        } else {
            machine.charIndex = character1;
        }

        updatePlayerAttributes(human);
        updatePlayerAttributes(machine);
    } else {
        // En VS Player, conservar siempre los personajes elegidos en la
        // pantalla de selección. La arena cambia el escenario, no los luchadores.
        updatePlayerAttributes(player1);
        updatePlayerAttributes(player2);
    }

    // Limpiar estados de combate al cambiar de enfrentamiento.
    for (const p of[player1, player2]) {
        p.isAttacking = false;
        p.attackTimer = 0;
        p.attackCooldown = 0;
        p.attackStyle = 'normal';
        p.activeAttackDuration = 0;
        p.hasHitThisAttack = false;
        p.stunTimer = 0;
        p.hitFlashTimer = 0;
        p.hitReactTimer = 0;
        p.hitReactDirection = 0;
        p.hitReactStep = 0;
        p.comboCount = 0;
        p.comboTimer = 0;
        p.comboDisplayTimer = 0;
        p.invulnerabilityTimer = 0;
        p.vy = 0;
        p.y = floorY;
    }

    resetMachineAI();
    impactEffects = [];
    screenShakeTimer = 0;
}

function resetMatch(shouldPlaySound = true) {
    impactEffects = [];
    screenShakeTimer = 0;
    for (const p of[player1, player2]) {
        p.maxHealth = 100;
        p.health = 100;
        p.maxEnergy = 100;
        p.energy = 100;
        updatePlayerAttributes(p);
        p.y = floorY;
        p.vy = 0;
        p.isAttacking = false;
        p.attackTimer = 0;
        p.attackCooldown = 0;
        p.attackStyle = 'normal';
        p.activeAttackDuration = 0;
        p.hasHitThisAttack = false;
        p.stunTimer = 0;
        p.hitFlashTimer = 0;
        p.hitReactTimer = 0;
        p.hitReactDirection = 0;
        p.hitReactStep = 0;
        p.comboCount = 0;
        p.comboTimer = 0;
        p.comboDisplayTimer = 0;
        p.invulnerabilityTimer = 0;
    }

    player1.x = 100;
    player2.x = Math.max(200, canvas.width - player2.width - 40);
    player1.facing = 1;
    player2.facing = -1;

    if (isStoryMode) {
        player1.health = clamp(100 + storyBonusHealth, 1, 100);
        player2.health = 100;

        if (storyPhase === TOTAL_MISIONES || storyPhase === TOTAL_MISIONES - 1) {
            player2.maxHealth = 150;
            player2.health = 150;
            player2.damageBonus = 0;
        }
    }

    // Vida inicial de esta ronda: sirve para comprobar si la victoria fue PERFECT.
    player1.startingHealth = player1.health;
    player2.startingHealth = player2.health;

    for (const k in keys)
        keys[k] = false;

    gameOver = false;
    gameOverFrame = 0;
    storyDefeatCountdownStart = 0;
    storyDefeatAttemptCounted = false;
    storyRoundRecorded = false;
    matchTimeLeft = 120;
    timeText = '02:00';
    roundWinnerMessage = '';
    screenShakeTimer = 0;
    resetMachineAI();

    // --- SONIDOS AL EMPEZAR EL COMBATE ---
    if (shouldPlaySound) {
        matchStartDelay = 120;
        matchStartFrame = frameCount;
        playSound(soundFight);
    } else {
        matchStartDelay = 0;
    }
}

function getRoundWinner() {
    if (player1.health > player2.health)
        return 1;
    if (player2.health > player1.health)
        return 2;
    return 0;
}

function humanWonStoryPhase() {
    return getHumanPlayer().health >= getMachinePlayer().health;
}

function humanLostStoryPhase() {
    return getHumanPlayer().health < getMachinePlayer().health;
}

function setWinnerMessageByHealth() {
    gameOverFrame = frameCount;
    const w = getRoundWinner();
    picardVictory = w !== 0 && availableCharacters[(w === 1 ? player1 : player2).charIndex]?.name === 'PICARD';

    if (w === 0) {
        roundWinnerMessage = winnerMessageDraw;
    } else if (isVsMachine) {
        const humanWon =
            (w === 1 && humanPlayerIndex === 1) ||
        (w === 2 && humanPlayerIndex === 2);

        const humanPerfect =
            humanWon && getHumanPlayer().health >= getHumanPlayer().startingHealth;

        // Sonido Win/Lose 
        if (humanWon) {
            playSound(soundWin);
        } else {
            playSound(soundLose);
        }

        roundWinnerMessage = humanPerfect
            ? winnerMessagePerfect
            : humanWon
                ? winnerMessageWin
                : winnerMessageLose;
        roundWinnerHasTwoLines = false;
    } else {
        roundWinnerMessage = w === 1
            ? `¡${player1.name} ${winnerMessageWhoWins}`
            : `¡${player2.name} ${winnerMessageWhoWins}`;
        roundWinnerHasTwoLines = true;
    }
}

function finishMatchByTime() {
    gameOver = true;
    setWinnerMessageByHealth();
}

// Para Riker: mantener S (jugador 1) o flecha abajo (jugador 2)
// prepara la silla. Para LaForge, la misma combinación activa la patada especial.
function isRikerExtraGuardHeld(p) {
    if (getCharacter(p).name !== 'RIKER')
        return false;
    if (p === player1)
        return !!(keys.s || keys.S);
    if (p === player2)
        return !!keys.ArrowDown;
    return false;
}

function isLaForgeExtraGuardHeld(p) {
    if (getCharacter(p).name !== 'LAFORGE')
        return false;
    if (p === player1)
        return !!(keys.s || keys.S);
    if (p === player2)
        return !!keys.ArrowDown;
    return false;
}

function isWorfExtraGuardHeld(p) {
    if (getCharacter(p).name !== 'WORF')
        return false;
    if (p === player1)
        return !!(keys.s || keys.S);
    if (p === player2)
        return !!keys.ArrowDown;
    return false;
}

function isEmilioExtraGuardHeld(p) {
    if (getCharacter(p).name !== 'EMILIO')
        return false;
    if (p === player1)
        return !!(keys.s || keys.S);
    if (p === player2)
        return !!keys.ArrowDown;
    return false;
}

function startAttack(p) {
    if (p.isAttacking || gameOver || p.stunTimer > 0 || p.attackCooldown > 0)
        return;
    const c = getCharacter(p);
    const useExtra = (c.name === 'RIKER' && isRikerExtraGuardHeld(p)) || (c.name === 'LAFORGE' && isLaForgeExtraGuardHeld(p)) ||
        (c.name === 'WORF' && isWorfExtraGuardHeld(p)) || (c.name === 'EMILIO' && isEmilioExtraGuardHeld(p));
    p.attackStyle = useExtra ? 'extra' : 'normal';
    p.activeAttackDuration = useExtra
        ? (c.extraAttackDuration || c.attackDuration)
        : c.attackDuration;
    p.isAttacking = true;
    p.hasHitThisAttack = false;
    p.attackTimer = p.activeAttackDuration;
}

function applyHit(attacker, defender, damage, knockback) {
    // Devuelve true solo cuando el impacto se aplica realmente.
    if (defender.invulnerabilityTimer > 0 || defender.health <= 0)
        return false;

    const bonus = isStoryMode && attacker === getHumanPlayer()
        ? storyBonusDamage
        : 0;
    const enemyBonus = isStoryMode && attacker === getMachinePlayer()
        ? storyMachineDamage
        : 0;

    // Cada impacto válido dentro de la ventana de 1,5 s continúa la cadena.
    // A partir del segundo golpe, el daño adicional sube hasta un máximo de +8.
    const comboContinues = attacker.comboTimer > 0 && attacker.comboCount > 0;
    const comboDamageBonus = comboContinues ? Math.min(5, attacker.comboCount) : 0;
    const finalDamage = Math.max(1, damage + comboDamageBonus + enemyBonus - bonus);
    // La nueva barra de energía actúa como escudo: absorbe los golpes antes de la salud.
    const absorbed = Math.min(Math.max(0, defender.energy || 0), finalDamage);
    defender.energy = Math.max(0, (defender.energy || 0) - absorbed);
    const healthDamage = finalDamage - absorbed;
    if (healthDamage > 0)
        defender.health = Math.max(0, defender.health - healthDamage);
    attacker.comboCount = comboContinues ? attacker.comboCount + 1 : 1;
    attacker.comboTimer = 90;
    attacker.comboDisplayTimer = 90;
    // Si recibes un golpe, se rompe tu propia cadena.
    defender.comboCount = 0;
    defender.comboTimer = 0;
    defender.comboDisplayTimer = 0;
    defender.stunTimer = 6;
    defender.invulnerabilityTimer = 7;
    defender.hitFlashTimer = 7;

    // Retroceso físico durante varios fotogramas, en lugar de desplazar al rival
    // de golpe. Conserva la posición dentro de los límites del escenario.
    defender.hitReactTimer = 4;
    defender.hitReactDirection = attacker.x < defender.x ? 1 : -1;
    defender.hitReactStep = Math.max(2.0, knockback / 4.5);

    // Destello circular más una ráfaga de chispas en el punto del impacto.
    const impactX = defender.x + defender.width / 2;
    const impactY = clamp(defender.y + Math.min(defender.height * 0.42, canvas.height * 0.60), 90, canvas.height - 55);
    impactEffects.push({
        type: 'ring',
        x: impactX,
        y: impactY,
        life: 12,
        maxLife: 12,
        radius: 8,
        color: '#fff3a6'
    });
    for (let i = 0; i < 13; i++) {
        const angle = (Math.PI * 2 * i / 13) + (Math.random() - 0.5) * 0.35;
        const speed = 1.8 + Math.random() * 3.7;
        impactEffects.push({
            type: 'spark',
            x: impactX,
            y: impactY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 12 + Math.floor(Math.random() * 9),
            maxLife: 21,
            size: 2 + Math.random() * 3,
            color: i % 3 === 0 ? '#ffffff' : (i % 2 === 0 ? '#ffd54a' : '#62f6ff')
        });
    }
    screenShakeTimer = Math.max(screenShakeTimer, 9);

    // Sonido del golpe
    playSound(hitSound1);


    return true;
}

function updateAttack(attacker, defender) {
    if (!attacker.isAttacking)
        return;
    const c = getCharacter(attacker);
    const distance = Math.abs(attacker.x - defender.x);
    const vertical = Math.abs(attacker.y - defender.y);
    const activeDuration = attacker.activeAttackDuration || c.attackDuration;
    const extraAttack = (c.name === 'RIKER' || c.name === 'LAFORGE') && attacker.attackStyle === 'extra';
    const specialAttack = extraAttack;
    const attackRange = extraAttack ? (c.extraAttackRange || c.attackRange) : c.attackRange;
    const attackDamage = extraAttack ? (c.extraDamage || c.damage) : c.damage;
    const attackKnockback = extraAttack ? (c.extraKnockback || 19) : 15;
    const hitFrame = Math.ceil(activeDuration * 0.55);

    // Riker y LaForge disponen de una ventana de impacto de varios fotogramas,
    // para que sus ataques especiales no dependan de un único instante exacto.
    const isHitFrame = extraAttack
        ? (attacker.attackTimer <= Math.ceil(activeDuration * 0.78) &&
            attacker.attackTimer >= Math.max(1, Math.floor(activeDuration * 0.20)))
        : attacker.attackTimer === hitFrame;

    if (c.name === 'KAN' && attacker.attackTimer >= c.attackDuration - 8) {
        attacker.x = clamp(
            attacker.x + (attacker.x < defender.x ? 5.5 : -5.5),
            0,
            Math.max(0, canvas.width - attacker.width));
        if (distance < 90 && vertical < 55 && !attacker.hasHitThisAttack) {
            if (applyHit(attacker, defender, 7, 19))
                attacker.hasHitThisAttack = true;
        }
    } else if (
        isHitFrame &&
        distance <= attackRange &&
        vertical < 55 &&
        !attacker.hasHitThisAttack) {
        if (applyHit(attacker, defender, attackDamage, attackKnockback)) {
            attacker.hasHitThisAttack = true;
        }
    }

    attacker.attackTimer--;
    if (attacker.attackTimer <= 0) {
        const endedWithExtra = attacker.attackStyle === 'extra';
        attacker.attackTimer = 0;
        attacker.isAttacking = false;
        attacker.attackCooldown = endedWithExtra ? (c.extraAttackCooldown || 16) : 8;
        attacker.attackStyle = 'normal';
        attacker.activeAttackDuration = 0;
        attacker.hasHitThisAttack = false;
    }
}

function updateCombatImpactEffects() {
    for (const p of[player1, player2]) {
        if (p.hitFlashTimer > 0)
            p.hitFlashTimer--;
        if (p.hitReactTimer > 0 && !gameOver) {
            p.x = clamp(p.x + p.hitReactDirection * p.hitReactStep, 0, Math.max(0, canvas.width - p.width));
            p.hitReactTimer--;
        }
    }
    for (const effect of impactEffects) {
        effect.life--;
        if (effect.type === 'ring') {
            effect.radius += 3.2;
        } else {
            effect.x += effect.vx;
            effect.y += effect.vy;
            effect.vx *= 0.91;
            effect.vy = effect.vy * 0.91 + 0.04;
        }
    }
    impactEffects = impactEffects.filter(effect => effect.life > 0);
}

function drawCombatImpactEffects() {
    for (const effect of impactEffects) {
        const alpha = Math.max(0, effect.life / effect.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        if (effect.type === 'ring') {
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = '#62f6ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius * 0.58, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            ctx.fillStyle = effect.color;
            ctx.shadowColor = effect.color;
            ctx.shadowBlur = 8;
            ctx.fillRect(effect.x, effect.y, effect.size, effect.size);
        }
        ctx.restore();
    }
}

function jumpPlayer(p) {
    if (p.y >= floorY && p.stunTimer <= 0) {
        p.y = floorY;
        p.vy = p.jumpForce;
    }
}

function movePlayer(p, amount) {
    if (p.stunTimer > 0)
        return;
    p.x = clamp(
            p.x + amount * p.speed,
            0,
            Math.max(0, canvas.width - p.width));
}

function updatePlayerPhysics(p) {
    if (p.stunTimer > 0)
        p.stunTimer--;
    if (p.invulnerabilityTimer > 0)
        p.invulnerabilityTimer--;
    if (p.attackCooldown > 0)
        p.attackCooldown--;
    if (p.comboTimer > 0) {
        p.comboTimer--;
        if (p.comboTimer === 0)
            p.comboCount = 0;
    }
    if (p.comboDisplayTimer > 0)
        p.comboDisplayTimer--;
    p.vy += p.gravity;
    p.y += p.vy;

    if (p.y > floorY) {
        p.y = floorY;
        p.vy = 0;
    }
    p.x = clamp(p.x, 0, Math.max(0, canvas.width - p.width));
}

function updateFacingDirections() {
    if (player1.x < player2.x) {
        player1.facing = 1;
        player2.facing = -1;
    } else {
        player1.facing = -1;
        player2.facing = 1;
    }
}

function updateMachineAI() {
    if (!isVsMachine || gameOver)
        return;
    const ai = getMachinePlayer();
    const human = getHumanPlayer();
    const s = machineSettings[machineDifficulty] || machineSettings.NORMAL;
    if (machineAttackCooldown > 0)
        machineAttackCooldown--;
    if (machineJumpCooldown > 0)
        machineJumpCooldown--;
    const distance = Math.abs(human.x - ai.x);
    const vertical = Math.abs(human.y - ai.y);
    const direction = Math.sign(human.x - ai.x);
    let multiplier = s.movementMultiplier;
    if (isStoryMode && storyPhase === TOTAL_MISIONES) {
        multiplier = Math.min(1.35, multiplier * 1.35);
    } else if (isStoryMode && storyPhase >= 5) {
        multiplier = Math.min(1.2, multiplier * 1.1);
    }
    if (
        distance > s.approachDistance &&
        !ai.isAttacking &&
        ai.stunTimer <= 0) {
        ai.x += direction * ai.speed * multiplier;
    }
    if (
        distance < 65 &&
        !ai.isAttacking &&
        Math.random() < s.retreatChance) {
        ai.x -= direction * ai.speed * multiplier;
    }

    if (
        ai.y === floorY &&
        distance > 100 &&
        machineJumpCooldown <= 0 &&
        Math.random() < s.jumpChance) {
        jumpPlayer(ai);
        machineJumpCooldown = 70;
    }

    let attackChance = s.attackChance;
    if (isStoryMode && storyPhase === TOTAL_MISIONES) {
        attackChance *= 1.8;
    } else if (isStoryMode && storyPhase >= 5) {
        attackChance *= 1.3;
    }

    if (
        distance <= s.attackDistance &&
        vertical < 65 &&
        !ai.isAttacking &&
        ai.stunTimer <= 0 &&
        machineAttackCooldown <= 0 &&
        Math.random() < attackChance) {
        startAttack(ai);
        machineAttackCooldown =
            s.reactionFrames + Math.floor(Math.random() * 20);
    }
    ai.x = clamp(ai.x, 0, Math.max(0, canvas.width - ai.width));
}

function canHumanControlPlayer(index) {
    return !isVsMachine || humanPlayerIndex === index;
}

// ------------------------------------------------------------
// MODO HISTORIA
// ------------------------------------------------------------
const storyMissionSpeakers = [
    [storyModeSpeakerComputer, storyModeSpeakerData, storyModeSpeakerPicard],
    [storyModeSpeakerRiker, storyModeSpeakerSpock, storyModeSpeakerPicard],
    [storyModeSpeakerUhura, storyModeSpeakerSulu, storyModeSpeakerData],
    [storyModeSpeakerPicard, storyModeSpeakerSpock, storyModeSpeakerData],
    [storyModeSpeakerScotty, storyModeSpeakerData, storyModeSpeakerPicard],
    [storyModeSpeakerWorf, storyModeSpeakerSevenOfNine, storyModeSpeakerPicard],
    [storyModeSpeakerData, storyModeSpeakerRiker, storyModeSpeakerPicard],
    [storyModeSpeakerPicard, storyModeSpeakerData, storyModeSpeakerSpock],
    [storyModeSpeakerSpock, storyModeSpeakerRiker, storyModeSpeakerPicard],
    [storyModeSpeakerData, storyModeSpeakerSevenOfNine, storyModeSpeakerPicard],
    [storyModeSpeakerRiker, storyModeSpeakerData, storyModeSpeakerPicard],
    [storyModeSpeakerScotty, storyModeSpeakerRiker, storyModeSpeakerData],
    [storyModeSpeakerSulu, storyModeSpeakerData, storyModeSpeakerPicard],
    [storyModeSpeakerMcCoy, storyModeSpeakerWorf, storyModeSpeakerPicard],
    [storyModeSpeakerUhura, storyModeSpeakerData, storyModeSpeakerPicard],
    [storyModeSpeakerRiker, storyModeSpeakerData, storyModeSpeakerPicard],
    [storyModeSpeakerWorf, storyModeSpeakerData, storyModeSpeakerPicard],
    [storyModeSpeakerKhan, storyModeSpeakerLocutus, storyModeSpeakerPicard],
    [storyModeSpeakerData, storyModeSpeakerLocutus, storyModeSpeakerPicard]
];

const storyMissionDialogues = [
    [storyModeChapter1Before1, storyModeChapter1Before2, storyModeChapter1Before3],
    [storyModeChapter2Before1, storyModeChapter2Before2, storyModeChapter2Before3],
    [storyModeChapter3Before1, storyModeChapter3Before2, storyModeChapter3Before3],
    [storyModeChapter4Before1, storyModeChapter4Before2, storyModeChapter4Before3],
    [storyModeChapter5Before1, storyModeChapter5Before2, storyModeChapter5Before3],
    [storyModeChapter6Before1, storyModeChapter6Before2, storyModeChapter6Before3],
    [storyModeChapter7Before1, storyModeChapter7Before2, storyModeChapter7Before3],
    [storyModeChapter8Before1, storyModeChapter8Before2, storyModeChapter8Before3],
    [storyModeChapter9Before1, storyModeChapter9Before2, storyModeChapter9Before3],
    [storyModeChapter10Before1, storyModeChapter10Before2, storyModeChapter10Before3],
    [storyModeChapter11Before1, storyModeChapter11Before2, storyModeChapter11Before3],
    [storyModeChapter12Before1, storyModeChapter12Before2, storyModeChapter12Before3],
    [storyModeChapter13Before1, storyModeChapter13Before2, storyModeChapter13Before3],
    [storyModeChapter14Before1, storyModeChapter14Before2, storyModeChapter14Before3],
    [storyModeChapter15Before1, storyModeChapter15Before2, storyModeChapter15Before3],
    [storyModeChapter16Before1, storyModeChapter16Before2, storyModeChapter16Before3],
    [storyModeChapter17Before1, storyModeChapter17Before2, storyModeChapter17Before3],
    [storyModeChapter18Before1, storyModeChapter18Before2, storyModeChapter18Before3],
    [storyModeChapter19Before1, storyModeChapter19Before2, storyModeChapter19Before3]
]

const STORY_DIALOGUES = Object.fromEntries(storyMissionDialogues.map((lines, index) => [
    index + 1,
    {
        title: storyDetails[index + 1].title.replace(':', ' ·'),
        before: lines.map((line, lineIndex) => [storyMissionSpeakers[index][lineIndex], line]),
        afterWin: [storyModeSpeakerData, storyDialogueAfterWin],
        afterLose: [storyModeSpeakerData, storyDialogueAfterLose]
    }
]));
let storyDialogueLines = [];
let storyDialogueIndex = 0;
let storyDialogueAfter = false;
function startStoryDialogue(after = false) {
    const d = STORY_DIALOGUES[storyPhase] || STORY_DIALOGUES[TOTAL_MISIONES];
    if (after) {
        const won = getStorySeriesWinner() === 1;
        const reportTitle = won ? storyDialogueConsequence : storyDialogueContinue;
        const outcome = won ? storyDialogueAfterWin : storyDialogueAfterLose;
        const characterReport = won ? d.afterWin : d.afterLose;
        storyDialogueLines = [[reportTitle, outcome], characterReport];
    } else {
        storyDialogueLines = d.before;
    }
    storyDialogueIndex = 0;
    storyDialogueAfter = after;
    gameState = 'STORY_DIALOGUE';
}
function continueStoryDialogue() {
    if (storyDialogueIndex + 1 < storyDialogueLines.length) {
        storyDialogueIndex++;
        return;
    }
    if (!storyDialogueAfter) {
        currentArena = storyPhase;
        setArenaCombatants(currentArena);
        resetMatch();
        gameState = 'STORY_FIGHT';
    } else {
        if (storyDialogueAfter) {
            if (storyPhase === 4 || storyPhase === TOTAL_MISIONES) {
                beginShuttleMinigame();
                return;
            }
            if (storyPhase === 1) {
                storyPhase = 2;
                gameState = 'MAP';
                return;
            }
            if (storyPhase === 2) {
                storyPhase = 3;
                gameState = 'MAP';
                return;
            }
            if (storyPhase === 3) {
                storyPhase = 4;
                gameState = 'MAP';
                return;
            }
            if (storyPhase < TOTAL_MISIONES) {
                storyPhase++;
                gameState = 'MAP';
                return;
            }
            campaignCompleted = true;
            gameState = 'CAMPAIGN_COMPLETE';
            return;
        }
        gameState = 'MAP';
    }
}
function drawStoryDialogue() {
    const w = canvas.width,
    h = canvas.height,
    d = STORY_DIALOGUES[storyPhase] || STORY_DIALOGUES[TOTAL_MISIONES];
    ctx.fillStyle = '#020713';
    ctx.fillRect(0, 0, w, h);
    drawParticles(true);
    text(starTrekExpulsandoElNucleo, w / 2, 44, 25, '#75edff', true);
    text(d.title, w / 2, 110, 40, '#ffcf70', true);
    ctx.fillStyle = 'rgba(6,20,38,.94)';
    ctx.strokeStyle = '#49dff4';
    ctx.lineWidth = 2;

    const boxY = 165;
    const boxHeight = 200;

    ctx.fillRect(55, boxY, w - 110, boxHeight);
    ctx.strokeRect(55, boxY, w - 110, boxHeight);
    const line = storyDialogueLines[storyDialogueIndex] || [storyModeSpeakerComputer, ''];
    // Nombre del emisor (Computadora / Personaje) (ampliado de 15 a 18)
    text(line[0], w / 2, boxY + 50, 25, '#78efff', false);
    const words = line[1].split(' ');
    let rows = [],
    row = '';
    for (const word of words) {
        if ((row + ' ' + word).trim().length > 64) {
            rows.push(row);
            row = word;
        } else
            row = (row + ' ' + word).trim();
    }
    if (row)
        rows.push(row);
    rows.slice(0, 4).forEach((r, i) => text(r, w / 2, boxY + 90 + i * 30, 23, '#ffffff'));
    text(`${storyDialogueIndex + 1}/${storyDialogueLines.length} · ${storyDialoguePressSpace}`, w / 2, h - 42, 22, '#00ffcc', false);
}

function beginCampaign() {
    // En historia, el jugador controla siempre al J1 (lado izquierdo).
    // Evita que el selector de lado de otro modo deje la campaña desincronizada.
    humanPlayerIndex = 1;
    storyPhase = 1;
    resetStorySeries();
    campaignAttempts = 3;
    campaignCompleted = false;
    campaignFailed = false;
    picardNexusStep = 0;
    storyBonusDamage = 0;
    storyBonusHealth = 0;
    storyMachineDamage = 0;
    storyDecision = '';
    storyDecisionText = '';
    storyIntroSeen = false;
    currentArena = 1;
    shuttleX = galaxyNodes[0].x;
    shuttleY = galaxyNodes[0].y;
    isStoryMode = true;
    isVsMachine = true;
}

function chooseStoryDecision(choice) {
    storyDecision = choice;
    if (choice === 'ALLY') {
        storyBonusHealth = 15;
        storyBonusDamage = 0;
        storyMachineDamage = 0;
        storyDecisionText = chooseStoryDecisionAlly;
    } else if (choice === 'PURSUIT') {
        storyBonusDamage = 3;
        storyBonusHealth = 0;
        storyMachineDamage = 0;
        storyDecisionText = chooseStoryDecisionPursuit;
    } else if (choice === 'OBJECTIVE') {
        storyBonusHealth = 5;
        storyBonusDamage = 0;
        storyMachineDamage = -1;
        storyDecisionText = chooseStoryDecisionObjective;
    } else if (choice === 'REPAIR') {
        storyBonusHealth = 20;
        storyMachineDamage = 0;
        storyDecisionText = chooseStoryDecisionRepair;
    } else if (choice === 'WEAPON') {
        storyBonusDamage = 4;
        storyBonusHealth = 0;
        storyDecisionText = chooseStoryDecisionWeapon;
    } else if (choice === 'SAFE') {
        storyBonusHealth = 10;
        storyBonusDamage = 0;
        storyMachineDamage = -2;
        storyDecisionText = chooseStoryDecisionSafe;
    }
    gameState = 'MAP';
}

function resetStorySeries() {
    storySeriesHumanWins = 0;
    storySeriesMachineWins = 0;
    storySeriesRoundsPlayed = 0;
    storySeriesHumanHealthTotal = 0;
    storySeriesMachineHealthTotal = 0;
    storyRoundRecorded = false;
}

function getStorySeriesWinner() {
    if (storySeriesHumanWins >= 2)
        return 1;
    if (storySeriesMachineWins >= 2)
        return 2;
    if (storySeriesRoundsPlayed < 3)
        return 0;

    // Si el tercer combate termina empatado sin que nadie llegue a dos victorias,
    // se usa la salud acumulada en la serie como desempate.
    if (storySeriesHumanWins !== storySeriesMachineWins) {
        return storySeriesHumanWins > storySeriesMachineWins ? 1 : 2;
    }
    if (storySeriesHumanHealthTotal !== storySeriesMachineHealthTotal) {
        return storySeriesHumanHealthTotal > storySeriesMachineHealthTotal ? 1 : 2;
    }
    // Desempate final determinista: evita dejar la campaña bloqueada en un 0-0.
    return 2;
}

function recordStoryBoutResult() {
    if (!isStoryMode || !gameOver || storyRoundRecorded)
        return;
    storyRoundRecorded = true;
    storySeriesRoundsPlayed++;
    const boutWinner = getRoundWinner();
    const human = getHumanPlayer();
    const machine = getMachinePlayer();
    storySeriesHumanHealthTotal += human.health;
    storySeriesMachineHealthTotal += machine.health;
    if (boutWinner !== 0) {
        const winningPlayer = boutWinner === 1 ? player1 : player2;
        if (winningPlayer === human)
            storySeriesHumanWins++;
        else
            storySeriesMachineWins++;
    }
}

function startNextStoryBout() {
    currentArena = storyPhase;
    setArenaCombatants(currentArena);
    resetMatch();
    gameState = 'STORY_FIGHT';
}

function advanceStory() {
    if (isStoryMode && gameOver)
        recordStoryBoutResult();
    if (isStoryMode) {
        const seriesWinner = getStorySeriesWinner();
        if (seriesWinner === 0) {
            // Aún no hay vencedor de la serie: jugar el siguiente combate.
            startNextStoryBout();
            return;
        }
        if (seriesWinner !== 1)
            return;
        // La serie la ha ganado el jugador. Mostrar la escena posterior antes de avanzar.
        resetStorySeries();
        if (storyPhase === 4 || storyPhase === TOTAL_MISIONES) {
            beginShuttleMinigame();
            return;
        }
        startStoryDialogue(true);
        return;
    } else if (!humanWonStoryPhase()) {
        campaignAttempts--;
        if (campaignAttempts <= 0) {
            campaignAttempts = 0;
            campaignFailed = true;
            gameState = 'CAMPAIGN_FAILED';
        } else {
            gameState = 'RETRY';
        }
        return;
    }

    // Los bonus de lanzadera se intercalan después de las misiones 4 y 19.
    if (storyPhase === 4 || storyPhase === TOTAL_MISIONES) {
        beginShuttleMinigame();
        return;
    }

    if (storyPhase === 1) {
        storyPhase = 2;
        gameState = 'DECISION_TACTICAL';
        return;
    }
    if (storyPhase === 2) {
        storyPhase = 3;
        gameState = 'DECISION_RESCUE';
        return;
    }
    if (storyPhase === 3) {
        storyPhase = 4;
        gameState = 'DECISION_EMERGENCY';
        return;
    }
    if (storyPhase < TOTAL_MISIONES) {
        storyPhase++;
        gameState = 'MAP';
        return;
    }
    campaignCompleted = true;
    gameState = 'CAMPAIGN_COMPLETE';
}

function beginStoryDefeatCountdown() {
    storyDefeatCountdownStart = frameCount;
    storyDefeatAttemptCounted = false;
    gameState = 'STORY_DEFEAT_COUNTDOWN';
}

function retryStoryFightImmediately() {
    if (isStoryMode && gameOver)
        recordStoryBoutResult();
    const seriesWinner = getStorySeriesWinner();

    if (seriesWinner === 0) {
        // La serie sigue abierta: el combate siguiente no consume un intento de campaña.
        startNextStoryBout();
        return;
    }

    // Solo perder la serie completa consume un intento. La revancha reinicia la serie.
    campaignAttempts = Math.max(0, campaignAttempts - 1);
    storyDefeatAttemptCounted = true;
    if (campaignAttempts <= 0) {
        campaignAttempts = 0;
        campaignFailed = true;
        gameState = 'STORY_NEED_TRAINING';
        return;
    }
    resetStorySeries();
    startNextStoryBout();
}

function handleStoryNeedTrainingContinue() {
    if (campaignFailed || campaignAttempts <= 0) {
        gameState = 'CAMPAIGN_FAILED';
        return;
    }
    // Se agotó la ventana de revancha. Consume un intento y permite comenzar la serie de nuevo.
    campaignAttempts = Math.max(0, campaignAttempts - 1);
    if (campaignAttempts <= 0) {
        campaignAttempts = 0;
        campaignFailed = true;
        gameState = 'CAMPAIGN_FAILED';
        return;
    }
    resetStorySeries();
    storyDefeatAttemptCounted = false;
    gameState = 'RETRY';
}

function updateStoryDefeatCountdown() {
    if (gameState !== 'STORY_DEFEAT_COUNTDOWN')
        return;
    const elapsed = frameCount - storyDefeatCountdownStart;
    if (elapsed >= STORY_DEFEAT_COUNTDOWN_FRAMES) {
        gameState = 'STORY_NEED_TRAINING';
    }
}

function drawStoryDefeatCountdown() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const elapsed = Math.max(0, frameCount - storyDefeatCountdownStart);
    const secondsLeft = Math.max(0, Math.ceil((STORY_DEFEAT_COUNTDOWN_FRAMES - elapsed) / 60));
    text(storyDefeatCountdownLose, canvas.width / 2, canvas.height * 0.32, 24, '#ff5555', true);
    text(storyDefeatCountdownRetry, canvas.width / 2, canvas.height * 0.43, 18, '#fff', true);
    text(`${storyDefeatCountdownTime} ${secondsLeft}`, canvas.width / 2, canvas.height * 0.55, 22, '#ffcc00', true);
    text(storyDefeatCountdownToRetry, canvas.width / 2, canvas.height * 0.68, 14, '#00ffcc', true);
    text(storyDefeatCountdownToMenu, canvas.width / 2, canvas.height * 0.75, 12, '#aaaaaa');
}

function drawNeedMoreTraining() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    text(needMoreTraining, canvas.width / 2, canvas.height * 0.42, 26, '#ffcc00', true);
    if (campaignFailed || campaignAttempts <= 0) {
        text(needMoreTraining, canvas.width / 2, canvas.height * 0.52, 14, '#fff');
        text(needMoreTrainingKeyToContinue, canvas.width / 2, canvas.height * 0.65, 13, '#00ffcc', true);
    } else {
        text(`${needMoreTrainingRemaining1} ${campaignAttempts} ${needMoreTrainingRemaining2}`, canvas.width / 2, canvas.height * 0.52, 14, '#fff');
        text(needMoreTrainingKeyToContinue, canvas.width / 2, canvas.height * 0.65, 13, '#00ffcc', true);
    }
}

function beginShuttleMinigame() {
    shuttleMaxHealth = 300;
    shuttleHealth = 300;
    shuttleTimer = 60 * 60;
    shuttleHits = 0;
    shuttlePlayerPunchTimer = 0;
    shuttlePlayerX = canvas.width * 0.08;
    shuttlePlayerY = null;
    shuttleResult = '';
    shuttleResultTimer = 0;
    shuttleSparks = [];
    shuttleBonus = 0;
    gameState = 'SHUTTLE';
}

function finishShuttleMinigame(destroyed) {
    if (gameState !== 'SHUTTLE')
        return;
    shuttleResult = destroyed ? ShuttleMinigameDestroyed : ShuttleMinigameTimeOver;
    shuttleResultTimer = 0;
    if (destroyed) {
        shuttleBonus = 10;
        storyBonusDamage += 0; // La bonificación es puntuación; no altera el equilibrio del combate.
    }
    gameState = 'SHUTTLE_RESULT';
}

function continueAfterShuttle() {
    if (storyPhase >= TOTAL_MISIONES) {
        if (isStoryMode && getCharacter(getHumanPlayer()).name === 'PICARD') {
            // Final alternativo: Picard entra en el Nexus y solicita la ayuda de Kirk.
            picardNexusStep = 0;
            gameState = 'PICARD_NEXUS';
        } else {
            beginQTrial();
        }
    } else {
        storyPhase++;
        gameState = 'MAP';
    }
}

function beginQTrial() {
    qTrialTimer = 60;
    qTrialPower = 3;
    qTrialStability = 0;
    qTrialStep = 0;
    qTrialMessage = qTrialMessageTitle;
    qTrialOutcome = '';
    qTrialFrame = 0;
    gameState = 'Q_TRIAL';
}

function chooseQTrialAction(action) {
    if (gameState !== 'Q_TRIAL' || qTrialOutcome)
        return;
    // Solución táctica: redirigir energía, estabilizar el campo y expulsar el núcleo.
    if (qTrialStep === 0 && action === 1) {
        qTrialPower += 2;
        qTrialStep = 1;
        qTrialMessage = qTrialMessageAction1;
    } else if (qTrialStep === 1 && action === 2) {
        qTrialStability += 1;
        qTrialPower -= 1;
        qTrialStep = 2;
        qTrialMessage = qTrialMessageAction2;
    } else if (qTrialStep === 2 && action === 3) {
        qTrialOutcome = 'WIN';
        qTrialMessage = qTrialMessageAction3;
        campaignCompleted = true
        qTrialResultFrame = frameCount;
        gameState = 'Q_TRIAL_RESULT';
        return;
    } else {
        qTrialTimer -= 8;
        qTrialPower = Math.max(0, qTrialPower - 1);
        qTrialMessage = qTrialMessageAction4;
        if (qTrialTimer <= 0 || qTrialPower <= 0) {
            qTrialOutcome = 'LOSE';
            gameState = 'Q_TRIAL_RESULT';
        }
    }
}

function updateQTrial() {
    if (gameState !== 'Q_TRIAL')
        return;
    qTrialFrame++;
    if (qTrialFrame % 60 === 0)
        qTrialTimer--;
    if (qTrialTimer <= 0) {
        qTrialTimer = 0;
        qTrialOutcome = 'LOSE';
        qTrialMessage = qTrialMessageOver;
        qTrialResultFrame = frameCount;
        gameState = 'Q_TRIAL_RESULT';
    }
}

function drawQTrial() {
    const w = canvas.width,
    h = canvas.height;
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#050817');
    bg.addColorStop(0.55, '#10243c');
    bg.addColorStop(1, '#260d2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Estrellas y marco táctico
    for (let i = 0; i < 70; i++) {
        const x = (i * 137 + 31) % w,
        y = (i * 83 + 17) % h;
        ctx.fillStyle = i % 4 === 0 ? '#ffd36b' : '#8bdcff';
        ctx.globalAlpha = 0.35 + ((i % 5) * 0.12);
        ctx.fillRect(x, y, i % 6 === 0 ? 3 : 1.5, i % 6 === 0 ? 3 : 1.5);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#66eaff';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 22, w - 48, h - 44);

    text(qTrialMessageCourt, w / 2, 55, 34, '#ffe28a', true);
    text(qTrialMessageExpulse, w / 2, 83, 23, '#82eaff', false);
    // Retrato de Q desde assets/q_talk.png
    const qBoxX = w / 2 - 105,
    qBoxY = 98,
    qBoxW = 210,
    qBoxH = 78;
    ctx.fillStyle = 'rgba(5,10,25,0.88)';
    ctx.fillRect(qBoxX, qBoxY, qBoxW, qBoxH);
    ctx.strokeStyle = '#d5b6ff';
    ctx.strokeRect(qBoxX, qBoxY, qBoxW, qBoxH);
    if (qTalkImage.complete && qTalkImage.naturalWidth > 0) {
        const ratio = Math.min((qBoxW - 8) / qTalkImage.naturalWidth, (qBoxH - 8) / qTalkImage.naturalHeight);
        const drawW = qTalkImage.naturalWidth * ratio,
        drawH = qTalkImage.naturalHeight * ratio;
        ctx.drawImage(qTalkImage, w / 2 - drawW / 2, qBoxY + (qBoxH - drawH) / 2, drawW, drawH);
    } else {
        text(qTrialQ, w / 2, 137, 35, '#e7d1ff', false);
    }
    text(qTrialInteligence, w / 2, 190, 18, '#f4eaff');

    // Temporizador y barra
    const seconds = Math.max(0, qTrialTimer);
    text(`${qTrialTime}${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`, w / 2, 220, 22, seconds <= 10 ? '#ff5d66' : '#ffd36b', true);
    ctx.fillStyle = '#293747';
    ctx.fillRect(w * 0.2, 232, w * 0.6, 12);
    ctx.fillStyle = seconds <= 10 ? '#ff4655' : '#56e5ff';
    ctx.fillRect(w * 0.2, 232, w * 0.6 * Math.max(0, qTrialTimer / 60), 12);
    ctx.strokeStyle = '#d8f8ff';
    ctx.strokeRect(w * 0.2, 232, w * 0.6, 12);
    text(`${qTrialEnergyQuantity}${qTrialPower}`, w / 2, 272, 14, '#8df5ff', false);

    const tasks = [
        qTrialTask1,
        qTrialTask2,
        qTrialTask3
    ];

    for (let i = 0; i < tasks.length; i++) {
        const y = 318 + i * 46;
        ctx.fillStyle = i < qTrialStep ? 'rgba(40,190,130,0.22)' : 'rgba(15,30,48,0.85)';
        ctx.fillRect(w * 0.14, y - 20, w * 0.72, 38);
        ctx.strokeStyle = i < qTrialStep ? '#55f0b0' : '#527b99';
        ctx.strokeRect(w * 0.14, y - 20, w * 0.72, 38);
        text((i < qTrialStep ? '✓ ' : '') + tasks[i], w / 2, y+6, 18, i < qTrialStep ? '#79ffc7' : '#e4f6ff', false);
    }
    const boxBottomY = h - 135;
    ctx.fillStyle = 'rgba(1,5,15,0.92)';
    ctx.fillRect(w * 0.1, boxBottomY, w * 0.8, 52);
    ctx.strokeStyle = '#66eaff';
    ctx.strokeRect(w * 0.1, boxBottomY, w * 0.8, 52);

    text(qTrialMessage, w / 2, boxBottomY + 31, 18, '#ffffff', false);
    text(qTrialKeyOptions, w / 2, h - 32, 18, '#8df5ff', false);
}

function drawQTrialResult() {
    const w = canvas.width,
    h = canvas.height;
    ctx.fillStyle = '#030713';
    ctx.fillRect(0, 0, w, h);
    overlay(0.72);
    const won = qTrialOutcome === 'WIN';
    //text(won ? qTrialResultWin1 : qTrialResultLose1, w / 2, h / 2 - 48, 30, won ? '#7dffbe' : '#ff6474', true);
    textWithAnimation(
        won ? qTrialResultWin1 : qTrialResultLose1,
        w / 2,
        h / 2 - 48,
        10,            // Tamaño inicial pequeño
        130,            // Tamaño final
        25,
        (frameCount - qTrialResultFrame),
        won ? '#7dffbe' : '#ff6474',
        true
    );
    text(won ? qTrialResultWin2 : qTrialResultLose2, w / 2, h / 2 - 8, 24, '#ffffff', false);
    text(won ? qTrialResultWin3 : qTrialResultLose3, w / 2, h / 2 + 24, 22, '#d7c8ff', false);
    text(qTrialKeyToMenu, w / 2, h / 2 + 65, 22, '#8df5ff', false);
}

function updateShuttleMinigame() {
    if (gameState !== 'SHUTTLE')
        return;

    // Movimiento del personaje seleccionado con WASD o flechas, limitado al área visible.
    const moveSpeed = 4;
    if (keys.ArrowLeft || keys.a || keys.A)
        shuttlePlayerX -= moveSpeed;
    if (keys.ArrowRight || keys.d || keys.D)
        shuttlePlayerX += moveSpeed;
    if (keys.ArrowUp || keys.w || keys.W)
        shuttlePlayerY = (shuttlePlayerY ?? canvas.height * 0.35) - moveSpeed;
    if (keys.ArrowDown || keys.s || keys.S)
        shuttlePlayerY = (shuttlePlayerY ?? canvas.height * 0.35) + moveSpeed;
    const drawWidth = Math.min(canvas.width * 0.23, 190);
    const shuttleCharacter = getCharacter(getHumanPlayer());
    const img = shuttlePlayerPunchTimer > 0 ? shuttleCharacter.punchImg : shuttleCharacter.guardImg;
    const drawHeight = img && img.naturalWidth > 0
         ? drawWidth * img.naturalHeight / img.naturalWidth
         : drawWidth * 1.7;
    shuttlePlayerX = clamp(shuttlePlayerX, 0, Math.max(0, canvas.width - drawWidth));
    const minY = 85;
    const maxY = Math.max(minY, canvas.height - drawHeight - 45);
    if (shuttlePlayerY === null)
        shuttlePlayerY = maxY;
    shuttlePlayerY = clamp(shuttlePlayerY, minY, maxY);

    if (shuttlePlayerPunchTimer > 0)
        shuttlePlayerPunchTimer--;
    if (shuttleTimer > 0)
        shuttleTimer--;
    if (shuttleTimer <= 0) {
        finishShuttleMinigame(false);
        return;
    }
    for (const spark of shuttleSparks) {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.12;
        spark.life--;
    }
    shuttleSparks = shuttleSparks.filter(spark => spark.life > 0);
}

function hitShuttle() {
    if (gameState !== 'SHUTTLE')
        return;
    shuttleHealth = Math.max(0, shuttleHealth - 5);
    shuttleHits++;
    shuttlePlayerPunchTimer = 9;
    const cx = canvas.width * 0.62 + (Math.random() - 0.5) * 150;
    const cy = canvas.height * 0.57 + (Math.random() - 0.5) * 75;
    for (let i = 0; i < 9; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        shuttleSparks.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 15 + Math.floor(Math.random() * 18)
        });
    }
    if (shuttleHealth <= 0)
        finishShuttleMinigame(true);
}

function drawShuttleMinigame() {
    const w = canvas.width,
    h = canvas.height;
    // El hangar solo se dibuja en el minijuego; las 19 arenas de historia mantienen su orden.
    if (shuttleHangarBackground.complete && shuttleHangarBackground.naturalWidth > 0) {
        ctx.drawImage(shuttleHangarBackground, 0, 0, w, h);
        // Ligero velo para mantener legibles el HUD y los efectos del minijuego.
        ctx.fillStyle = 'rgba(2, 9, 20, 0.16)';
        ctx.fillRect(0, 0, w, h);
    } else {
        // Fondo alternativo mientras carga el PNG o si no está disponible.
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#071426');
        sky.addColorStop(1, '#182b3b');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#24516a';
        ctx.lineWidth = 3;
        for (let x = 25; x < w; x += 90) {
            ctx.beginPath();
            ctx.moveTo(x, 35);
            ctx.lineTo(x + 25, h - 80);
            ctx.stroke();
        }
        ctx.fillStyle = '#101820';
        ctx.fillRect(0, h - 75, w, 75);
        ctx.strokeStyle = '#42616d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h - 75);
        ctx.lineTo(w, h - 75);
        ctx.stroke();
    }
    // Lanzadera Galileo: usa los PNG del usuario y mantiene la misma caja/posición.
    const galileoImage = shuttleHealth <= 0
        ? galileoDestruida
        : shuttleHealth <= (shuttleMaxHealth / 2) ? galileoDanada : galileoIntacta;
    const shuttleDrawWidth = w * 0.66;
    const shuttleDrawHeight = galileoImage.naturalWidth > 0
         ? shuttleDrawWidth * galileoImage.naturalHeight / galileoImage.naturalWidth
         : shuttleDrawWidth * 0.42;
    const shuttleDrawX = w * 0.34;
    const shuttleDrawY = h * 0.35;
    if (galileoImage.complete && galileoImage.naturalWidth > 0) {
        ctx.drawImage(galileoImage, shuttleDrawX, shuttleDrawY, shuttleDrawWidth, shuttleDrawHeight);
    } else {
        // Indicador temporal si aún no se han copiado/cargado los PNG.
        ctx.fillStyle = '#d7e1e8';
        ctx.fillRect(shuttleDrawX, shuttleDrawY + 30, shuttleDrawWidth, 70);
        ctx.fillStyle = '#d62828';
        ctx.fillRect(shuttleDrawX + 100, shuttleDrawY + 65, shuttleDrawWidth - 180, 10);
        text(shuttleMinigameErrorAsset, w / 2, h * 0.31, 33, '#ffcf4a', true);
    }
    // El minijuego usa el personaje que el jugador seleccionó para la campaña.
    // Al pulsar ESPACIO/INTRO se muestra brevemente su sprite de ataque.
    const shuttleCharacter = getCharacter(getHumanPlayer());
    const playerImage = shuttlePlayerPunchTimer > 0 ? shuttleCharacter.punchImg : shuttleCharacter.guardImg;
    const playerDrawWidth = Math.min(w * 0.23, 190);
    const playerDrawHeight = playerImage && playerImage.naturalWidth > 0
         ? playerDrawWidth * playerImage.naturalHeight / playerImage.naturalWidth
         : playerDrawWidth * 1.7;
    const playerDrawX = shuttlePlayerX;
    const playerDrawY = shuttlePlayerY === null
        ? h - playerDrawHeight - 70
        : clamp(shuttlePlayerY, 85, Math.max(85, h - playerDrawHeight - 45));
    if (playerImage && playerImage.complete && playerImage.naturalWidth > 0) {
        ctx.drawImage(playerImage, playerDrawX, playerDrawY, playerDrawWidth, playerDrawHeight);
    }
    // HUD arcade
    text(shuttleMinigameHudText, w / 2, 34, 35, '#ffcf4a', false);
    text(shuttleMinigameHudTextOrder, w / 2, 62, 25, '#ffffff', false);
    text(`${shuttleMinigameHudTextTime}${String(Math.ceil(shuttleTimer / 60)).padStart(2, '0')}`, w - 90, 35, 18, '#ffcf4a', false);
    text(`${shuttleMinigameHudTextHits}${shuttleHits}`, 78, 35, 26, '#8df4ff', false);
    ctx.fillStyle = '#273744';
    ctx.fillRect(w * 0.35, 82, w * 0.42, 18);
    ctx.fillStyle = shuttleHealth > (shuttleMaxHealth * 0.4) ? '#41d66b' : '#ff573d';
    ctx.fillRect(w * 0.35, 82, w * 0.42 * (shuttleHealth / shuttleMaxHealth), 18);
    ctx.strokeStyle = '#e4f4ff';
    ctx.strokeRect(w * 0.35, 82, w * 0.42, 18);
    for (const spark of shuttleSparks) {
        ctx.fillStyle = '#ffd166';
        ctx.globalAlpha = Math.max(0, spark.life / 30);
        ctx.fillRect(spark.x, spark.y, 4, 4);
    }
    ctx.globalAlpha = 1;
    text(shuttleMinigameHudTextKeys, w / 2, h - 25, 23, '#d6e7ef', false);
}

function drawShuttleResult() {
    drawShuttleMinigame();
    overlay(0.72);
    //text(shuttleResult, canvas.width / 2, canvas.height / 2 - 12, 28,
    //    shuttleResult === shuttleMinigameHudTextDestroyed ? '#ffcf4a' : '#ff755e', true);
    textWithAnimation(
        shuttleResult,
        canvas.width / 2,
        canvas.height / 2 - 12,
        10,            // Tamaño inicial pequeño
        110,           // Tamaño final
        25,
        (frameCount - shuttleResultTimer),
        shuttleResult === shuttleMinigameHudTextDestroyed ? '#ffcf4a' : '#ff755e',
        true
    );
    text(shuttleResult === shuttleMinigameHudTextDestroyed ? 'BONUS +10' : shuttleMinigameHudTextContinues,
        canvas.width / 2, canvas.height / 2 + 22, 35, '#ffffff', false);
    text(shuttleMinigameHudTextKeyToContinue, canvas.width / 2, canvas.height / 2 + 58, 23, '#8df4ff', false);
}

// ------------------------------------------------------------
// CONTROLES DEL TECLADO
// ------------------------------------------------------------
canvas.addEventListener('click', (event) => {
    if (gameState !== 'CHARACTER_SELECT' || !isVsMachine || isStoryMode)
        return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * canvas.width / rect.width;
    const y = (event.clientY - rect.top) * canvas.height / rect.height;
    if (selectRosterCharacterAt(x, y)) {
        // La máquina mantiene su selección salvo que coincida con el personaje humano.
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key.startsWith('Arrow')) {
        e.preventDefault();
    }

    if (gameState === 'TRIBBLES_EASTER_EGG' || gameState === 'SPOCK_EASTER_EGG' || gameState === 'EEN_EASTER_EGG' || gameState === 'DS9_EASTER_EGG') {
        if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'x' || e.key === 'Escape') {
            gameState = 'MENU';
            easterEggKeySequence = [];
            easterEggLetterBuffer = '';
        }
        return;
    }

    if (gameState === 'MENU') {
        const secretKey = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        easterEggKeySequence.push(secretKey);
        if (easterEggKeySequence.length > TRIBBLES_SECRET_SEQUENCE.length)
            easterEggKeySequence.shift();
        if (easterEggKeySequence.length === TRIBBLES_SECRET_SEQUENCE.length &&
            easterEggKeySequence.every((key, index) => key === TRIBBLES_SECRET_SEQUENCE[index])) {
            gameState = 'TRIBBLES_EASTER_EGG';
            playSound(soundTribbles);
            easterEggKeySequence = [];
            easterEggLetterBuffer = '';
            tribbleEasterEggCache = null;
            return;
        }
        if (e.key.length === 1 && /^[a-z0-9]$/i.test(e.key)) {
            easterEggLetterBuffer = (easterEggLetterBuffer + e.key.toUpperCase()).slice(-4);
            if (easterEggLetterBuffer === 'LLAP') {
                gameState = 'SPOCK_EASTER_EGG';
                playSound(soundSpock);
                easterEggKeySequence = [];
                easterEggLetterBuffer = '';
                return;
            }
            if (easterEggLetterBuffer.endsWith('EEN')) {
                gameState = 'EEN_EASTER_EGG';
                playSound(soundEen); 
                easterEggKeySequence = [];
                easterEggLetterBuffer = '';
                return;
            }
            if (easterEggLetterBuffer.endsWith('DS9')) {
                gameState = 'DS9_EASTER_EGG';
                playSound(soundDs9);
                easterEggKeySequence = [];
                easterEggLetterBuffer = '';
                return;
            }
        }

        if (e.key === ' ') {
            gameState = 'MODE_SELECT';
        } else if (e.key.toLowerCase() === 'c') {
            gameState = 'CREDITS';
        }
        return;
    }

    if (gameState === 'MODE_SELECT') {
        if (e.key === '1') {
            isStoryMode = false;
            isVsMachine = false;
            campaignCompleted = false;
            campaignFailed = false;
            currentArena = 1;
            gameState = 'CHARACTER_SELECT';
        } else if (e.key === '2') {
            isStoryMode = false;
            isVsMachine = true;
            campaignCompleted = false;
            campaignFailed = false;
            currentArena = 1;
            gameState = 'CHARACTER_SELECT';
        } else if (e.key === '3') {
            beginCampaign();
            gameState = 'CHARACTER_SELECT';
        } else if (e.key === '4') {
            beginTrainingMode();
        } else if (
            e.key.toLowerCase() === 'x' ||
            e.key === 'Escape') {
            gameState = 'MENU';
        }
        return;
    }

    if (gameState === 'TRAINING_BRIDGE') {
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
            changeTrainingCharacter(-1);
        } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
            changeTrainingCharacter(1);
        } else if (e.key === ' ' || e.key === 'Enter') {
            if (trainingDialogueIndex < trainingDialogue.length - 1)
                trainingDialogueIndex++;
            else
                gameState = 'TRAINING_BRIEFING';
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'x')
            gameState = 'MODE_SELECT';
        return;
    }

    if (gameState === 'TRAINING_BRIEFING') {
        if (e.key === ' ' || e.key === 'Enter')
            beginTrainingShootingRange();
        else if (e.key === 'Escape' || e.key.toLowerCase() === 'x')
            gameState = 'MODE_SELECT';
        return;
    }

    if (gameState === 'TRAINING_SHOOTING_RANGE') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
            for (const k in keys)
                keys[k] = false;
            gameState = 'MODE_SELECT';
            return;
        }
        if (trainingRangeGame && trainingRangeGame.over && (e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            if (trainingRangeGame.passed)
                beginStarshipMode();
            else
                beginTrainingShootingRange();
            return;
        }
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            fireTrainingRangeShot();
            return;
        }
        keys[e.key] = true;
        return;
    }

    if (gameState === 'TRAINING_COMPLETE') {
        // Easter Egg Q
        if (e.key.toLowerCase() === 'q') {
            qEasterEggActive = !qEasterEggActive;
            if (qEasterEggActive) {
                playSound(soundQ);
            }
            return;
        }
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' || e.key.toLowerCase() === 'x')
            gameState = 'MODE_SELECT';
        return;
    }

    if (gameState === 'INTELLIGENCE_TEST' || gameState === 'STAR_TREK_TRIVIA') {
        const type = gameState === 'INTELLIGENCE_TEST' ? 'intelligence' : 'trivia';
        const feedback = type === 'intelligence' ? intelligenceFeedback : triviaFeedback;
        if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
            for (const k in keys)
                keys[k] = false;
            gameState = 'MODE_SELECT';
            return;
        }
        if (feedback !== null) {
            if (e.key === ' ' || e.key === 'Enter')
                advanceTrainingQuestion(type);
        } else if (/^[1-4]$/.test(e.key)) {
            answerTrainingQuestion(type, Number(e.key) - 1);
        }
        return;
    }

    if (gameState === 'KOBAYASHI_MARU') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
            for (const k in keys)
                keys[k] = false;
            gameState = 'MODE_SELECT';
            return;
        }
        if (kobayashiMaruStage === 1 && /^[1-3]$/.test(e.key)) {
            chooseKobayashiMaruOption(Number(e.key) - 1);
        } else if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            advanceKobayashiMaru();
        }
        return;
    }

    if (gameState === 'STARSHIP_RACE') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
            for (const k in keys)
                keys[k] = false;
            gameState = 'MODE_SELECT';
            return;
        }
        if (starshipRaceGame && starshipRaceGame.over && (e.key === ' ' || e.key === 'Enter')) {
            if (starshipRaceGame.won)
                beginHolodeckLevel();
            else
                beginStarshipRace();
            return;
        }
        keys[e.key] = true;
        return;
    }

    if (gameState === 'HOLODECK') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
            for (const k in keys)
                keys[k] = false;
            gameState = 'MODE_SELECT';
            return;
        }
        if (holodeckGame && (holodeckGame.over || holodeckGame.complete) && (e.key === ' ' || e.key === 'Enter')) {
            if (holodeckGame.complete) {
                if (trainingCircuitIndex < holodeckCourses.length - 1)
                    beginHolodeckLevel(trainingCircuitIndex + 1);
                else
                    beginIntelligenceTest();
            } else
                beginHolodeckLevel(trainingCircuitIndex);
            return;
        }
        if ((e.key === ' ' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') && !e.repeat && holodeckGame)
            holodeckGame.player.jumpRequested = true;
        keys[e.key] = true;
        return;
    }

    if (gameState === 'CHARACTER_SELECT') {
        if (e.key.toLowerCase() === 'a') {
            player1.charIndex =
                (player1.charIndex - 1 + availableCharacters.length) %
            availableCharacters.length;
            updatePlayerAttributes(player1);
        } else if (e.key.toLowerCase() === 'd') {
            player1.charIndex =
                (player1.charIndex + 1) % availableCharacters.length;
            updatePlayerAttributes(player1);
        }

        if (e.key.toLowerCase() === 'w') {
            player2.charIndex =
                (player2.charIndex - 1 + availableCharacters.length) %
            availableCharacters.length;
            updatePlayerAttributes(player2);
        } else if (e.key.toLowerCase() === 's') {
            player2.charIndex =
                (player2.charIndex + 1) % availableCharacters.length;
            updatePlayerAttributes(player2);
        }

        if (isVsMachine && e.key.toLowerCase() === 'q') {
            humanPlayerIndex = humanPlayerIndex === 1 ? 2 : 1;
        }

        if (e.key === ' ') {
            // Aplicar los combatientes correspondientes a la arena inicial.
            // En los modos contra la máquina se conserva el personaje humano.
            setArenaCombatants(currentArena);
            resetMatch();
            gameState = isStoryMode ? 'INTRO' : 'FIGHT';
        } else if (
            e.key.toLowerCase() === 'x' ||
            e.key === 'Escape') {
            gameState = 'MODE_SELECT';
        }

        return;
    }

    if (gameState === 'INTRO') {
        if (e.key === ' ' || e.key === 'Enter') {
            gameState = 'MAP';
        } else if (
            e.key.toLowerCase() === 'x' ||
            e.key === 'Escape') {
            gameState = 'MENU';
        }
        return;
    }

    if (gameState === 'DECISION_TACTICAL') {
        if (e.key === '1')
            chooseStoryDecision('ALLY');
        else if (e.key === '2')
            chooseStoryDecision('PURSUIT');
        else if (e.key === '3')
            chooseStoryDecision('OBJECTIVE');
        return;
    }

    if (gameState === 'DECISION_RESCUE') {
        if (e.key === '1')
            chooseStoryDecision('ALLY');
        else if (e.key === '2')
            chooseStoryDecision('PURSUIT');
        else if (e.key === '3')
            chooseStoryDecision('OBJECTIVE');
        return;
    }

    if (gameState === 'DECISION_EMERGENCY') {
        if (e.key === '1')
            chooseStoryDecision('REPAIR');
        else if (e.key === '2')
            chooseStoryDecision('WEAPON');
        else if (e.key === '3')
            chooseStoryDecision('SAFE');
        return;
    }

    if (gameState === 'STORY_DIALOGUE') {
        if (e.key === ' ' || e.key === 'Enter')
            continueStoryDialogue();
        else if (e.key === 'Escape' || e.key.toLowerCase() === 'x')
            gameState = 'MENU';
        return;
    }

    if (gameState === 'MAP') {
        if (e.key === ' ' || e.key === 'Enter') {
            resetStorySeries();
            startStoryDialogue(false);
        } else if (
            e.key.toLowerCase() === 'x' ||
            e.key === 'Escape') {
            gameState = 'MODE_SELECT';
        }
        return;
    }

    if (gameState === 'STORY_DEFEAT_COUNTDOWN') {
        if (e.key === ' ' || e.key === 'Enter') {
            if (!e.repeat)
                retryStoryFightImmediately();
        } else if (e.key.toLowerCase() === 'x' || e.key === 'Escape') {
            gameState = 'MENU';
        }
        return;
    }

    if (gameState === 'STORY_NEED_TRAINING') {
        if (e.key === ' ' || e.key === 'Enter') {
            handleStoryNeedTrainingContinue();
        } else if (e.key.toLowerCase() === 'x' || e.key === 'Escape') {
            gameState = 'MENU';
        }
        return;
    }

    if (gameState === 'RETRY') {
        if (e.key === ' ' || e.key === 'Enter') {
            resetStorySeries();
            currentArena = storyPhase;
            setArenaCombatants(currentArena);
            resetMatch();
            gameState = 'STORY_FIGHT';
        } else if (
            e.key.toLowerCase() === 'x' ||
            e.key === 'Escape') {
            gameState = 'MENU';
        }

        return;
    }

    if (gameState === 'Q_TRIAL') {
        if (e.key === '1' || e.key === '2' || e.key === '3') {
            chooseQTrialAction(Number(e.key));
        } else if (e.key.toLowerCase() === 'x' || e.key === 'Escape') {
            gameState = 'MENU';
        }
        return;
    }

    if (gameState === 'Q_TRIAL_RESULT') {
        if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'x' || e.key === 'Escape') {
            resetMatch();
            gameState = 'MENU';
        }
        return;
    }

    if (gameState === 'PICARD_NEXUS') {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            if (picardNexusStep < 3) {
                picardNexusStep++;
            } else {
                beginQTrial();
            }
        } else if (e.key.toLowerCase() === 'x' || e.key === 'Escape') {
            gameState = 'MENU';
        }
        return;
    }

    if (
        gameState === 'CAMPAIGN_COMPLETE' ||
        gameState === 'CAMPAIGN_FAILED') {
        if (
            e.key === ' ' ||
            e.key === 'Enter' ||
            e.key.toLowerCase() === 'x' ||
            e.key === 'Escape') {
            resetMatch();
            gameState = 'MENU';
        }

        return;
    }

    if (gameState === 'CREDITS') {
        if (
            e.key.toLowerCase() === 'x' ||
            e.key === 'Escape') {
            gameState = 'MENU';
        }

        return;
    }

    if (gameState === 'SHUTTLE') {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key))
            e.preventDefault();
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'A', 'd', 'D', 'w', 'W', 's', 'S'].includes(e.key)) {
            keys[e.key] = true;
        }
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            hitShuttle();
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
            finishShuttleMinigame(false);
        }
        return;
    }

    if (gameState === 'SHUTTLE_RESULT') {
        if (e.key === ' ' || e.key === 'Enter')
            continueAfterShuttle();
        else if (e.key === 'Escape' || e.key.toLowerCase() === 'x')
            gameState = 'MENU';
        return;
    }

    if (gameState === 'STARSHIP') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
            for (const k in keys)
                keys[k] = false;
            gameState = 'MODE_SELECT';
            return;
        }
        if (starshipGame && starshipGame.over && (e.key === ' ' || e.key === 'Enter')) {
            if (starshipGame.missionComplete)
                beginStarshipRace();
            else
                beginStarshipMode();
            return;
        }
        keys[e.key] = true;
        return;
    }

    if (gameOver) {
        // Ignorar cambios de pantalla durante los primeros 5 segundos de la caída.
        if (frameCount - gameOverFrame < GAME_OVER_PAUSE_FRAMES)
            return;

        if (e.key === ' ' || e.key === 'Enter') {
            if (isStoryMode) {
                advanceStory();
            } else {
                resetMatch();
                gameState = 'FIGHT';
            }
        } else if (
            e.key.toLowerCase() === 'x' ||
            e.key === 'Escape') {
            //resetMatch();
            gameState = 'MENU';
        }

        return;
    }

    keys[e.key] = true;

    if (
        canHumanControlPlayer(1) &&
        e.key.toLowerCase() === 'w' &&
        player1.y === floorY) {
        jumpPlayer(player1);
    }

    if (
        canHumanControlPlayer(2) &&
        e.key === 'ArrowUp' &&
        player2.y === floorY) {
        jumpPlayer(player2);
    }

    if (canHumanControlPlayer(1) && e.key === ' ') {
        startAttack(player1);
    }

    if (canHumanControlPlayer(2) && e.key === 'Enter') {
        startAttack(player2);
    }

    // En combate libre, E avanza a la siguiente arena
    // y actualiza también los combatientes.
    if (
        gameState === 'FIGHT' &&
        e.key.toLowerCase() === 'e') {
        nextArena();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

window.addEventListener('blur', () => {
    for (const k in keys)
        keys[k] = false;
});

// ------------------------------------------------------------
// FONDOS, PARTÍCULAS Y UTILIDADES DE DIBUJO
// ------------------------------------------------------------

function drawBackground() {
    const arenaIndex = clamp(
            currentArena - 1,
            0,
            arenaImages.length - 1);

    const img = arenaImages[arenaIndex];

    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Fondo alternativo si la imagen no existe
        // o todavía no ha terminado de cargar.
        ctx.save();
        ctx.strokeStyle = 'rgba(0,255,255,0.18)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawParticles(true);
}

function drawParticles(move) {
    for (const p of energyParticles) {
        if (move) {
            p.y -= p.speedY;
            if (p.y < 0) {
                p.y = canvas.height;
                p.x = Math.random() * canvas.width;
            }
        }

        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    ctx.globalAlpha = 1;
}

function drawTitleBackground() {
    if (
        titleScreenImage.complete &&
        titleScreenImage.naturalWidth > 0) {
        ctx.drawImage(titleScreenImage, 0, 0, canvas.width, canvas.height);
    } else {
        drawBackground();
    }
}

function overlay(alpha = 0.8) {
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function text(str, x, y, size = 16, color = '#fff', bold = false, font = GAME_FONT) {
    ctx.fillStyle = color;
    ctx.font = `${bold ? 'bold ' : ''}${size}px ${font}`;
    ctx.textAlign = 'center';
    ctx.fillText(str, x, y);
}

// Dibuja un texto animado interpolando su tamaño entre initialSize y finalSize a lo largo de 'duration' fotogramas.
// Si duration es 0 o no se pasa, o el tiempo transcurrido es mayor que la duración, se usa finalSize.
function textWithAnimation(str, x, y, initialSize, finalSize, durationFrames, elapsedFrames, color = '#fff', bold = false, font = GAME_FONT) {
    let currentSize = finalSize;
    if (durationFrames > 0) {
        const progress = Math.min(1, Math.max(0, elapsedFrames / durationFrames));
        // Interpolación lineal entre el tamaño inicial y el final
        currentSize = initialSize + (finalSize - initialSize) * progress;
    }

    ctx.save();
    text(str, x, y, Math.round(currentSize), color, bold, font);
    ctx.restore();
}



// ------------------------------------------------------------
// ------------------------------------------------------------
// EASTER EGGS SECRETOS
// ------------------------------------------------------------
function drawTribble(x, y, r, variant = 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + r * 0.68, r * 0.9, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    const colors = ['#b98a55', '#c7b08b', '#8b684d', '#d2bd96'];
    ctx.fillStyle = colors[variant % colors.length];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r - 1, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(70,42,24,0.42)';
    ctx.lineWidth = Math.max(1, r * 0.08);
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(x + i * r * 0.25, y - r * 0.15, r * 0.62, 0.2, Math.PI - 0.2);
        ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,244,215,0.85)';
    ctx.beginPath();
    ctx.arc(x - r * 0.2, y - r * 0.18, Math.max(1.3, r * 0.055), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
}

let tribbleEasterEggCache = null;

function drawTribbleEasterEgg() {
    drawTitleBackground();
    overlay(0.48);
    // Pintamos aleatoriamente a los Tribbles
    if (!tribbleEasterEggCache) {
        tribbleEasterEggCache = [];
        const total = 65; // Número de tribbles en pantalla
        for (let i = 0; i < total; i++) {
            tribbleEasterEggCache.push({
                x: 30 + Math.random() * (canvas.width - 60),
                y: 110 + Math.random() * (canvas.height - 180),
                r: 10 + Math.random() * 18, // Tamaños variados aleatorios
                variant: Math.floor(Math.random() * 4) // Color aleatorio
            });
        }
    }

    // Dibujamos los tribbles usando la caché generada al entrar
    for (const t of tribbleEasterEggCache) {
        drawTribble(t.x, t.y, t.r, t.variant);
    }

    text(tribblesEasterEgg1, canvas.width / 2, 65, 37, '#ffcf72', false);
    text(tribblesEasterEgg2, canvas.width / 2, 100, 30, '#ffffff', false);
    text(tribblesEasterEgg3, canvas.width / 2, canvas.height - 100, 32, '#fff1d6');
    text(tribblesEasterEgg4, canvas.width / 2, canvas.height - 27, 32, '#8df4ff', false);
}

function drawSpockEasterEgg() {
    drawTitleBackground();
    overlay(0.72);
    text(spockEasterEgg1, canvas.width / 2, 100, 64, '#8df4ff', false);
    text(spockEasterEgg2, canvas.width / 2, 235, 104, '#7ce7ff', false);
    text(spockEasterEgg3, canvas.width / 2, 315, 54, '#ffcf72', false);
    text(spockEasterEgg4, canvas.width / 2, 370, 54, '#ffffff', false);
    text(spockEasterEgg5, canvas.width / 2, 423, 50, '#8df4ff', false);
    text(spockEasterEgg6, canvas.width / 2, canvas.height - 30, 32, '#8df4ff', false);
}

function drawEenEasterEgg() {
    drawTitleBackground();
    overlay(0.75);
    text(eenEasterEgg1, canvas.width / 2, 80, 56, '#ffcf72', false);
    const imgBoxX = canvas.width / 2 - 100;
    const imgBoxY = 110;
    const imgBoxW = 250;
    const imgBoxH = 270;

    if (eenImage.complete && eenImage.naturalWidth > 0) {
        const ratio = Math.min(imgBoxW / eenImage.naturalWidth, imgBoxH / eenImage.naturalHeight);
        const drawW = eenImage.naturalWidth * ratio;
        const drawH = eenImage.naturalHeight * ratio;
        ctx.drawImage(eenImage, canvas.width / 2 - drawW / 2, imgBoxY + (imgBoxH - drawH) / 2, drawW, drawH);
    }

    text(eenEasterEgg2, canvas.width / 2, 430, 28, '#ffffff', false);
    text(eenEasterEgg3, canvas.width / 2, 470, 22, '#7feeff', false);
    text(eenEasterEgg4, canvas.width / 2, canvas.height - 30, 20, '#8df4ff', false);
}

function drawDs9EasterEgg() {
    drawTitleBackground();
    overlay(0.75);
    text(ds9EasterEgg1, canvas.width / 2, 80, 56, '#ffcf72', false);
    const imgBoxX = canvas.width / 2 - 100;
    const imgBoxY = 110;
    const imgBoxW = 250;
    const imgBoxH = 270;

    if (ds9Image.complete && ds9Image.naturalWidth > 0) {
        const ratio = Math.min(imgBoxW / ds9Image.naturalWidth, imgBoxH / ds9Image.naturalHeight);
        const drawW = ds9Image.naturalWidth * ratio;
        const drawH = ds9Image.naturalHeight * ratio;
        ctx.drawImage(ds9Image, canvas.width / 2 - drawW / 2, imgBoxY + (imgBoxH - drawH) / 2, drawW, drawH);
    }

    text(ds9EasterEgg2, canvas.width / 2, 430, 28, '#ffffff', false);
    text(ds9EasterEgg3, canvas.width / 2, 470, 22, '#7feeff', false);
    text(ds9EasterEgg4, canvas.width / 2, canvas.height - 30, 20, '#8df4ff', false);
 }



// MENÚS
// ------------------------------------------------------------
function drawMainMenu() {
    drawTitleBackground();
    overlay(0.45);

    text(menuTitle, canvas.width / 2, 260, 86, 'Red', false, GAME_FONTTNG);
    text(menuSubtitle, canvas.width / 2, 310, 33, '#ffcc00', false, GAME_FONTDS9);
    text(menuKeys1, canvas.width / 2, 470, 28, '#00ffcc');
    text(menuKeys2, canvas.width / 2, 510, 24);
}

function drawModeSelect() {
    drawTitleBackground();
    overlay(0.84);

    text(menuSelectModeTitle, 500, 210, 35, '#00ffff', true);
    text(menuSelectModeKeys1, 500, 285, 28, '#ffcc00');
    text(menuSelectModeKeys2, 500, 340, 27, '#ffcc00');
    text(menuSelectModeKeys3, 500, 395, 27, '#00ffcc');
    text(menuSelectModeKeys4, 500, 450, 23, '#8df4ff');
    text(menuSelectModeKeys5, 500, 525, 23);
}

// ------------------------------------------------------------
// SELECCIÓN DE PERSONAJES
// Tarjetas centradas y marco luminoso independiente.
// El sprite del segundo participante se refleja solo aquí.
// ------------------------------------------------------------

function drawSelectionFrame(x, y, width, height, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 5, y + 5, width - 10, height - 10);
    ctx.restore();
}

function drawCharacterCard(p, centerX, index) {
    const c = getCharacter(p);
    const cardWidth = 250;
    const cardHeight = 300;
    const cardX = centerX - cardWidth / 2;
    const cardY = 95;
    const color = index === 1 ? '#00ffff' : '#ff9900';
    drawSelectionFrame(
        cardX,
        cardY,
        cardWidth,
        cardHeight,
        color);

    const heading = isVsMachine
        ? (humanPlayerIndex === index ? menuSelectPlayer1 : menuSelectPlayer2)
        : `${menuSelectPlayerNumber}${index}`;
    text(heading, centerX, 78, 20, color, true);

    if (c.guardImg.complete && c.guardImg.naturalWidth > 0) {
        const spriteWidth = 140;
        const spriteHeight = 190;
        const spriteX = centerX - spriteWidth / 2;
        const spriteY = 110;
        ctx.save();
        if (index === 2) {
            // Solo se refleja la imagen de la tarjeta derecha.
            ctx.translate(centerX, spriteY + spriteHeight / 2);
            ctx.scale(-1, 1);
            ctx.drawImage(
                c.guardImg,
                -spriteWidth / 2,
                -spriteHeight / 2,
                spriteWidth,
                spriteHeight);
        } else {
            ctx.drawImage(
                c.guardImg,
                spriteX,
                spriteY,
                spriteWidth,
                spriteHeight);
        }
        ctx.restore();
    }

    text(c.name, centerX, 320, 24, '#fff', true);
    text(c.role, centerX, 343, 16, '#00ffcc');
    text(`${menuSelectPlayerCharacter}${p.charIndex + 1}/${availableCharacters.length}`,
        centerX,
        365,
        16);
}

// Selector en cuadrícula para Player vs Máquina: todos los luchadores visibles.
function drawVsMachineRoster() {
    const cols = 6; // Reducimos de 8 a 6 columnas para hacer las cajas más anchas
    const rows = Math.ceil(availableCharacters.length / cols);
    const marginX = 40; // Margen lateral ampliado
    const topY = 60;    // Margen superior
    const gapX = 12;    // Separación horizontal entre cajas
    const gapY = 12;    // Separación vertical entre cajas
    const cardW = (canvas.width - marginX * 2 - gapX * (cols - 1)) / cols;
    const cardH = Math.min(115, (canvas.height - topY - 65 - gapY * (rows - 1)) / rows); // Altura mayor (hasta 115px)
    const humanIndex = humanPlayerIndex === 1 ? player1.charIndex : player2.charIndex;
    const machineIndex = humanPlayerIndex === 1 ? player2.charIndex : player1.charIndex;

    text(menuSelectMachineRosterTitle, canvas.width / 2, 38, 40, '#00ffff', true);
    text(menuSelectMachineRosterSubtitle, canvas.width / 2, canvas.height - 15, 24, '#00ffcc');

    for (let i = 0; i < availableCharacters.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = marginX + col * (cardW + gapX);
        const y = topY + row * (cardH + gapY);
        const ch = availableCharacters[i];
        const isHuman = i === humanIndex;
        const isMachine = i === machineIndex;
        const color = isHuman ? '#00ffff' : (isMachine ? '#ff9900' : 'rgba(150,190,210,0.65)');

        ctx.save();
        ctx.fillStyle = isHuman ? 'rgba(0,180,255,0.22)' : (isMachine ? 'rgba(255,140,0,0.16)' : 'rgba(5,18,34,0.86)');
        ctx.fillRect(x, y, cardW, cardH);
        ctx.strokeStyle = color;
        ctx.lineWidth = (isHuman || isMachine) ? 3 : 1;
        ctx.strokeRect(x, y, cardW, cardH);

        if (ch.guardImg && ch.guardImg.complete && ch.guardImg.naturalWidth > 0) {
            const iw = cardW * 0.55; // Sprite del personaje ampliado proporcionalmente
            const ih = cardH - 28;
            ctx.drawImage(ch.guardImg, x + (cardW - iw) / 2, y + 4, iw, ih);
        }
        // Texto del nombre más grande y legible (13px en lugar de 10px)
        text(ch.name, x + cardW / 2, y + cardH - 8, 13, isHuman ? '#7df7ff' : (isMachine ? '#ffc078' : '#ffffff'), true);
        if (isHuman || isMachine) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x + cardW - 9, y + 9, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function selectRosterCharacterAt(x, y) {
    const cols = 6; // Debe coincidir exactamente con drawVsMachineRoster
    const marginX = 40;
    const topY = 60;
    const gapX = 12;
    const gapY = 12;
    const rows = Math.ceil(availableCharacters.length / cols);
    const cardW = (canvas.width - marginX * 2 - gapX * (cols - 1)) / cols;
    const cardH = Math.min(115, (canvas.height - topY - 65 - gapY * (rows - 1)) / rows);
    const col = Math.floor((x - marginX) / (cardW + gapX));
    const row = Math.floor((y - topY) / (cardH + gapY));
    if (col < 0 || col >= cols || row < 0 || row >= rows)
        return false;
    const localX = (x - marginX) - col * (cardW + gapX);
    const localY = (y - topY) - row * (cardH + gapY);
    if (localX > cardW || localY > cardH)
        return false;
    const idx = row * cols + col;
    if (idx < 0 || idx >= availableCharacters.length)
        return false;

    const human = humanPlayerIndex === 1 ? player1 : player2;
    const machine = humanPlayerIndex === 1 ? player2 : player1;
    human.charIndex = idx;
    updatePlayerAttributes(human);
    if (machine.charIndex === idx) {
        machine.charIndex = (idx + 1) % availableCharacters.length;
        updatePlayerAttributes(machine);
    }
    return true;
}

function drawCharacterSelect() {
    drawTitleBackground();
    overlay(0.84);

    if (isVsMachine && !isStoryMode) {
        drawVsMachineRoster();
        text(`${characterSelectKey2}${machineDifficulty}`, 400, 57, 18, '#ffcc00');
        return;
    }

    text(characterSelectTitle, 500, 40, 26, '#00ffff', true);
    drawCharacterCard(player1, 300, 1);
    drawCharacterCard(player2, 700, 2);
    if (isVsMachine) {
        text(characterSelectKey1, 500, 380, 14);
        text(`${characterSelectKey2}${machineDifficulty}`, 500, 520, 18, '#ffcc00');
    }

    text(characterSelectKey3, 500, 440, 24);
    text(characterSelectKey4, 500, 470, 24, '#00ffcc');
}

function drawCredits() {
    drawTitleBackground();
    overlay(0.85);
    text(creditsTitle, 500, 90, 85, '#00ffff', false, GAME_FONT);
    text(creditsSubtitle, 500, 185, 36, '#ffcc00', false, GAME_FONTDS9);
    text(creditsText1, 500, 325, 24, '#ffcc00', false, GAME_FONTKLINGON);
    text(creditsText2, 500, 380, 24, '#00ffcc', false, GAME_FONTROMULAN);
    text(creditsText3, 500, 440, 24, '#ff9900', false, GAME_FONTTNG);
    text(creditsKeys, 500, 510, 24);
}

// ------------------------------------------------------------
// INTRODUCCIÓN DE LA CAMPAÑA: 19 MISIONES
// ------------------------------------------------------------
function drawIntro() {
    drawTitleBackground();
    overlay(0.88);
    text(introTitle, 500, 90, 64, '#00ffff', true);
    text(`${introSubTitle}${getHumanPlayer().name}`, 500, 160, 28, '#ffcc00', true);
    text(introLine1, 500, 220, 24);
    text(introLine2, 500, 270, 24);
    text(introLine3, 500, 320, 25, '#ff7777', true);
    text(introLine4, 500, 370, 23);
    text(introLine5, 500, 560, 25, '#00ffcc', true);
}

// ------------------------------------------------------------
// PANTALLAS DE DECISIONES
// ------------------------------------------------------------
function drawDecision() {
    drawTitleBackground();
    overlay(0.9);

    if (gameState === 'DECISION_TACTICAL') {
        text(decisionTacticalTitle, 400, 70, 25, '#00ffff', true);
        text(decisionTacticalSubTitle, 400, 120, 14);
    } else if (gameState === 'DECISION_RESCUE') {
        text(decisionRescueTitle, 400, 70, 25, '#00ffff', true);
        text(decisionRescueSubTitle, 400, 120, 13);
    } else {
        text(decisionEmergencyTitle, 400, 70, 25, '#00ffff', true);
        text(decisionEmergencySubTitle, 400, 120, 14);
    }

    if (gameState === 'DECISION_EMERGENCY') {
        text(decisionEmergencyKey1, 400, 195, 15, '#00ffcc');
        text(decisionEmergencyKey2, 400, 240, 15, '#ffcc00');
        text(decisionEmergencyKey3, 400, 285, 14, '#fff');
    } else {
        text(decisionNonEmergencyKey1, 400, 195, 15, '#00ffcc');
        text(decisionNonEmergencyKey2, 400, 240, 15, '#ffcc00');
        text(decisionNonEmergencyKey3, 400, 285, 14, '#fff');
    }

    text(decisionTextToSelect, 400, 370, 15, '#00ffcc', true);
}

// ------------------------------------------------------------
// MAPA DE LAS 19 MISIONES
// ------------------------------------------------------------
function drawStoryMap() {
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawParticles(true);

    text(storyMapTitle, canvas.width / 2, 30, 37, '#00ffff', false);
    text(`${storyMapSubtitleA} ${storyPhase}/${TOTAL_MISIONES} ${storyMapSubtitleB} ${campaignAttempts}/3`,
        canvas.width / 2, 57, 24, '#ffcc00', true);

    ctx.strokeStyle = 'rgba(0,255,255,0.4)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    galaxyNodes.forEach((n, i) => {
        if (i === 0) {
            ctx.moveTo(n.x, n.y);
        } else {
            ctx.lineTo(n.x, n.y);
        }
    });

    ctx.stroke();
    ctx.setLineDash([]);
    galaxyNodes.forEach((n, i) => {
        const nodeNumber = i + 1;
        ctx.beginPath();
        ctx.arc(
            n.x,
            n.y,
            nodeNumber === storyPhase ? 13 : 10,
            0,
            Math.PI * 2);

        ctx.fillStyle =
            nodeNumber === storyPhase
            ? '#ffcc00'
            : nodeNumber < storyPhase
            ? '#00ffcc'
            : '#4b5563';
        ctx.fill();

        text(String(nodeNumber), n.x, n.y + 4, 20, '#030712', true);
        text(n.name, n.x, n.y + 20, 15, '#fff', false);
    });

    const target = galaxyNodes[storyPhase - 1];
    shuttleX += (target.x - shuttleX) * 0.1;
    shuttleY += (target.y - shuttleY) * 0.1;
    text('▲', shuttleX, shuttleY - 13, 15, '#00ffcc', true);
    const info = storyDetails[storyPhase];
    text(info.title, canvas.width / 2, 430, 24, '#ffcc00');
    text(info.desc, canvas.width / 2, 455, 22);
    text(storyMapKeys, canvas.width / 2, 500, 23, '#00ffcc');

    if (storyDecisionText) {
        text(storyDecisionText, canvas.width / 2, 540, 9, '#fff');
    }

}

// ------------------------------------------------------------
// HUD: SALUD, TIEMPO Y NOMBRE DE LA ARENA
// ------------------------------------------------------------
function drawHUD() {
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(35, 15, 230, 47);
    ctx.fillRect(canvas.width - 265, 15, 230, 47);
    // Barra superior: salud. Barra inferior: energía/escudo.
    ctx.fillStyle = '#555';
    ctx.fillRect(45, 30, 200, 16);
    ctx.fillRect(canvas.width - 255, 30, 200, 16);
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(45, 30, 2 * clamp(player1.health, 0, 100), 16);
    ctx.fillRect(canvas.width - 255, 30, 2 * clamp(player2.health, 0, 100), 16);

    ctx.fillStyle = '#25384b';
    ctx.fillRect(45, 50, 200, 8);
    ctx.fillRect(canvas.width - 255, 50, 200, 8);
    ctx.fillStyle = '#20cfff';
    ctx.fillRect(45, 50, 2 * clamp(player1.energy || 0, 0, player1.maxEnergy || 100), 8);
    ctx.fillRect(canvas.width - 255, 50, 2 * clamp(player2.energy || 0, 0, player2.maxEnergy || 100), 8);

    text(player1.name, 145, 25, 18, '#fff', false);
    text(player2.name, canvas.width - 155, 25, 18, '#fff', false);
    text(timeText, canvas.width / 2, 39, 26, '#ffcc00', false, GAME_FONTKLINGON);
    if (isStoryMode) {
        text(`${hudStoryModeText1A} ${storyPhase}/${TOTAL_MISIONES} ${hudStoryModeText1B} ${campaignAttempts}/3`,
            canvas.width / 2, 65, 18, '#ffcc00', false);
        text(`${hudStoryModeText2A} ${storySeriesHumanWins}-${storySeriesMachineWins} ${hudStoryModeText2B} ${Math.min(storySeriesRoundsPlayed + 1, 3)}/3`,
            canvas.width / 2, 82, 16, '#8df4ff', false);
    } else {
        const arenaName = arenaNames[currentArena - 1] || 'Arena';

        text(`${hudNoStoryModeText1A} ${currentArena}/${TOTAL_ARENAS}: ${arenaName} ${hudNoStoryModeText1B}`,
            canvas.width / 2, 65, 18, '#ffcc00');
    }

    if (getCharacter(player1).name === 'RIKER' || getCharacter(player2).name === 'RIKER') {
        text(hudNoStoryModeTextRiker, canvas.width / 2, 88, 10, '#8df4ff', true);
    }
    if (getCharacter(player1).name === 'LAFORGE' || getCharacter(player2).name === 'LAFORGE') {
        text(hudNoStoryModeTextLaforge, canvas.width / 2, 104, 10, '#8df4ff', true);
        text(hudNoStoryModeTextLaforgeCombo, canvas.width / 2, 120, 9, '#ffcf4a', true);
    }
    for (const p of[player1, player2]) {
        if (p.comboDisplayTimer > 0 && p.comboCount >= 2 && !gameOver) {
            const x = p === player1 ? 145 : canvas.width - 155;
            const damageBonus = Math.min(8, (p.comboCount - 1) * 2);
            text(`${hudNoStoryModeTextCombo}${p.comboCount}! +${damageBonus}`, x, 78, 13, '#ffcf4a', true);
        }
    }
}

// ------------------------------------------------------------
// DIBUJO DE LOS PERSONAJES DURANTE EL COMBATE
// Se mantiene la orientación y el sistema original de sprites.
// ------------------------------------------------------------
function imageIsReady(img) {
    return !!(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
}

function drawCharacterImage(p, img, y) {
    if (!imageIsReady(img))
        return false;
    ctx.save();
    if (p.hitFlashTimer > 0)
        ctx.filter = 'brightness(2.1) saturate(0.18)';
    if (p.facing === -1) {
        ctx.translate(p.x + p.width / 2, y + p.height / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(img, -p.width / 2, -p.height / 2, p.width, p.height);
    } else {
        ctx.drawImage(img, p.x, y, p.width, p.height);
    }
    ctx.restore();
    return true;
}

function drawDefeatedCharacterImage(p, img, uprightY) {
    if (!imageIsReady(img))
        return false;

    // Mantener exactamente la caja del sprite de pie, sin escalarlo ni analizar
    // sus márgenes transparentes: así la caída usa el suelo real del combate.
    const drawWidth = p.width;
    const drawHeight = p.height;
    const groundY = uprightY + p.height;
    const centerY = groundY - drawWidth / 2;
    const centerX = clamp(p.x + p.width / 2, drawWidth / 2, canvas.width - drawWidth / 2);
    const isOnLeftSide = (p.x + p.width / 2) < (canvas.width / 2);

    ctx.save();
    ctx.translate(centerX, centerY);
    // Quien cae a la izquierda se tumba hacia la izquierda; quien cae a la
    // derecha se tumba hacia la derecha. El tamaño original se conserva.
    ctx.rotate(isOnLeftSide ? -Math.PI / 2 : Math.PI / 2);
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
    return true;
}

function drawSprite(p) {
    const c = getCharacter(p);
    let y = p.y + (BASE_HEIGHT - p.height);
    if (p.name === 'MARINA')
        y -= 40;

    // Preparado para cuando otro jugador tenga la imagen de victoria
    // Picard toca la flauta cuando gana el combate.
    // Cada personaje tendra una posicion de victoria diferente
    if (gameOver && c.victoryImg) {
        const winner = getRoundWinner();
        const playerNumber = p === player1 ? 1 : 2;
        const isWinner = winner !== 0 && winner === playerNumber;

        if (isWinner && imageIsReady(c.victoryImg)) {
            if (drawCharacterImage(p, c.victoryImg, y))
                return;
        }
    }

    if (gameOver) {
        const winner = getRoundWinner();
        const playerNumber = p === player1 ? 1 : 2;
        const isDefeated = winner === 0 || winner !== playerNumber;
        if (isDefeated && drawDefeatedCharacterImage(p, c.guardImg, y))
            return;
        // El vencedor termina de pie, en pose neutral, no congelado a mitad de golpe.
        if (drawCharacterImage(p, c.guardImg, y))
            return;
    } else if (c.name === 'RIKER' || c.name === 'LAFORGE' ||
        c.name === 'WORF' || c.name === 'EMILIO') {
        // Alterna entre las dos poses normales y las dos poses con silla.
        // Si alguna imagen adicional falta o tarda en cargar, vuelve a la pose normal.
        const useExtra = (c.name === 'RIKER' && isRikerExtraGuardHeld(p)) ||
            (c.name === 'LAFORGE' && isLaForgeExtraGuardHeld(p)) ||
            (c.name === 'WORF' && isWorfExtraGuardHeld(p)) ||
            (c.name === 'EMILIO' && isEmilioExtraGuardHeld(p));
        if (p.isAttacking) {
            // Usa el ataque extra (especial) si attackStyle es 'extra', o el normal si no
            const attackImg = p.attackStyle === 'extra' ? c.extraPunchImg : c.punchImg;
            if (drawCharacterImage(p, attackImg, y))
                return;
            if (p.attackStyle === 'extra' && drawCharacterImage(p, c.punchImg, y))
                return;
            if (drawCharacterImage(p, c.guardImg, y))
                return;
        } else {
            // Muestra la guardia extra si se mantiene S/Abajo, o la guardia normal en caso contrario
            const guardImg = useExtra ? c.extraGuardImg : c.guardImg;
            if (drawCharacterImage(p, guardImg, y))
                return;
            if (drawCharacterImage(p, c.punchImg, y))
                return;
        }
        return;
    } else {
        const img = p.isAttacking ? c.punchImg : c.guardImg;
        if (drawCharacterImage(p, img, y))
            return;
        // Para el resto del elenco, intenta la otra pose si la actual aún no carga.
        drawCharacterImage(p, p.isAttacking ? c.guardImg : c.punchImg, y);
        return;
    }

    // Respaldo por si el sprite de guardia todavía está cargando.
    drawCharacterImage(p, c.punchImg, y);
}

// ------------------------------------------------------------
// FIN DEL COMBATE
// ------------------------------------------------------------
function drawGameOver() {
    // Durante cinco segundos se ve la caída antes de mostrar el resultado.
    if (frameCount - gameOverFrame < GAME_OVER_PAUSE_FRAMES)
        return;

    if (isStoryMode) {
        recordStoryBoutResult();
        const boutWinner = getRoundWinner();
        const seriesWinner = getStorySeriesWinner();
        const human = getHumanPlayer();
        const humanWonBout = boutWinner !== 0 && (boutWinner === (human === player1 ? 1 : 2));

        // Si la máquina gana el combate y la serie aún no está decidida, la cuenta atrás
        // permite iniciar el siguiente combate. Si ya ganó la serie, permite reiniciarla.
        if (seriesWinner === 2 || (!humanWonBout && boutWinner !== 0 && seriesWinner === 0)) {
            if (gameState !== 'STORY_DEFEAT_COUNTDOWN')
                beginStoryDefeatCountdown();
            return;
        }
    }

    overlay(0.82);
    //text(roundWinnerMessage, canvas.width / 2, canvas.height / 2 - 30, 50, '#ffcc00', true);
    // Fotogramas transcurridos desde que aparece la pantalla de resultado
    const animElapsed = (frameCount - gameOverFrame) - GAME_OVER_PAUSE_FRAMES;
    const animDuration = 30; // Duración de la animación (30 fotogramas = 0.5 segundos a 60fps)

    // Comprobamos si es un mensaje de victoria por jugador (que contiene el salto de línea \n)
    //const cuantoSubir = roundWinnerHasTwoLines ? 65 : 30;
    //const centerY = (canvas.height / 2) - cuantoSubir;

    if (roundWinnerHasTwoLines) {
        const ganadorTexto = roundWinnerMessage.split('\n')[0] || roundWinnerMessage;

        // Nombre del jugador
        textWithAnimation(
            ganadorTexto,
            canvas.width / 2,
            (canvas.height / 2) - 85,
            10,           // Tamaño inicial (pequeño)
            150,           // Tamaño final (grande)
            animDuration,
            animElapsed,
            '#ffcc00',
            false
        );

        // Resultado
        textWithAnimation(
            winnerMessageWhoWins,
            canvas.width / 2,
            (canvas.height / 2) + 35,
            10,           // Tamaño inicial (pequeño)
            150,           // Tamaño final (grande)
            animDuration,
            animElapsed,
            '#ffcc00',
            false
        );
    }
    else {
        // Va creciendo desde un tamaño inicial (10px) hasta el tamaño final (50px)
        textWithAnimation(
            roundWinnerMessage,
            canvas.width / 2,
            (canvas.height / 2) - 60,
            10,           // Tamaño inicial (pequeño)
            150,           // Tamaño final (grande)
            animDuration,
            animElapsed,
            '#ffcc00',
            false
        );
    }

    if (isStoryMode) {
        const boutWinner = getRoundWinner();
        const seriesWinner = getStorySeriesWinner();
        let headline;
        if (seriesWinner === 1) {
            headline = `${endCombatMission} ${storySeriesHumanWins}-${storySeriesMachineWins}`;
        } else if (boutWinner === 0) {
            headline = endCombatDraw;
        } else if (boutWinner === (getHumanPlayer() === player1 ? 1 : 2)) {
            headline = `${endCombatWin} ${storySeriesHumanWins}-${storySeriesMachineWins}`;
        } else {
            headline = `${endCombatLose} ${storySeriesHumanWins}-${storySeriesMachineWins}`;
        }
        text(headline, canvas.width / 2, canvas.height / 2 + 10, 25, '#ffffff', true);
        text(`${endCombatLine1A} ${storyPhase}/${TOTAL_MISIONES} ${endCombatLine1B} ${storySeriesRoundsPlayed}/3`, canvas.width / 2, canvas.height / 2 + 55, 23, '#ffcc00');
        text(`${endCombatLine2} ${storySeriesHumanWins}-${storySeriesMachineWins}`, canvas.width / 2, canvas.height / 2 + 80, 23, '#00ffcc');
        text(seriesWinner === 1 ? endCombatLine3A : endCombatLine3B, canvas.width / 2, canvas.height / 2 + 110, 23, '#00ffcc');
    } else {
        text(endCombatLine4, canvas.width / 2, canvas.height / 2 + 60, 24, '#00ffcc');
    }
}

function drawPicardNexusEnding() {
    const w = canvas.width,
    h = canvas.height;
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#030711');
    bg.addColorStop(0.48, '#19142d');
    bg.addColorStop(1, '#070b19');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    drawParticles(true);

    // La cinta luminosa del Nexus: capas doradas para sugerir el espacio-tiempo.
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#ffd875';
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.47, w * 0.43, h * 0.18, -0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = '#ffdc82';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.47, w * 0.43, h * 0.18, -0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Reutiliza los sprites existentes de Picard y Kirk sin necesitar nuevos assets.
    const charW = Math.min(115, w * 0.145);
    const charH = charW * 600 / 340;
    if (imageIsReady(picardGuard)) {
        ctx.save();
        ctx.translate(w * 0.27 + charW / 2, h * 0.61);
        ctx.scale(1, 1);
        ctx.drawImage(picardGuard, -charW / 2, -charH / 2, charW, charH);
        ctx.restore();
    } else {
        ctx.fillStyle = '#d7aa55';
        ctx.fillRect(w * 0.27 - 22, h * 0.48, 44, 100);
    }
    if (imageIsReady(kirkGuard)) {
        ctx.save();
        ctx.translate(w * 0.73 + charW / 2, h * 0.61);
        ctx.scale(-1, 1);
        ctx.drawImage(kirkGuard, -charW / 2, -charH / 2, charW, charH);
        ctx.restore();
    } else {
        ctx.fillStyle = '#c4a36c';
        ctx.fillRect(w * 0.73 - 22, h * 0.48, 44, 100);
    }

    const pages = [{
            title: picardNexusEndingPage1Title,
            lines: [
                picardNexusEndingPage1Line1,
                picardNexusEndingPage1Line2,
                picardNexusEndingPage1Line3
            ],
            accent: '#ffd875'
        }, {
            title: picardNexusEndingPage2Title,
            lines: [
                picardNexusEndingPage2Line1,
                picardNexusEndingPage2Line2,
                picardNexusEndingPage2Line3
            ],
            accent: '#8df4ff'
        }, {
            title: picardNexusEndingPage3Title,
            lines: [
                picardNexusEndingPage3Line1,
                picardNexusEndingPage3Line2,
                picardNexusEndingPage3Line3
            ],
            accent: '#ffd875'
        }, {
            title: picardNexusEndingPage4Title,
            lines: [
                picardNexusEndingPage4Line1,
                picardNexusEndingPage4Line2,
                picardNexusEndingPage4Line3
            ],
            accent: '#8dffb5'
        }
    ];
    const page = pages[clamp(picardNexusStep, 0, pages.length - 1)];
    text(picardNexusEndingTitle, w / 2, 31, 13, '#b7c8e8', true);
    text(page.title, w / 2, 76, 23, page.accent, true);
    page.lines.forEach((line, i) => text(line, w / 2, 113 + i * 20, 12, '#ffffff', i === 0));
    text(`${SECUENCIA} ${picardNexusStep + 1}/4`, w / 2, h - 47, 11, '#d6c5f4', true);
    text(picardNexusStep < pages.length - 1 ? picardNexusEndingKeys1 : picardNexusEndingKeys2, w / 2, h - 24, 12, '#8df4ff', true);
}

function drawCampaignEnd(completed) {
    drawTitleBackground();
    overlay(0.88);

    //text(
    //    completed ? campaignEndDone : campaignEndFailed,
    //    400,
    //    160,
    //    27,
    //    completed ? '#00ffcc' : '#ff4444',
    //    true);
    textWithAnimation(
        completed ? campaignEndDone : campaignEndFailed,
        400,
        160,
        10,            // Tamaño inicial pequeño
        127,            // Tamaño final
        30,
        (frameCount - campaignEndFrame),
        completed ? '#00ffcc' : '#ff4444',
        true
    );

    if (completed) {
        text(campaignEndCompletedTitle, 400, 205, 15);
        if (getCharacter(getHumanPlayer()).name === 'PICARD') {
            text(campaignEndCompletedPicardLine1, 400, 235, 12, '#8df4ff', true);
            text(`${campaignEndCompletedPicardLine2A} ${getHumanPlayer().name}${campaignEndCompletedPicardLine2B}`, 400, 265, 17, '#ffcc00', true);
        } else {
            text(campaignEndCompletedNoPicardLine1, 400, 235, 14);
            text(`${campaignEndCompletedNoPicardLine2A} ${getHumanPlayer().name}${campaignEndCompletedNoPicardLine2B}`, 400, 265, 17, '#ffcc00', true);
        }
        text(
            campaignEndCompletedLine1,
            400,
            300,
            13,
            '#00ffcc',
            true);
    } else {
        text(campaignEndNotCompletedLine1, 400, 220, 15);
        text(campaignEndNotCompletedLine2, 400, 255, 14);
    }
    text(campaignEndToMenu, 400, 365, 14, '#fff');
}

function drawRetry() {
    drawBackground();
    overlay(0.85);
    text(retryTitle, 400, 160, 25, '#ff5555', true);
    text(`${retryArena} ${storyPhase}/${TOTAL_MISIONES}`, 400, 195, 15, '#00ffff', true);
    text(`${retryRemain1} ${campaignAttempts} ${retryRemain2}`, 400, 230, 20, '#ffcc00', true);
    text(retryRetryIt, 400, 270, 14, '#ffffff');
    text(retryKeys, 400, 330, 14, '#00ffcc');
}

function updateAndDrawCombat() {
    // --- COMPROBAR SI ESTÁ EN PAUSA DE INICIO ---
    if (matchStartDelay > 0) {
        matchStartDelay--;

        drawBackground();
        drawSprite(player1);
        drawSprite(player2);
        drawHUD();
        const elapsed = frameCount - matchStartFrame;
        textWithAnimation(
            startFight,
            canvas.width / 2,
            canvas.height / 2,
            10,                          // Tamaño inicial pequeño
            240,                         // Tamaño máximo al que llega
            120,                         // Duración total (coincide con matchStartDelay)
            elapsed,
            '#ffcc00',                   // Color dorado/amarillo trekkie
            true                         // Negrita
        );
        return;
    } else if (!gameOver) {
        if (frameCount % 60 === 0 && matchTimeLeft > 0) {
            matchTimeLeft--;

            timeText = `${String(Math.floor(matchTimeLeft / 60)).padStart(2, '0')}:` +
                      `${String(matchTimeLeft % 60).padStart(2, '0')}`;

            if (matchTimeLeft <= 0) {
                finishMatchByTime();
            }
        }

        if (canHumanControlPlayer(1)) {
            if (keys.a || keys.A) movePlayer(player1, -1);
            if (keys.d || keys.D) movePlayer(player1, 1);
        }

        if (canHumanControlPlayer(2) && !isVsMachine) {
            if (keys.ArrowLeft) movePlayer(player2, -1);
            if (keys.ArrowRight) movePlayer(player2, 1);
        }

        updateMachineAI();
        updatePlayerPhysics(player1);
        updatePlayerPhysics(player2);
        updateFacingDirections();
        updateAttack(player1, player2);
        updateAttack(player2, player1);

        if (player1.health <= 0 || player2.health <= 0) {
            player1.health = Math.max(0, player1.health);
            player2.health = Math.max(0, player2.health);
            gameOver = true;
            setWinnerMessageByHealth();
        }
    }

    // Actualiza el destello, las chispas y el retroceso incluso durante la pausa
    // posterior al combate.
    updateCombatImpactEffects();
    const shakeIntensity = screenShakeTimer > 0 ? Math.min(5, screenShakeTimer * 0.6) : 0;
    ctx.save();
    if (shakeIntensity > 0) {
        ctx.translate((Math.random() - 0.5) * shakeIntensity * 2, (Math.random() - 0.5) * shakeIntensity * 1.6);
    }
    drawBackground();
    drawSprite(player1);
    drawSprite(player2);
    drawCombatImpactEffects();
    ctx.restore();

    if (screenShakeTimer > 0) screenShakeTimer--;

    drawHUD();
    if (gameOver) {
        drawGameOver();
    }
}


// ------------------------------------------------------------
// BUCLE PRINCIPAL
// ------------------------------------------------------------
function gameLoop() {
    syncMenuMusic();
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frameCount++;

        // Manejo con switch
        switch (gameState) {
            case 'TRIBBLES_EASTER_EGG':
                drawTribbleEasterEgg();
                break;
            case 'SPOCK_EASTER_EGG':
                drawSpockEasterEgg();
                break;
            case 'EEN_EASTER_EGG':
                drawEenEasterEgg();
                break;
            case 'DS9_EASTER_EGG':
                drawDs9EasterEgg();
                break;
            case 'MENU':
                drawMainMenu();
                break;
            case 'MODE_SELECT':
                drawModeSelect();
                break;
            case 'CHARACTER_SELECT':
                drawCharacterSelect();
                break;
            case 'CREDITS':
                drawCredits();
                break;
            case 'INTRO':
                drawIntro();
                break;
            case 'STORY_DIALOGUE':
                drawStoryDialogue();
                break;
            case 'MAP':
                drawStoryMap();
                break;
            case 'TRAINING_BRIDGE':
                drawTrainingBridge();
                break;
            case 'TRAINING_BRIEFING':
                drawTrainingMissionBriefing();
                break;
            case 'TRAINING_SHOOTING_RANGE':
                updateTrainingShootingRange();
                drawTrainingShootingRange();
                break;
            case 'INTELLIGENCE_TEST':
                drawTrainingQuiz('intelligence');
                break;
            case 'STAR_TREK_TRIVIA':
                drawTrainingQuiz('trivia');
                break;
            case 'KOBAYASHI_MARU':
                drawKobayashiMaru();
                break;
            case 'TRAINING_COMPLETE':
                drawTrainingComplete();
                break;
            case 'HOLODECK':
                updateHolodeckLevel();
                drawHolodeckLevel();
                break;
            case 'STARSHIP':
                updateStarshipMode();
                drawStarshipMode();
                break;
            case 'STARSHIP_RACE':
                updateStarshipRace();
                drawStarshipRace();
                break;
            case 'SHUTTLE':
                updateShuttleMinigame();
                drawShuttleMinigame();
                break;
            case 'SHUTTLE_RESULT':
                drawShuttleResult();
                break;
            case 'Q_TRIAL':
                updateQTrial();
                if (gameState === 'Q_TRIAL') {
                    drawQTrial();
                } else {
                    drawQTrialResult();
                }
                break;
            case 'Q_TRIAL_RESULT':
                drawQTrialResult();
                break;
            case 'PICARD_NEXUS':
                drawPicardNexusEnding();
                break;
            case 'CAMPAIGN_COMPLETE':
                campaignEndFrame = frameCount;
                drawCampaignEnd(true);
                break;
            case 'CAMPAIGN_FAILED':
                drawCampaignEnd(false);
                break;
            case 'STORY_DEFEAT_COUNTDOWN':
                updateStoryDefeatCountdown();
                if (gameState === 'STORY_DEFEAT_COUNTDOWN') {
                    drawStoryDefeatCountdown();
                } else {
                    drawNeedMoreTraining();
                }
                break;
            case 'STORY_NEED_TRAINING':
                drawNeedMoreTraining();
                break;
            case 'RETRY':
                drawRetry();
                break;
            default:
                // Manejo de prefijos o estados genéricos (como FIGHT y STORY_FIGHT)
                if (gameState.startsWith('DECISION_')) {
                    drawDecision();
                } else {
                    updateAndDrawCombat(); // Motor de combate extraído
                }
                break;
        }
    } catch (error) {
        console.error('Error en STAR TREK:', error);
    }

    requestAnimationFrame(gameLoop);
}

// ------------------------------------------------------------
// INICIO DEL JUEGO
// ------------------------------------------------------------
Promise.all([
    document.fonts.load(`16px 'StarTrekFont'`),
    document.fonts.load(`16px 'StarTrekFontDS9'`),
    document.fonts.load(`16px 'StarTrekFontKlingon'`),
    document.fonts.load(`16px 'StarTrekFontRomulan'`),
    document.fonts.load(`16px 'StarTrekFontTNG'`)
]).then(() => {
    console.log('Todas las fuentes se han cargado correctamente.');
    requestAnimationFrame(gameLoop);
}).catch((err) => {
    console.error('Error al cargar alguna de las fuentes:', err);
// Iniciar de todos modos por si acaso
    requestAnimationFrame(gameLoop);
});
