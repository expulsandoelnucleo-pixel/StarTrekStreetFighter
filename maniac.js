
// ============================================================
// MANIAC MANSION - SELECCIÓN DE PERSONAJE
// ============================================================

const MANIAC_COLORS = {
    negro: '#000000',
    blanco: '#ffffff',
    gris: '#808080',
    grisClaro: '#c0c0c0',
    granate: '#800000',
    rojo: '#ff0000',
    oliva: '#808000',
    amarillo: '#ffff00',
    verde: '#008000',
    verdeClaro: '#00ff00',
    teal: '#008080',
    cian: '#00ffff',
    azulOscuro: '#000080',
    azul: '#0000ff',
    purpura: '#800080',
    magenta: '#ff00ff'
};

// ============================================================
// TEXTOS
// ============================================================
const tituloManiacMansion = 'MANIAC MANSION';
const eligePersonaje = 'ELIGE A TU PERSONAJE';
const instrucciones1 = '¿QUIÉN SE ATREVERÁ A DESCUBRIR';
const instrucciones2 = 'LOS SECRETOS DE ESTA AVENTURA?';
const instruccionesFlechaIzquierda = '◀';
const instruccionesFlechaDerecha = '▶';
const instruccionesKeys1 = 'TECLAS:';
const instruccionesKeys2 = 'ADWS Verbos';
const instruccionesKeys3 = 'Flechas personaje';
const instruccionesKeys4 = 'ENTER accion';
const instruccionesKeysNext = 'PULSA ENTER O ESPACIO PARA COMENZAR';


// Cabezaas de los personajes
const cabezaAndreu = loadImage('assets/maniac_cabeza_andreu.png');
const cabezaJesus = loadImage('assets/maniac_cabeza_jesus.png');

// Habitaciones
const maniacRoomInicial = loadImage('assets/maniac_room_inicial.jpg');
const maniacRoomInicialArmarioAbierta = loadImage('assets/maniac_room_inicial_abierta_armario.png');
const maniacRoomInicialPuertaAbierta = loadImage('assets/maniac_room_inicial_abierta_puerta.png');
const maniacRoomPasillo = loadImage('assets/maniac_room_pasillo4.jpg');
const maniacRoomPasilloPuertaAbierta1 = loadImage('assets/maniac_room_pasillo4_abierta1.png');
const maniacRoomPasilloPuertaAbierta2 = loadImage('assets/maniac_room_pasillo4_abierta2.png');
const maniacRoomPasilloPuertaAbierta3 = loadImage('assets/maniac_room_pasillo4_abierta3.png');
const maniacRoomPasilloPuertaAbierta4 = loadImage('assets/maniac_room_pasillo4_abierta4.png');
const maniacRoomCocina = loadImage('assets/maniac_room_cocina.jpg');
const maniacRoomCocinaPuertaAbierta = loadImage('assets/maniac_room_cocina_abierta_puerta.png');
const maniacRoomDormitorio = loadImage('assets/maniac_room_dormitorio.jpg');
const maniacRoomDormitorioPuertaAbierta = loadImage('assets/maniac_room_dormitorio_abierta_puerta.png');
const maniacRoomIngenieria = loadImage('assets/maniac_room_ingenieria.jpg');
const maniacRoomIngenieriaPuertaAbierta = loadImage('assets/maniac_room_ingenieria_abierta_puerta.png');


// Los dos personajes utilizan provisionalmente el mismo retrato.
const maniacCharacters = [
    { name: 'JESUS' },
    { name: 'ANDREU' }
];

let maniacSelectedCharacter = 0;
let maniacSelectionFrame = 0;




// ============================================================
// DECORACIÓN DEL FONDO: ÁRBOL Y MANSIÓN
// ============================================================
function drawManiacTree(x, y) {
    const C = MANIAC_COLORS;

    // Tronco
    ctx.fillStyle = C.granate;
    ctx.fillRect(x + 35, y + 65, 30, 145);
    ctx.fillRect(x + 20, y + 105, 20, 65);
    ctx.fillRect(x + 60, y + 85, 25, 55);

    // Sombra del tronco
    ctx.fillStyle = C.negro;
    ctx.fillRect(x + 52, y + 70, 13, 135);

    // Ramas principales
    ctx.fillStyle = C.granate;
    ctx.fillRect(x + 38, y + 65, 12, 75);
    ctx.fillRect(x + 5, y + 45, 45, 12);
    ctx.fillRect(x - 5, y + 20, 15, 35);

    ctx.fillRect(x + 55, y + 75, 12, 60);
    ctx.fillRect(x + 60, y + 65, 55, 12);
    ctx.fillRect(x + 105, y + 35, 12, 42);

    // Ramas secundarias
    ctx.fillStyle = C.rojo;
    ctx.fillRect(x - 10, y + 12, 12, 25);
    ctx.fillRect(x + 5, y + 38, 35, 8);
    ctx.fillRect(x + 100, y + 25, 12, 35);
    ctx.fillRect(x + 70, y + 58, 35, 8);

    // Raíces
    ctx.fillStyle = C.granate;
    ctx.fillRect(x + 5, y + 195, 30, 10);
    ctx.fillRect(x - 5, y + 205, 35, 8);
    ctx.fillRect(x + 60, y + 195, 35, 10);
    ctx.fillRect(x + 75, y + 205, 30, 8);

    // Pequeñas hojas
    ctx.fillStyle = C.verde;
    ctx.fillRect(x - 15, y + 5, 18, 12);
    ctx.fillRect(x + 110, y + 12, 16, 12);
    ctx.fillRect(x + 88, y + 48, 15, 10);
}


// ------------------------------------------------------------
// LUNA
// ------------------------------------------------------------
function drawManiacMoon(x, y) {
    const C = MANIAC_COLORS;

    ctx.fillStyle = C.amarillo;
    ctx.fillRect(x + 15, y, 40, 10);
    ctx.fillRect(x, y + 10, 70, 45);
    ctx.fillRect(x + 10, y + 55, 50, 12);

    // Sombra para darle forma pixelada
    ctx.fillStyle = C.oliva;
    ctx.fillRect(x + 45, y + 10, 15, 10);
    ctx.fillRect(x + 50, y + 25, 12, 12);
    ctx.fillRect(x + 35, y + 45, 15, 10);

    // Cráteres
    ctx.fillStyle = C.granate;
    ctx.fillRect(x + 18, y + 20, 9, 8);
    ctx.fillRect(x + 40, y + 35, 8, 8);
}


// ------------------------------------------------------------
// MANSIÓN ENCANTADA
// ------------------------------------------------------------
function drawManiacHouse(x, y) {
    const C = MANIAC_COLORS;

    // Sombra
    ctx.fillStyle = C.negro;
    ctx.fillRect(x - 12, y + 75, 205, 150);

    // Cuerpo principal
    ctx.fillStyle = C.azulOscuro;
    ctx.fillRect(x, y + 75, 180, 140);

    // Torre izquierda
    ctx.fillRect(x + 10, y + 35, 55, 180);

    // Torre derecha
    ctx.fillRect(x + 115, y + 20, 55, 195);

    // Tejado central
    ctx.fillStyle = C.azul;
    ctx.fillRect(x - 10, y + 65, 200, 18);
    ctx.fillRect(x + 20, y + 45, 150, 20);

    // Picos de tejado
    ctx.fillStyle = C.negro;
    ctx.fillRect(x + 5, y + 30, 12, 35);
    ctx.fillRect(x + 150, y + 10, 12, 55);

    ctx.fillStyle = C.azul;
    ctx.fillRect(x + 15, y + 30, 12, 35);
    ctx.fillRect(x + 140, y + 10, 12, 55);

    // Chimenea
    ctx.fillStyle = C.gris;
    ctx.fillRect(x + 78, y + 38, 20, 35);
    ctx.fillStyle = C.grisClaro;
    ctx.fillRect(x + 74, y + 35, 28, 7);

    // Ventanas iluminadas
    drawManiacWindow(x + 22, y + 92);
    drawManiacWindow(x + 88, y + 105);
    drawManiacWindow(x + 132, y + 78);
    drawManiacWindow(x + 132, y + 145);

    // Puerta
    ctx.fillStyle = C.negro;
    ctx.fillRect(x + 72, y + 155, 38, 60);

    ctx.fillStyle = C.granate;
    ctx.fillRect(x + 78, y + 160, 26, 55);

    ctx.fillStyle = C.amarillo;
    ctx.fillRect(x + 97, y + 187, 5, 5);

    // Base
    ctx.fillStyle = C.negro;
    ctx.fillRect(x - 5, y + 215, 190, 8);
}


// ------------------------------------------------------------
// VENTANAS
// ------------------------------------------------------------
function drawManiacWindow(x, y) {
    const C = MANIAC_COLORS;

    ctx.fillStyle = C.negro;
    ctx.fillRect(x - 3, y - 3, 27, 35);

    ctx.fillStyle = C.amarillo;
    ctx.fillRect(x, y, 21, 29);

    // Cruz de la ventana
    ctx.fillStyle = C.azulOscuro;
    ctx.fillRect(x + 9, y, 3, 29);
    ctx.fillRect(x, y + 13, 21, 3);
}


// ------------------------------------------------------------
// FONDO COMPLETO
// ------------------------------------------------------------
function drawManiacBackground() {
    const C = MANIAC_COLORS;
    const w = canvas.width;
    const h = canvas.height;

    // Cielo nocturno
    ctx.fillStyle = C.negro;
    ctx.fillRect(0, 0, w, h);

    // Estrellas
    for (let i = 0; i < 65; i++) {
        const x = (i * 137 + 31) % w;
        const y = (i * 83 + 19) % 330;

        ctx.fillStyle = i % 4 === 0
            ? C.amarillo
            : C.blanco;

        ctx.fillRect(x, y, 2, 2);
    }

    // Luna detrás de la mansión
    drawManiacMoon(820, 35);

    // Árbol a la izquierda
    drawManiacTree(35, 145);

    // Mansión a la derecha
    drawManiacHouse(790, 75);

    // Suelo
    ctx.fillStyle = C.azulOscuro;
    ctx.fillRect(0, 355, w, 70);

    ctx.fillStyle = C.azul;
    ctx.fillRect(0, 355, w, 6);

    // Hierba pixelada
    ctx.fillStyle = C.verde;
    for (let i = 0; i < 75; i++) {
        const x = (i * 83 + 17) % w;
        const y = 365 + ((i * 37) % 50);
        ctx.fillRect(x, y, 4, 8);
    }
}


// ------------------------------------------------------------
// DIBUJO DE LA PANTALLA DE SELECCIÓN
// ------------------------------------------------------------
function drawManiacEasterEgg() {
    const w = canvas.width;
    const h = canvas.height;

    maniacSelectionFrame++;

    drawManiacBackground();

    // Marco exterior.
    ctx.strokeStyle = MANIAC_COLORS.azul;
    ctx.lineWidth = 7;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    ctx.strokeStyle = MANIAC_COLORS.azulOscuro;
    ctx.lineWidth = 2;
    ctx.strokeRect(23, 23, w - 46, h - 46);

    // Título.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 54px monospace';
    ctx.fillStyle = MANIAC_COLORS.magenta;
    ctx.fillText(tituloManiacMansion, w / 2 + 3, 91 + 3);

    ctx.fillStyle = MANIAC_COLORS.amarillo;
    ctx.fillText(tituloManiacMansion, w / 2, 91);

    // Texto de presentación.
    text(eligePersonaje, w / 2, 155, 25, MANIAC_COLORS.blanco, true, 'monospace');
    text(instrucciones1, w / 2, 180, 19, MANIAC_COLORS.grisClaro, true, 'monospace');
    text(instrucciones2, w / 2, 200, 19, MANIAC_COLORS.grisClaro, true, 'monospace');

    // Retratos.
    drawManiacCharacterPortrait(0, 350, 335);
    drawManiacCharacterPortrait(1, 674, 335);

    // Flechas de selección.
    text(instruccionesFlechaIzquierda, 205, 350, 48, maniacSelectedCharacter === 0 ? MANIAC_COLORS.amarillo : MANIAC_COLORS.azul, true);
    text(instruccionesFlechaDerecha, 819, 350, 48, maniacSelectedCharacter === 1 ? MANIAC_COLORS.amarillo : MANIAC_COLORS.azul, true);

    // Instrucciones.
    ctx.fillStyle = MANIAC_COLORS.negro;
    ctx.fillRect(140, 530, 744, 34);

    ctx.strokeStyle = MANIAC_COLORS.azul;
    ctx.lineWidth = 3;
    ctx.strokeRect(140, 530, 744, 34);

    text(instruccionesKeys1, w / 2, 450, 18, MANIAC_COLORS.oliva, true, 'monospace');
    text(instruccionesKeys2, w / 2, 470, 18, MANIAC_COLORS.oliva, true, 'monospace');
    text(instruccionesKeys3, w / 2, 490, 18, MANIAC_COLORS.oliva, true, 'monospace');
    text(instruccionesKeys4, w / 2, 510, 18, MANIAC_COLORS.oliva, true, 'monospace');

    text(instruccionesKeysNext, w / 2, 550, 18, MANIAC_COLORS.blanco, true, 'monospace');
}


// ------------------------------------------------------------
// RETRATO Y NOMBRE DE CADA PERSONAJE
// ------------------------------------------------------------
function drawManiacCharacterPortrait(index, centerX, centerY) {
    const selected = index === maniacSelectedCharacter;

    const portraitW = 210;
    const portraitH = 210;

    const x = centerX - portraitW / 2;
    const y = centerY - portraitH / 2;

    const pulse = selected
        ? Math.sin(maniacSelectionFrame * 0.09) * 3
        : 0;

    // Marco exterior.
    ctx.fillStyle = MANIAC_COLORS.azulOscuro;
    ctx.fillRect(x - 7, y - 7, portraitW + 14, portraitH + 14);

    ctx.strokeStyle = selected
        ? MANIAC_COLORS.amarillo
        : MANIAC_COLORS.azul;

    ctx.lineWidth = selected ? 5 + pulse : 3;
    ctx.strokeRect(
        x - 7,
        y - 7,
        portraitW + 14,
        portraitH + 14
    );

    // Fondo azul del retrato.
    ctx.fillStyle = MANIAC_COLORS.azul;
    ctx.fillRect(x, y, portraitW, portraitH);

    // Seleccionar la imagen correspondiente.
    const portrait = index === 0
        ? cabezaJesus
        : cabezaAndreu;

    // Dibujar cabeza con fondo transparente.
    if (portrait && portrait.complete && portrait.naturalWidth > 0) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;

        // Mantener proporciones y centrar la cabeza.
        const scale = Math.min(
            (portraitW - 16) / portrait.naturalWidth,
            (portraitH - 16) / portrait.naturalHeight
        );

        const drawW = portrait.naturalWidth * scale;
        const drawH = portrait.naturalHeight * scale;

        ctx.drawImage(
            portrait,
            x + (portraitW - drawW) / 2,
            y + (portraitH - drawH) / 2,
            drawW,
            drawH
        );

        ctx.restore();
    }

    // Nombre del personaje.
    text(
        maniacCharacters[index].name,
        centerX,
        y + portraitH + 49,
        25,
        selected ? MANIAC_COLORS.amarillo : MANIAC_COLORS.blanco,
        true,
        'monospace'
    );
}


// ------------------------------------------------------------
// CONTROL DE TECLADO
// ------------------------------------------------------------
function maniacHandleKey(key) {
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
        maniacSelectedCharacter =
            maniacSelectedCharacter === 0 ? 1 : 0;

        return;
    }

    if (key === 'Enter' || key === ' ') {
        maniacStartGame();
        return;
    }

    if (key === 'Escape' || key.toLowerCase() === 'x') {
        gameState = 'MENU';
        easterEggKeySequence = [];
        easterEggLetterBuffer = '';
    }
}

// -----------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------
// INICIAR AVENTURA
// ------------------------------------------------------------
let maniacCharacterY = 250;
let maniacActionMessage = false;

let maniacConversationTimer = null;
let maniacConversationActive = false;
let maniacConversationIndex = 0;
const maniacPlayerConversation = [
    '¡Menos mal que has llegado! La nave está en peligro y necesitamos reparar el sistema de energía.',
    'Tendrás que encontrar cuatro elementos: una célula de energía, un módulo de control,',
    'un componente de plasma y un cristal de dilitio.',
    'Cuando los tengas todos, llévalos a Ingeniería.',
    'Allí podremos ensamblarlos y reparar la nave.',
    '¡Date prisa! No nos queda demasiado tiempo.'
];

const MANIAC_MOVEMENT_SPEED = 3;

const MANIAC_ROOM_LIMITS = {
    minX: 55,
    maxX: 970,
    minY: 85,
    maxY: 285
};

function maniacStartPlayerConversation() {
    // Evitar iniciar otra conversación mientras esta continúa.
    if (maniacConversationActive) {
        return;
    }

    maniacConversationActive = true;
    maniacConversationIndex = 0;

    function showNextMessage() {
        if (maniacConversationIndex >= maniacPlayerConversation.length) {
            maniacConversationActive = false;
            maniacConversationTimer = null;
            maniacActionMessage = false;
            return;
        }

        const otherPlayer = maniacCharacters.find(
            character => character.name !== maniacPlayer.name
        );

        maniacMessage =
            `${otherPlayer.name}: ${maniacPlayerConversation[maniacConversationIndex]}`;

        maniacActionMessage = true;

        maniacConversationIndex++;

        maniacConversationTimer = setTimeout(showNextMessage, 2000);
    }

    showNextMessage();
}

function maniacStartGame() {
    // Reiniciamos el estado de la aventura.
    maniacInventory = [];

    maniacSelectedVerb = 0;
    maniacSelectedObject = 0;
    maniacSelectingObject = false;

    maniacMessage = 'Estás en una habitación desconocida. Busca una salida.';
    maniacCharacterX = 490;
    maniacCharacterY = 250;

    maniacCurrentRoom = 'Room1';

    // Recuperamos el personaje seleccionado en la pantalla inicial.
    maniacPlayer = maniacCharacters[maniacSelectedCharacter];

    // Reiniciamos los estados de las habitaciones.
    Object.values(maniacRooms).forEach(room => {
        if (room.reset) {
            room.reset();
        }
    });

    gameState = 'MANIAC_ROOM';
}

// ------------------------------------------------------------
// MOVIMIENTO DEL PERSONAJE
// ------------------------------------------------------------
function updateManiacCharacterMovement() {

    if (maniacSelectingObject) {
        return;
    }

    // Si el personaje empieza a moverse, volver al mensaje de proximidad.
    if (
        maniacKeysPressed.has('ArrowLeft') ||
        maniacKeysPressed.has('ArrowRight') ||
        maniacKeysPressed.has('ArrowUp') ||
        maniacKeysPressed.has('ArrowDown')
    ) {
        maniacActionMessage = false;
    }

    let dx = 0;
    let dy = 0;

    if (maniacKeysPressed.has('ArrowLeft')) {
        dx--;
    }

    if (maniacKeysPressed.has('ArrowRight')) {
        dx++;
    }

    if (maniacKeysPressed.has('ArrowUp')) {
        dy--;
    }

    if (maniacKeysPressed.has('ArrowDown')) {
        dy++;
    }

    // Evitar que el movimiento diagonal sea más rápido.
    if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2);
        dx *= factor;
        dy *= factor;
    }

    maniacCharacterX += dx * MANIAC_MOVEMENT_SPEED;
    maniacCharacterY += dy * MANIAC_MOVEMENT_SPEED;

    // Límites de la habitación.
    maniacCharacterX = Math.max(
        MANIAC_ROOM_LIMITS.minX,
        Math.min(MANIAC_ROOM_LIMITS.maxX, maniacCharacterX)
    );

    maniacCharacterY = Math.max(
        MANIAC_ROOM_LIMITS.minY,
        Math.min(MANIAC_ROOM_LIMITS.maxY, maniacCharacterY)
    );
}


// ============================================================
// MANIAC MANSION - MOTOR DE HABITACIONES
// ============================================================


// ------------------------------------------------------------
// CONFIGURACIÓN GENERAL
// ------------------------------------------------------------
const MANIAC_VERBS = [
    'MIRAR',
    'COGER',
    'ABRIR',
    'CERRAR',
    'USAR',
    'HABLAR',
    'EMPUJAR',
    'TIRAR'
];


// Estado general de la aventura.
// Estos datos son comunes a todas las habitaciones.

let maniacCurrentRoom = 'Room1';

let maniacInventory = [];

let maniacSelectedVerb = 0;
let maniacSelectedObject = 0;

let maniacSelectingObject = false;

let maniacMessage = '';

let maniacCharacterX = 490;

let maniacPlayer = null;

let maniacNearbyObject = null;

const MANIAC_INTERACTION_DISTANCE = 75;


function maniacText(str, x, y, size = 16, color = '#fff', bold = false, align = 'center', font = GAME_FONT) {
    ctx.fillStyle = color;
    ctx.font = `${bold ? 'bold ' : ''}${size}px ${font}`;
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
}


// ------------------------------------------------------------
// DEFINICIÓN DE LAS HABITACIONES
// ------------------------------------------------------------
//
// Cada habitación define:
//
// - Su identificador.
// - Su nombre.
// - El fondo que utiliza.
// - Los objetos que contiene.
// - El estado propio de esa habitación.
//
// Las funciones de dibujo y de interacción son comunes.
//
// Para añadir otra habitación bastará con añadir otra
// definición dentro de maniacRooms.
// ------------------------------------------------------------
const maniacRooms = {

    // ------------------------------------------------------------
    // HABITACIÓN 1: HABITACIÓN INICIAL
    // ------------------------------------------------------------
    Room1: {
        id: 'Room1',
        name: 'Habitación inicial',
        background: 'inicial',

        state: {
            bookOpen: false,
            keyTaken: false,
            cabinetOpen: false,
            energyCellTaken: false
        },

        objects: [
            {
                id: 'door',
                name: 'PUERTA',
                destination: 'Room2',
                state: {
                    open: false
                },
                imagenAbierta: maniacRoomInicialPuertaAbierta,
                x: 845,
                y: 85,
                w: 145,
                h: 245,
                visible: true,
                actions: {
                    MIRAR: 'door_look',
                    ABRIR: 'door_open',
                    CERRAR: 'door_close',
                    USAR: 'door_use',
                    EMPUJAR: 'door_push'
                }
            },
            {
                id: 'cabinet',
                name: 'ARMARIO',
                x: 630,
                y: 85,
                w: 105,
                h: 205,
                visible: true,
                actions: {
                    MIRAR: 'cabinet_look',
                    ABRIR: 'cabinet_open',
                    CERRAR: 'cabinet_close',
                    USAR: 'cabinet_use'
                }
            },
            {
                id: 'energyCell',
                name: 'CÉLULA DE ENERGÍA',
                x: 660,
                y: 170,
                w: 42,
                h: 20,
                visible: false,
                actions: {
                    MIRAR: 'energyCell_look',
                    COGER: 'energyCell_take'
                }
            },
            {
                id: 'book',
                name: 'LIBRO',
                x: 245,
                y: 195,
                w: 65,
                h: 27,
                visible: true,
                actions: {
                    MIRAR: 'book_look',
                    COGER: 'book_take',
                    ABRIR: 'book_open',
                    CERRAR: 'book_close'
                }
            },
            {
                id: 'table',
                name: 'MESA',
                x: 145,
                y: 195,
                w: 200,
                h: 105,
                visible: true,
                actions: {
                    MIRAR: 'table_look',
                    COGER: 'table_take',
                    EMPUJAR: 'table_push',
                    TIRAR: 'table_pull'
                }
            },
            {
                id: 'key',
                name: 'LLAVE',
                x: 265,
                y: 195,
                w: 24,
                h: 15,
                visible: false,
                actions: {
                    MIRAR: 'key_look',
                    COGER: 'key_take'
                }
            }
        ],

        reset() {
            this.state.bookOpen = false;
            this.state.keyTaken = false;
            this.state.cabinetOpen = false;
            this.state.energyCellTaken = false;


            const key = this.objects.find(o => o.id === 'key');
            key.visible = false;

            const energyCell = this.objects.find(o => o.id === 'energyCell');
            energyCell.visible = false;

            const door = this.objects.find(o => o.id === 'door');
            door.state.open = false;
        }
    },


    // ------------------------------------------------------------
    // HABITACIÓN 2: PASILLO
    // ------------------------------------------------------------
    Room2: {
        id: 'Room2',
        name: 'Pasillo',
        background: 'pasillo',

        state: {
            controlModuleTaken: false
        },

        objects: [
            {
                id: 'door_back',
                name: 'PUERTA',
                destination: 'Room1',
                state: {
                    open: false
                },
                imagenAbierta: maniacRoomPasilloPuertaAbierta1,
                x: 275,
                y: 115,
                w: 90,
                h: 165,
                visible: true,
                actions: {
                    MIRAR: 'door_look',
                    ABRIR: 'door_open',
                    CERRAR: 'door_close',
                    USAR: 'door_use'
                }
            },
            {
                id: 'door_cocina',
                name: 'PUERTA',
                destination: 'Room3',
                state: {
                    open: false
                },
                imagenAbierta: maniacRoomPasilloPuertaAbierta2,
                x: 445,
                y: 115,
                w: 90,
                h: 165,
                visible: true,
                actions: {
                    MIRAR: 'door_look',
                    ABRIR: 'door_open',
                    CERRAR: 'door_close',
                    USAR: 'door_use'
                }
            },
            {
                id: 'door_dormitorio',
                name: 'PUERTA',
                destination: 'Room4',
                state: {
                    open: false
                },
                imagenAbierta: maniacRoomPasilloPuertaAbierta3,
                x: 650,
                y: 115,
                w: 90,
                h: 165,
                visible: true,
                actions: {
                    MIRAR: 'door_look',
                    ABRIR: 'door_open',
                    CERRAR: 'door_close',
                    USAR: 'door_use'
                }
            },
            {
                id: 'door_ingenieria',
                name: 'PUERTA',
                destination: 'Room5',
                state: {
                    open: false
                },
                imagenAbierta: maniacRoomPasilloPuertaAbierta4,
                x: 865,
                y: 115,
                w: 90,
                h: 165,
                visible: true,
                actions: {
                    MIRAR: 'door_look',
                    ABRIR: 'door_open',
                    CERRAR: 'door_close',
                    USAR: 'door_use'
                }
            },
            {
                id: 'controlModule',
                name: 'MÓDULO DE CONTROL',
                x: 100,
                y: 250,
                w: 50,
                h: 50,
                visible: true,
                actions: {
                    MIRAR: 'controlModule_look',
                    COGER: 'controlModule_take'
                }
            }
        ],

        reset() {
            this.state.controlModuleTaken = false;

            this.objects.forEach(object => {
                if (object.id.startsWith('door')) {
                    object.state.open = false;
                }
            });

            const module = this.objects.find(o => o.id === 'controlModule');
            module.visible = true;
        }
    },


    // ------------------------------------------------------------
    // HABITACIÓN 3: COCINA
    // ------------------------------------------------------------
    Room3: {
        id: 'Room3',
        name: 'Cocina',
        background: 'cocina',

        state: {
            plasmaComponentTaken: false
        },

        objects: [
            {
                id: 'door',
                name: 'PUERTA',
                destination: 'Room2',
                state: {
                    open: false
                },
                imagenAbierta: maniacRoomCocinaPuertaAbierta,
                x: 875,
                y: 85,
                w: 145,
                h: 245,
                visible: true,
                actions: {
                    MIRAR: 'door_look',
                    ABRIR: 'door_open',
                    CERRAR: 'door_close',
                    USAR: 'door_use',
                    EMPUJAR: 'door_push'
                }
            },
            {
                id: 'plasmaComponent',
                name: 'COMPONENTE DE PLASMA',
                x: 100,
                y: 180,
                w: 40,
                h: 40,
                visible: true,
                actions: {
                    MIRAR: 'plasmaComponent_look',
                    COGER: 'plasmaComponent_take'
                }
            },
            {
                id: 'otherPlayer',
                name: 'PLAYER2',
                x: 250,
                y: 250,
                w: 45,
                h: 80,
                visible: true,
                actions: {
                    MIRAR: 'player_look',
                    HABLAR: 'player_talk'
                }
            }
        ],

        reset() {
            this.state.plasmaComponentTaken = false;

            const component = this.objects.find(o => o.id === 'plasmaComponent');
            component.visible = true;

            const door = this.objects.find(o => o.id === 'door');
            door.state.open = false;
        }
    },


    // ------------------------------------------------------------
    // HABITACIÓN 4: DORMITORIO
    // ------------------------------------------------------------
    Room4: {
        id: 'Room4',
        name: 'Dormitorio',
        background: 'dormitorio',

        state: {
            dilithiumCrystalTaken: false
        },

        objects: [
            {
                id: 'door',
                name: 'PUERTA',
                destination: 'Room2',
                state: {
                    open: false
                },
                imagenAbierta: maniacRoomDormitorioPuertaAbierta,
                x: 765,
                y: 105,
                w: 145,
                h: 245,
                visible: true,
                actions: {
                    MIRAR: 'door_look',
                    ABRIR: 'door_open',
                    CERRAR: 'door_close',
                    USAR: 'door_use',
                    EMPUJAR: 'door_push'
                }
            },
            {
                id: 'dilithiumCrystal',
                name: 'CRISTAL DE DILITIO',
                x: 140,
                y: 200,
                w: 40,
                h: 40,
                visible: true,
                actions: {
                    MIRAR: 'dilithiumCrystal_look',
                    COGER: 'dilithiumCrystal_take'
                }
            }
        ],

        reset() {
            this.state.dilithiumCrystalTaken = false;

            const crystal = this.objects.find(o => o.id === 'dilithiumCrystal');
            crystal.visible = true;

            const door = this.objects.find(o => o.id === 'door');
            door.state.open = false;
        }
    },


    // ------------------------------------------------------------
    // HABITACIÓN 5: INGENIERÍA
    // ------------------------------------------------------------
    Room5: {
        id: 'Room5',
        name: 'Ingeniería',
        background: 'ingenieria',

        state: {
            consoleUsed: false
        },

        objects: [
            {
                id: 'door',
                name: 'PUERTA',
                destination: 'Room2',
                state: {
                    open: false
                },
                imagenAbierta: maniacRoomIngenieriaPuertaAbierta,
                x: 725,
                y: 85,
                w: 145,
                h: 245,
                visible: true,
                actions: {
                    MIRAR: 'door_look',
                    ABRIR: 'door_open',
                    CERRAR: 'door_close',
                    USAR: 'door_use',
                    EMPUJAR: 'door_push'
                }
            },
            {
                id: 'assemblyConsole',
                name: 'CONSOLA DE MONTAJE',
                x: 500,
                y: 200,
                w: 140,
                h: 80,
                visible: true,
                actions: {
                    MIRAR: 'assemblyConsole_look',
                    USAR: 'assemblyConsole_use'
                }
            },
            {
                id: 'engineer',
                name: 'INGENIERO',
                x: 130,
                y: 220,
                w: 45,
                h: 80,
                visible: true,
                actions: {
                    MIRAR: 'engineer_look',
                    HABLAR: 'engineer_talk'
                }
            }
        ],

        reset() {
            this.state.consoleUsed = false;

            const door = this.objects.find(o => o.id === 'door');
            door.state.open = false;
        }
    }

};


// ------------------------------------------------------------
// DETECTAR OBJETO CERCANO
// ------------------------------------------------------------
function updateManiacNearbyObject() {
    const room = maniacGetCurrentRoom();
    maniacNearbyObject = null;

    if (!room) return;

    // Dar prioridad a la célula de energía si está visible y al alcance.
    const energyCell = room.objects.find(
        object => object.id === 'energyCell' && object.visible
    );

    if (energyCell) {
        const nearestX = Math.max(
            energyCell.x,
            Math.min(maniacCharacterX, energyCell.x + energyCell.w)
        );

        const nearestY = Math.max(
            energyCell.y,
            Math.min(maniacCharacterY, energyCell.y + energyCell.h)
        );

        const dx = maniacCharacterX - nearestX;
        const dy = maniacCharacterY - nearestY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MANIAC_INTERACTION_DISTANCE) {
            maniacNearbyObject = energyCell;
            return;
        }
    }

    let nearestDistance = MANIAC_INTERACTION_DISTANCE;
    let nearestArea = Infinity;

    room.objects.forEach(object => {
        if (!object.visible) return;

        const nearestX = Math.max(
            object.x,
            Math.min(maniacCharacterX, object.x + object.w)
        );

        const nearestY = Math.max(
            object.y,
            Math.min(maniacCharacterY, object.y + object.h)
        );

        const dx = maniacCharacterX - nearestX;
        const dy = maniacCharacterY - nearestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const area = object.w * object.h;

        if (
            distance < nearestDistance ||
            (distance === nearestDistance && area < nearestArea)
        ) {
            nearestDistance = distance;
            nearestArea = area;
            maniacNearbyObject = object;
        }
    });
}

// ------------------------------------------------------------
// ACCESO A LA HABITACIÓN ACTUAL
// ------------------------------------------------------------
function maniacGetCurrentRoom() {
    return maniacRooms[maniacCurrentRoom] || null;
}


function maniacGoToRoom(roomId) {
    if (!maniacRooms[roomId]) {
        console.warn('Habitación inexistente:', roomId);
        return;
    }

    maniacCurrentRoom = roomId;

    maniacSelectedObject = 0;
    maniacSelectingObject = false;

    maniacMessage = maniacRooms[roomId].name;
}


// ------------------------------------------------------------
// MARCO COMÚN DE TODAS LAS HABITACIONES
// ------------------------------------------------------------
function drawManiacGameFrame() {
    const C = MANIAC_COLORS;

    // Fondo general.
    ctx.fillStyle = C.negro;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Marco exterior.
    ctx.strokeStyle = C.azul;
    ctx.lineWidth = 5;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // Zona del escenario.
    ctx.fillStyle = C.azulOscuro;
    ctx.fillRect(20, 20, 984, 310);

    ctx.strokeStyle = C.cian;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 984, 310);

    // Zona del mensaje.
    ctx.fillStyle = C.negro;
    ctx.fillRect(20, 338, 984, 42);

    ctx.strokeStyle = C.azul;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 338, 984, 42);

    // Zona de verbos.
    ctx.fillStyle = C.azulOscuro;
    ctx.fillRect(20, 388, 620, 166);

    ctx.strokeStyle = C.azul;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 388, 620, 166);

    // Zona de inventario.
    ctx.fillStyle = C.azulOscuro;
    ctx.fillRect(650, 388, 354, 166);

    ctx.strokeStyle = C.azul;
    ctx.lineWidth = 3;
    ctx.strokeRect(650, 388, 354, 166);

    // Títulos.
    text('ACCIONES', 330, 404, 16, C.amarillo, true, 'monospace');
    text('INVENTARIO', 827, 404, 16, C.amarillo, true, 'monospace');
}


// ------------------------------------------------------------
// DIBUJO GENERAL DE LA HABITACIÓN
// ------------------------------------------------------------
function drawManiacRoom() {
    const room = maniacGetCurrentRoom();

    if (!room) {
        console.error('No se encuentra la habitación:', maniacCurrentRoom);
        return;
    }

    //console.log('Habitación:', room.id);
    //console.log('Protagonista:', maniacCharacterX, maniacCharacterY);

    if (room.id === 'Room4') {
        const otherPlayer = room.objects.find(o => o.id === 'otherPlayer');
        //console.log('Segundo personaje:', otherPlayer);
    }

    // Actualizar movimiento del personaje.
    updateManiacCharacterMovement();

    // 1. Dibujamos el marco y los paneles comunes.
    drawManiacGameFrame();

    // 2. Dibujamos el escenario concreto de la habitación.
    drawManiacRoomBackground(room);

    // 3. Dibujamos sus objetos.
    drawManiacRoomObjects(room);

    // 4. Dibujamos el personaje.
    drawManiacRoomCharacter();

    // 5. Detectamos los objetos cercanos.
    updateManiacNearbyObject();

    // 6. Dibujamos los elementos de interfaz.
    drawManiacRoomMessage();
    drawManiacRoomVerbs();
    drawManiacRoomInventory();
}


// ------------------------------------------------------------
// FONDOS DE LAS HABITACIONES
// ------------------------------------------------------------
function drawManiacRoomBackground(room) {

    let background = null;

    switch (room.background) {

        case 'inicial':
            background = maniacRoomInicial;
            break;

        case 'pasillo':
            background = maniacRoomPasillo;
            break;

        case 'cocina':
            background = maniacRoomCocina;
            break;

        case 'dormitorio':
            background = maniacRoomDormitorio;
            break;

        case 'ingenieria':
            background = maniacRoomIngenieria;
            break;
    }

    if (!background) {
        console.error('No se ha definido el fondo:', room.background);
        return;
    }

    if (!background.complete || background.naturalWidth === 0) {
        console.warn('La imagen todavía no está cargada:', room.background);
        return;
    }

    ctx.drawImage(
        background,
        24,
        24,
        976,
        302
    );
}


// ------------------------------------------------------------
// FONDO: DORMITORIO
// ------------------------------------------------------------
function drawManiacBedroomBackground() {
    const C = MANIAC_COLORS;

    // Pared.
    ctx.fillStyle = C.gris;
    ctx.fillRect(24, 24, 976, 302);

    // Franja superior.
    ctx.fillStyle = C.grisClaro;
    ctx.fillRect(24, 24, 976, 12);

    // Suelo.
    ctx.fillStyle = C.granate;
    ctx.fillRect(24, 280, 976, 46);

    // Separación pared/suelo.
    ctx.fillStyle = C.negro;
    ctx.fillRect(24, 278, 976, 4);

    // Baldosas.
    ctx.strokeStyle = C.gris;
    ctx.lineWidth = 2;

    for (let x = 24; x < 1000; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 282);
        ctx.lineTo(x, 326);
        ctx.stroke();
    }

    // Ventana.
    ctx.fillStyle = C.negro;
    ctx.fillRect(480, 65, 150, 125);

    ctx.fillStyle = C.azulOscuro;
    ctx.fillRect(486, 71, 138, 113);

    ctx.fillStyle = C.azul;
    ctx.fillRect(492, 77, 126, 101);

    // Cristales.
    ctx.fillStyle = C.amarillo;
    ctx.fillRect(510, 95, 12, 12);
    ctx.fillRect(575, 125, 10, 10);

    // Marco de ventana.
    ctx.fillStyle = C.granate;
    ctx.fillRect(550, 71, 7, 113);
    ctx.fillRect(486, 125, 138, 7);

    // Cortinas.
    ctx.fillStyle = C.granate;
    ctx.fillRect(465, 55, 18, 145);
    ctx.fillRect(630, 55, 18, 145);

    // Cuadro.
    ctx.fillStyle = C.negro;
    ctx.fillRect(700, 65, 75, 85);

    ctx.fillStyle = C.granate;
    ctx.fillRect(706, 71, 63, 73);

    ctx.fillStyle = C.amarillo;
    ctx.fillRect(730, 85, 15, 15);
    ctx.fillRect(720, 110, 35, 5);
}


// ------------------------------------------------------------
// DIBUJO DE LOS OBJETOS DE UNA HABITACIÓN
// ------------------------------------------------------------
function drawManiacRoomObjects(room) {

    room.objects.forEach(object => {

        if (!object.visible) {
            return;
        }

        maniacDrawObject(room, object);
    });
}


// ------------------------------------------------------------
// DIBUJO GENÉRICO DE OBJETOS
// ------------------------------------------------------------
//
// El motor recibe el objeto y decide qué dibujo corresponde.
// Los datos de posición y estado pertenecen a cada habitación.
// ------------------------------------------------------------
function maniacDrawObject(room, object) {

    switch (object.id) {

        case 'cabinet':
            drawManiacCabinet(room, object);
            break;

        case 'table':
            //drawManiacTable(object); // TODO -- REMOVE -- No se necesita pintar, está integrado en el fondo
            break;

        case 'book':
            drawManiacBook(room, object);
            break;

        case 'key':
            drawManiacKey(object);
            break;

        case 'energyCell':
            drawManiacEnergyCell(object);
            break;

        // Puerta de la habitación inicial y de las demás salas.
        case 'door':
        // Las tres puertas del pasillo.
        case 'door_back':
        case 'door_cocina':
        case 'door_dormitorio':
        case 'door_ingenieria':
            drawManiacDoor(room, object);
            break;

        case 'controlModule':
            drawManiacControlModule(object)
            break;

        case 'plasmaComponent':
            drawManiacPlasmaComponent(object)
            break;

        case 'dilithiumCrystal':
            drawManiacDilithiumCrystal(object)
            break;
        case 'assemblyConsole':
            drawManiacAssemblyConsole(object)
            break;
        case 'engineer':
            drawManiacEngineer(object);
            break;
        case 'otherPlayer':
            drawManiacOtherPlayer(object);
            break;
    }
}


// TODO -- REMOVE
// ------------------------------------------------------------
// ARMARIO
// ------------------------------------------------------------
function drawManiacCabinet(room, object) {
    const C = MANIAC_COLORS;
    const x = object.x;
    const y = object.y;

    // Armario abierto de la habitación inicial.
    if (room.id === 'Room1' && room.state.cabinetOpen) {
        const img = maniacRoomInicialArmarioAbierta;

        if (img && img.complete) {
            ctx.drawImage(img, 24, 24, 976, 302);
        }

        return;
    }

/*    // Armario cerrado: dibujo Canvas.
    ctx.fillStyle = C.granate;
    ctx.fillRect(x, y, 160, 145);

    ctx.fillStyle = C.negro;
    ctx.fillRect(x + 10, y + 10, 140, 125);

    ctx.fillStyle = C.rojo;
    ctx.fillRect(x + 15, y + 15, 55, 115);
    ctx.fillRect(x + 90, y + 15, 55, 115);

    ctx.fillStyle = C.amarillo;
    ctx.fillRect(x + 60, y + 65, 5, 10);
    ctx.fillRect(x + 90, y + 65, 5, 10);*/
}

// ------------------------------------------------------------
// INGENIERO
// ------------------------------------------------------------
function drawManiacEngineer(object) {
    const x = object.x;
    const y = object.y;
    const w = object.w;
    const h = object.h;

/*    // Cuerpo
    ctx.fillStyle = '#b8b8b8';
    ctx.fillRect(x + 8, y + 30, w - 16, h - 30);

    // Cabeza
    ctx.fillStyle = '#e0b58c';
    ctx.fillRect(x + 10, y + 2, w - 20, 28);

    // Pelo
    ctx.fillStyle = '#555555';
    ctx.fillRect(x + 10, y + 2, w - 20, 7);

    // Ojos
    ctx.fillStyle = '#222222';
    ctx.fillRect(x + 17, y + 13, 4, 4);
    ctx.fillRect(x + 27, y + 13, 4, 4);

    // Uniforme
    ctx.fillStyle = '#b8b8b8';
    ctx.fillRect(x + 8, y + 30, w - 16, h - 30);

    // Insignia
    ctx.fillStyle = '#f5d442';
    ctx.fillRect(x + 19, y + 38, 8, 8);

    // Piernas
    ctx.fillStyle = '#444444';
    ctx.fillRect(x + 10, y + h - 12, 10, 12);
    ctx.fillRect(x + 25, y + h - 12, 10, 12);*/

    // Colores
    const skin = '#e0b58c';
    const hair = '#555555';
    const uniform = '#b8b8b8';
    const uniformShadow = '#929292';
    const pants = '#444444';
    const boots = '#292929';

    // Piernas
    ctx.fillStyle = pants;
    ctx.fillRect(x + 12, y + h - 25, 9, 17);
    ctx.fillRect(x + 25, y + h - 25, 9, 17);

    // Botas
    ctx.fillStyle = boots;
    ctx.fillRect(x + 10, y + h - 8, 11, 8);
    ctx.fillRect(x + 25, y + h - 8, 11, 8);

    // Brazos
    ctx.fillStyle = uniformShadow;
    ctx.fillRect(x + 3, y + 34, 8, 25);
    ctx.fillRect(x + w - 11, y + 34, 8, 25);

    // Manos
    ctx.fillStyle = skin;
    ctx.fillRect(x + 3, y + 57, 8, 6);
    ctx.fillRect(x + w - 11, y + 57, 8, 6);

    // Cuerpo: hombros y cintura
    ctx.fillStyle = uniform;
    ctx.fillRect(x + 9, y + 31, w - 18, h - 56);
    ctx.fillRect(x + 6, y + 34, w - 12, 13);

    // Cuello
    ctx.fillStyle = skin;
    ctx.fillRect(x + 18, y + 25, 9, 9);

    // Cabeza
    ctx.fillStyle = skin;
    ctx.fillRect(x + 10, y + 5, w - 20, 25);
    ctx.fillRect(x + 7, y + 12, 3, 10);
    ctx.fillRect(x + w - 10, y + 12, 3, 10);

    // Pelo
    ctx.fillStyle = hair;
    ctx.fillRect(x + 10, y + 4, w - 20, 6);
    ctx.fillRect(x + 10, y + 9, 3, 5);
    ctx.fillRect(x + w - 13, y + 9, 3, 5);

    // Ojos
    ctx.fillStyle = '#222222';
    ctx.fillRect(x + 16, y + 15, 3, 3);
    ctx.fillRect(x + 27, y + 15, 3, 3);

    // Boca
    ctx.fillStyle = '#995f50';
    ctx.fillRect(x + 19, y + 24, 8, 2);

    // Detalle del uniforme
    ctx.fillStyle = uniformShadow;
    ctx.fillRect(x + 21, y + 35, 2, h - 65);

    // Pin de la Flota Estelar: parte superior izquierda del pecho
    ctx.fillStyle = '#d9a91d';
    ctx.fillRect(x + w - 19, y + 36, 7, 10);

    // Centro del pin
    ctx.fillStyle = '#fff0a0';
    ctx.fillRect(x + w - 17, y + 38, 3, 5);

    // Pequeña punta inferior del emblema
    ctx.fillStyle = '#d9a91d';
    ctx.fillRect(x + w - 18, y + 46, 5, 2);
}

// ------------------------------------------------------------
// EL OTRO PERSONAJE QUE NO SE HA SELECCIONADO
// ------------------------------------------------------------
// ------------------------------------------------------------
// PERSONAJE PROVISIONAL - AVENTURERO 8 BITS
// ------------------------------------------------------------
function drawManiacOtherPlayer(object) {

    const C = MANIAC_COLORS;

    const x = object.x;
    const y = object.y;

    // Sombra bajo los pies.
    ctx.fillStyle = C.negro;
    ctx.fillRect(x - 20, y + 34, 40, 5);

    // Botas.
    ctx.fillStyle = '#29202B';
    ctx.fillRect(x - 17, y + 25, 14, 12);
    ctx.fillRect(x + 3, y + 25, 14, 12);

    ctx.fillStyle = '#777078';
    ctx.fillRect(x - 17, y + 32, 14, 4);
    ctx.fillRect(x + 3, y + 32, 14, 4);

    // Piernas: pantalones.
    ctx.fillStyle = '#303D70';
    ctx.fillRect(x - 14, y + 10, 11, 18);
    ctx.fillRect(x + 3, y + 10, 11, 18);

    // Cuerpo: chaqueta.
    ctx.fillStyle = '#245A9B';
    ctx.fillRect(x - 18, y - 24, 36, 38);

    // Detalles de la chaqueta.
    ctx.fillStyle = '#4385C5';
    ctx.fillRect(x - 13, y - 20, 5, 27);
    ctx.fillRect(x + 8, y - 20, 5, 27);

    // Cinturón.
    ctx.fillStyle = '#29202B';
    ctx.fillRect(x - 17, y + 8, 34, 5);

    ctx.fillStyle = '#D6B45C';
    ctx.fillRect(x - 3, y + 8, 7, 5);

    // Brazos.
    ctx.fillStyle = '#245A9B';
    ctx.fillRect(x - 26, y - 20, 9, 27);
    ctx.fillRect(x + 17, y - 20, 9, 27);

    // Manos.
    ctx.fillStyle = '#E5AD83';
    ctx.fillRect(x - 26, y + 5, 9, 8);
    ctx.fillRect(x + 17, y + 5, 9, 8);

    // Cuello.
    ctx.fillStyle = '#E5AD83';
    ctx.fillRect(x - 5, y - 30, 10, 9);

    // Cabeza.
    ctx.fillStyle = '#E5AD83';
    ctx.fillRect(x - 13, y - 51, 26, 24);

    // Orejas.
    ctx.fillRect(x - 16, y - 43, 4, 8);
    ctx.fillRect(x + 12, y - 43, 4, 8);

    // Pelo.
    if (maniacPlayer.name === 'ANDREU') {
        ctx.fillStyle = '#59351F';
        ctx.fillRect(x - 14, y - 55, 28, 9);
        ctx.fillRect(x - 14, y - 49, 5, 10);
        ctx.fillRect(x + 9, y - 49, 5, 7);
    }
    // Cejas.
    ctx.fillStyle = '#59351F';
    ctx.fillRect(x - 9, y - 42, 6, 2);
    ctx.fillRect(x + 3, y - 42, 6, 2);

    // Ojos.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 9, y - 38, 5, 5);
    ctx.fillRect(x + 4, y - 38, 5, 5);

    ctx.fillStyle = '#20202A';
    ctx.fillRect(x - 7, y - 37, 2, 4);
    ctx.fillRect(x + 6, y - 37, 2, 4);

    // Nariz.
    ctx.fillStyle = '#C88765';
    ctx.fillRect(x - 2, y - 33, 5, 4);

    // Boca.
    ctx.fillStyle = '#713E37';
    ctx.fillRect(x - 4, y - 28, 8, 2);
}


// TODO -- REMOVE
// ------------------------------------------------------------
// MESA
// ------------------------------------------------------------
function drawManiacTable(object) {
/*    const C = MANIAC_COLORS;
    const x = object.x;
    const y = object.y;

    ctx.fillStyle = C.granate;
    ctx.fillRect(x, y, 160, 16);
    ctx.fillRect(x + 15, y + 15, 12, 50);
    ctx.fillRect(x + 135, y + 15, 12, 50);*/
}


// ------------------------------------------------------------
// LIBRO
// ------------------------------------------------------------
function drawManiacBook(room, object) {
    const C = MANIAC_COLORS;
    const x = object.x;
    const y = object.y;

    if (room.state.bookOpen) {

        // Libro abierto.
        ctx.fillStyle = C.blanco;
        ctx.fillRect(x, y, 30, 25);
        ctx.fillRect(x + 31, y, 30, 25);

        ctx.fillStyle = C.gris;
        ctx.fillRect(x + 6, y + 6, 18, 2);
        ctx.fillRect(x + 6, y + 13, 18, 2);
        ctx.fillRect(x + 37, y + 6, 18, 2);
        ctx.fillRect(x + 37, y + 13, 18, 2);

    } else {

        // Libro cerrado.
        ctx.fillStyle = C.negro;
        ctx.fillRect(x, y, 65, 27);

        ctx.fillStyle = C.azulOscuro;
        ctx.fillRect(x + 3, y + 3, 59, 21);

        ctx.fillStyle = C.amarillo;
        ctx.fillRect(x + 8, y + 7, 48, 3);
    }
}


// ------------------------------------------------------------
// LLAVE
// ------------------------------------------------------------
function drawManiacKey(object) {
    const C = MANIAC_COLORS;
    const x = object.x;
    const y = object.y;

    ctx.fillStyle = C.amarillo;
    ctx.fillRect(x, y + 5, 24, 5);
    ctx.fillRect(x + 18, y, 5, 15);
    ctx.fillRect(x, y, 5, 15);
}

// ------------------------------------------------------------
// CÉLULA DE ENERGÍA DE LA FLOTA ESTELAR
// ------------------------------------------------------------
function drawManiacEnergyCell(object) {
    const C = MANIAC_COLORS;
    const x = object.x;
    const y = object.y;

    // Carcasa exterior.
    ctx.fillStyle = C.negro;
    ctx.fillRect(x, y + 3, 38, 15);
    ctx.fillRect(x + 38, y + 7, 4, 7);

    // Cuerpo metálico.
    ctx.fillStyle = C.grisClaro;
    ctx.fillRect(x + 3, y + 5, 32, 11);

    // Núcleo energético.
    ctx.fillStyle = C.azulOscuro;
    ctx.fillRect(x + 6, y + 7, 26, 7);

    ctx.fillStyle = C.cian;
    ctx.fillRect(x + 9, y + 8, 20, 5);

    // Indicadores luminosos.
    ctx.fillStyle = C.blanco;
    ctx.fillRect(x + 13, y + 9, 4, 2);
    ctx.fillRect(x + 21, y + 9, 4, 2);

    // Terminales.
    ctx.fillStyle = C.amarillo;
    ctx.fillRect(x + 2, y + 8, 3, 5);
}

// ------------------------------------------------------------
// MODULO DE CONTROL DE LA FLOTA ESTELAR
// ------------------------------------------------------------
function drawManiacControlModule(object) {
    const { x, y, w, h } = object;

    ctx.save();

    // Carcasa
    ctx.fillStyle = '#343d49';
    ctx.fillRect(x, y, w, h);

    // Borde metálico
    ctx.strokeStyle = '#aab5c2';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Pantalla
    ctx.fillStyle = '#102c36';
    ctx.fillRect(x + 7, y + 7, w - 14, h * 0.45);

    // Información de pantalla
    ctx.fillStyle = '#43e6c1';
    ctx.fillRect(x + 12, y + 13, w * 0.45, 4);
    ctx.fillRect(x + 12, y + 21, w * 0.65, 3);

    // Indicadores
    ctx.fillStyle = '#45e879';
    ctx.fillRect(x + 10, y + h * 0.65, 7, 7);

    ctx.fillStyle = '#e8c84a';
    ctx.fillRect(x + 23, y + h * 0.65, 7, 7);

    ctx.fillStyle = '#e65b5b';
    ctx.fillRect(x + 36, y + h * 0.65, 7, 7);

    ctx.restore();
}

// ------------------------------------------------------------
// COMPONENTE DE PLASMA DE LA FLOTA ESTELAR
// ------------------------------------------------------------
function drawManiacPlasmaComponent(object) {
    const { x, y, w, h } = object;

    ctx.save();

    // Base metálica
    ctx.fillStyle = '#697783';
    ctx.fillRect(x + w * 0.15, y + h * 0.15, w * 0.7, h * 0.7);

    ctx.strokeStyle = '#c4d0d8';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + w * 0.15, y + h * 0.15, w * 0.7, h * 0.7);

    // Núcleo de plasma
    ctx.fillStyle = '#19baff';
    ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4);

    // Centro luminoso
    ctx.fillStyle = '#c9f6ff';
    ctx.fillRect(x + w * 0.4, y + h * 0.4, w * 0.2, h * 0.2);

    // Conectores
    ctx.fillStyle = '#d6a84c';
    ctx.fillRect(x, y + h * 0.4, w * 0.15, h * 0.2);
    ctx.fillRect(x + w * 0.85, y + h * 0.4, w * 0.15, h * 0.2);

    ctx.restore();
}

// ------------------------------------------------------------
// CRISTALES DE DILITIO DE LA FLOTA ESTELAR
// ------------------------------------------------------------
function drawManiacDilithiumCrystal(object) {
    const { x, y, w, h } = object;

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y);
    ctx.lineTo(x + w * 0.85, y + h * 0.3);
    ctx.lineTo(x + w * 0.75, y + h * 0.8);
    ctx.lineTo(x + w * 0.5, y + h);
    ctx.lineTo(x + w * 0.2, y + h * 0.8);
    ctx.lineTo(x + w * 0.1, y + h * 0.3);
    ctx.closePath();

    ctx.fillStyle = '#b52bba';
    ctx.fill();

    ctx.strokeStyle = '#f4a5ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Facetas interiores
    ctx.fillStyle = '#ed8aff';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y);
    ctx.lineTo(x + w * 0.5, y + h * 0.55);
    ctx.lineTo(x + w * 0.1, y + h * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#76218f';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y + h * 0.55);
    ctx.lineTo(x + w * 0.85, y + h * 0.3);
    ctx.lineTo(x + w * 0.75, y + h * 0.8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// ------------------------------------------------------------
// CONSOLA DE ENSAMBLAJE
// ------------------------------------------------------------
function drawManiacAssemblyConsole(object) {
    /*const { x, y, w, h } = object;

    ctx.save();

    // Patas
    ctx.fillStyle = '#454c55';
    ctx.fillRect(x + w * 0.12, y + h * 0.55, w * 0.12, h * 0.45);
    ctx.fillRect(x + w * 0.76, y + h * 0.55, w * 0.12, h * 0.45);

    // Estructura inferior
    ctx.fillStyle = '#59636e';
    ctx.fillRect(x + w * 0.08, y + h * 0.48, w * 0.84, h * 0.15);

    // Superficie de la mesa
    ctx.fillStyle = '#788895';
    ctx.fillRect(x, y + h * 0.3, w, h * 0.25);

    ctx.strokeStyle = '#c1d0dc';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y + h * 0.3, w, h * 0.25);

    // Pantalla central
    ctx.fillStyle = '#102e3b';
    ctx.fillRect(x + w * 0.2, y + h * 0.05, w * 0.6, h * 0.22);

    // Datos de pantalla
    ctx.fillStyle = '#43e6c1';
    ctx.fillRect(x + w * 0.27, y + h * 0.11, w * 0.35, 3);
    ctx.fillRect(x + w * 0.27, y + h * 0.19, w * 0.45, 3);

    // Botones de control
    ctx.fillStyle = '#e8c84a';
    ctx.fillRect(x + w * 0.08, y + h * 0.36, 7, 7);
    ctx.fillRect(x + w * 0.84, y + h * 0.36, 7, 7);

    ctx.restore();*/
}

// TODO -- REMOVE
// ------------------------------------------------------------
// PUERTA
// ------------------------------------------------------------
function drawManiacDoor(room, object) {
    const C = MANIAC_COLORS;
    const x = object.x;
    const y = object.y;

    // Puerta abierta: utiliza la imagen definida en el objeto.
    if (object.state.open) {
        const img = object.imagenAbierta;

        if (img && img.complete) {
            ctx.drawImage(img, 24, 24, 976, 302);
        }

        return;
    }

    // Puerta cerrada: dibujo Canvas.
/*    ctx.fillStyle = C.negro;
    ctx.fillRect(x, y, 90, 165);

    ctx.fillStyle = C.granate;
    ctx.fillRect(x + 7, y + 7, 76, 151);

    ctx.fillStyle = C.negro;
    ctx.fillRect(x + 17, y + 20, 56, 55);
    ctx.fillRect(x + 17, y + 85, 56, 60);

    ctx.fillStyle = C.rojo;
    ctx.fillRect(x + 22, y + 25, 46, 45);
    ctx.fillRect(x + 22, y + 90, 46, 50);

    ctx.fillStyle = C.amarillo;
    ctx.fillRect(x + 63, y + 80, 7, 7);*/
}


// ------------------------------------------------------------
// PERSONAJE PROVISIONAL - AVENTURERO 8 BITS
// ------------------------------------------------------------
function drawManiacRoomCharacter() {
    const C = MANIAC_COLORS;

    const x = maniacCharacterX;
    const y = 250;

    /*// Cabeza.
    ctx.fillStyle = C.granate;
    ctx.fillRect(x - 12, y - 50, 24, 25);

    ctx.fillStyle = C.grisClaro;
    ctx.fillRect(x - 9, y - 47, 18, 19);

    // Cuerpo.
    ctx.fillStyle = C.azulOscuro;
    ctx.fillRect(x - 17, y - 25, 34, 38);

    // Brazos.
    ctx.fillStyle = C.granate;
    ctx.fillRect(x - 25, y - 20, 9, 28);
    ctx.fillRect(x + 16, y - 20, 9, 28);

    // Piernas.
    ctx.fillStyle = C.negro;
    ctx.fillRect(x - 14, y + 13, 11, 22);
    ctx.fillRect(x + 3, y + 13, 11, 22);*/

    // Sombra bajo los pies.
    ctx.fillStyle = C.negro;
    ctx.fillRect(x - 20, y + 34, 40, 5);

    // Botas.
    ctx.fillStyle = '#29202B';
    ctx.fillRect(x - 17, y + 25, 14, 12);
    ctx.fillRect(x + 3, y + 25, 14, 12);

    ctx.fillStyle = '#777078';
    ctx.fillRect(x - 17, y + 32, 14, 4);
    ctx.fillRect(x + 3, y + 32, 14, 4);

    // Piernas: pantalones.
    ctx.fillStyle = '#303D70';
    ctx.fillRect(x - 14, y + 10, 11, 18);
    ctx.fillRect(x + 3, y + 10, 11, 18);

    // Cuerpo: chaqueta.
    ctx.fillStyle = '#0B2039';
    ctx.fillRect(x - 18, y - 24, 36, 38);

    // Detalles de la chaqueta.
    ctx.fillStyle = '#F48C1F';
    ctx.fillRect(x - 13, y - 20, 5, 27);
    ctx.fillRect(x + 8, y - 20, 5, 27);

    // Cinturón.
    ctx.fillStyle = '#29202B';
    ctx.fillRect(x - 17, y + 8, 34, 5);

    ctx.fillStyle = '#D6B45C';
    ctx.fillRect(x - 3, y + 8, 7, 5);

    // Brazos.
    ctx.fillStyle = '#0B2039';
    ctx.fillRect(x - 26, y - 20, 9, 27);
    ctx.fillRect(x + 17, y - 20, 9, 27);

    // Manos.
    ctx.fillStyle = '#E5AD83';
    ctx.fillRect(x - 26, y + 5, 9, 8);
    ctx.fillRect(x + 17, y + 5, 9, 8);

    // Cuello.
    ctx.fillStyle = '#E5AD83';
    ctx.fillRect(x - 5, y - 30, 10, 9);

    // Cabeza.
    ctx.fillStyle = '#E5AD83';
    ctx.fillRect(x - 13, y - 51, 26, 24);

    // Orejas.
    ctx.fillRect(x - 16, y - 43, 4, 8);
    ctx.fillRect(x + 12, y - 43, 4, 8);

    // Pelo.
    if (maniacPlayer.name === 'ANDREU') {
        ctx.fillStyle = '#59351F';
        ctx.fillRect(x - 14, y - 55, 28, 9);
        ctx.fillRect(x - 14, y - 49, 5, 10);
        ctx.fillRect(x + 9, y - 49, 5, 7);
    }

    // Cejas.
    ctx.fillStyle = '#59351F';
    ctx.fillRect(x - 9, y - 42, 6, 2);
    ctx.fillRect(x + 3, y - 42, 6, 2);

    // Ojos.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 9, y - 38, 5, 5);
    ctx.fillRect(x + 4, y - 38, 5, 5);

    ctx.fillStyle = '#20202A';
    ctx.fillRect(x - 7, y - 37, 2, 4);
    ctx.fillRect(x + 6, y - 37, 2, 4);

    // Nariz.
    ctx.fillStyle = '#C88765';
    ctx.fillRect(x - 2, y - 33, 5, 4);

    // Boca.
    ctx.fillStyle = '#713E37';
    ctx.fillRect(x - 4, y - 28, 8, 2);
}


// ------------------------------------------------------------
// MENSAJE DE ACCIÓN
// ------------------------------------------------------------
function drawManiacRoomMessage() {

    let message = maniacMessage;

    if (!maniacSelectingObject && !maniacActionMessage) {

        if (maniacNearbyObject) {
            if (maniacNearbyObject.id === 'otherPlayer') {
                const otherPlayer = maniacCharacters.find(
                    character => character.name !== maniacPlayer.name
                );
                message = `${otherPlayer.name} AL ALCANCE`;
            } else {
                message = maniacNearbyObject.name + ' AL ALCANCE';
            }
        } else if (!message) {
            message = 'Estás en una habitación desconocida. Busca una salida.';
        }
    }

    text(message, 512, 359, 16, MANIAC_COLORS.blanco, false, 'monospace');
}


// ------------------------------------------------------------
// DIBUJO DE VERBOS
// ------------------------------------------------------------
function drawManiacRoomVerbs() {
    const C = MANIAC_COLORS;

    const startX = 38;
    const startY = 428;
    const cellW = 145;
    const cellH = 48;

    MANIAC_VERBS.forEach((verb, i) => {

        const col = i % 4;
        const row = Math.floor(i / 4);

        const x = startX + col * 150;
        const y = startY + row * 55;

        const selected = !maniacSelectingObject &&
            i === maniacSelectedVerb;

        ctx.fillStyle = selected ? C.amarillo : C.azul;
        ctx.fillRect(x, y, cellW, cellH);

        ctx.fillStyle = selected ? C.verde : C.negro;
        ctx.fillRect(x + 3, y + 3, cellW - 6, cellH - 6);

        text(
            verb,
            x + cellW / 2,
            y + cellH / 2 + 1,
            16,
            selected ? C.amarillo : C.blanco,
            true,
            'monospace'
        );
    });

    if (maniacSelectingObject) {
        text(
            'ELIGE UN OBJETO',
            330,
            540,
            13,
            C.amarillo,
            true,
            'monospace'
        );
    }
}


// ------------------------------------------------------------
// INVENTARIO
// ------------------------------------------------------------
function drawManiacRoomInventory() {
    const C = MANIAC_COLORS;

    if (maniacInventory.length === 0) {
        text(
            'VACÍO',
            827,
            475,
            18,
            C.grisClaro,
            false,
            'monospace'
        );

        return;
    }

    maniacInventory.forEach((item, i) => {
        maniacText(
            '• ' + item.toUpperCase(),
            690,
            430 + i * 24,
            16,
            C.blanco,
            false,
            'left',
            'monospace'
        );
    });
}


// ============================================================
// SISTEMA DE ACCIONES
// ============================================================
//
// Cada objeto indica qué acciones admite mediante su propiedad
// actions. Aquí se implementa el comportamiento.
//
// El motor común no necesita conocer los detalles de cada sala.
// Recibe la habitación, el objeto y el verbo seleccionado.
// ============================================================


// ------------------------------------------------------------
// REGISTRO DE ACCIONES
// ------------------------------------------------------------
const maniacActions = {

    // ------------------------
    // LIBRO
    // ------------------------
    book_look(room, object) {
        return room.state.bookOpen
            ? 'El libro está abierto. Hay algo entre sus páginas.'
            : 'Es un libro antiguo. Parece que contiene algo.';
    },

    book_take(room, object) {
        return 'El libro es demasiado grande para llevártelo.';
    },

    book_open(room, object) {

        if (room.state.bookOpen) {
            return 'El libro ya está abierto.';
        }

        room.state.bookOpen = true;

        const key = room.objects.find(o => o.id === 'key');

        if (key) {
            key.visible = true;
        }

        return 'Abres el libro. ¡Hay una llave escondida!';
    },

    book_close(room, object) {

        if (!room.state.bookOpen) {
            return 'El libro ya está cerrado.';
        }

        room.state.bookOpen = false;

        return 'Cierras el libro.';
    },


    // ------------------------
    // LLAVE
    // ------------------------
    key_look(room, object) {
        return 'Es una pequeña llave dorada.';
    },

    key_take(room, object) {

        if (room.state.keyTaken) {
            return 'Ya has cogido la llave.';
        }

        room.state.keyTaken = true;
        object.visible = false;

        if (!maniacInventory.includes('llave')) {
            maniacInventory.push('llave');
        }

        return '¡Has conseguido una llave!';
    },


    // ------------------------
    // PUERTA
    // ------------------------
    door_look(room, object) {

        if (object.state.open) {
            return 'La puerta está abierta.';
        }

        return 'Una puerta cerrada. Necesitas una llave.';
    },

    door_open(room, object) {

        if (object.state.open) {
            return 'La puerta ya está abierta.';
        }

        if (room.id === 'Room1' && !maniacInventory.includes('llave')) {
            return 'La puerta está cerrada con llave.';
        }

        object.state.open = true;

        return '¡La llave funciona! La puerta se abre.';
    },

    door_close(room, object) {

        if (!object.state.open) {
            return 'La puerta ya está cerrada.';
        }

        object.state.open = false;

        return 'Cierras la puerta.';
    },

    door_use(room, object) {

        //console.log('door_use ejecutada en:', room.id);
        //console.log('Estado de la puerta:', object.state.open);

        if (!object.state.open) {
            return 'Primero tienes que abrir la puerta.';
        }

        if (!object.destination) {
            return 'No sabes adónde conduce esta puerta.';
        }

        //console.log('Cambiando a ', object.destination);
        maniacGoToRoom(object.destination);
        object.state.open = false;
        //console.log('Habitación actual:', maniacCurrentRoom);

        return 'Has atravesado la puerta.';
    },

    door_push(room, object) {

        if (object.state.open) {
            return 'La puerta ya está abierta.';
        }

        return 'Empujas la puerta, pero está cerrada con llave.';
    },


    // ------------------------
    // ARMARIO
    // ------------------------
    cabinet_look(room, object) {
        return room.state.cabinetOpen
            ? 'El armario está abierto. Hay algo en su interior.'
            : 'Un viejo armario de madera. Parece bastante pesado.';
    },

    cabinet_open(room, object) {

        if (room.state.cabinetOpen) {
            return 'El armario ya está abierto.';
        }

        room.state.cabinetOpen = true;

        const energyCell = room.objects.find(o => o.id === 'energyCell');

        if (energyCell && !room.state.energyCellTaken) {
            energyCell.visible = true;
        }

        return '¡El armario contiene una célula de energía de la Flota Estelar!';
    },

    cabinet_close(room, object) {

        if (!room.state.cabinetOpen) {
            return 'El armario ya está cerrado.';
        }

        room.state.cabinetOpen = false;

        const energyCell = room.objects.find(o => o.id === 'energyCell');

        if (energyCell && !room.state.energyCellTaken) {
            energyCell.visible = false;
        }

        return 'Cierras el armario.';
    },

    cabinet_use(room, object) {
        return room.state.cabinetOpen
            ? 'El armario está abierto.'
            : 'Deberías abrirlo primero.';
    },

    // ------------------------
    // CÉLULA DE ENERGÍA
    // ------------------------
    energyCell_look(room, object) {
        return 'Una célula de energía avanzada. Tiene el emblema de la Flota Estelar.';
    },

    energyCell_take(room, object) {

        if (room.state.energyCellTaken) {
            return 'Ya has recogido la célula de energía.';
        }

        room.state.energyCellTaken = true;
        object.visible = false;

        if (!maniacInventory.includes('célula de energía')) {
            maniacInventory.push('célula de energía');
        }

        return '¡Has conseguido una célula de energía de la Flota Estelar!';
    },


    // ------------------------
    // MESA
    // ------------------------
    table_look(room, object) {
        return 'Una mesa vieja y polvorienta.';
    },

    table_take(room, object) {
        return 'No puedes llevarte la mesa.';
    },

    table_push(room, object) {
        return 'Empujas la mesa, pero no ocurre nada.';
    },

    table_pull(room, object) {
        return 'Tiras de la mesa, pero no ocurre nada.';
    },

    // ------------------------
    // MÓDULO DE CONTROL
    // ------------------------
    controlModule_look(room, object) {
        return 'Un módulo electrónico de control de la Flota Estelar. Parece que todavía funciona.';
    },

    controlModule_take(room, object) {

        if (room.state.controlModuleTaken) {
            return 'Ya has recogido el módulo de control.';
        }

        room.state.controlModuleTaken = true;
        object.visible = false;

        if (!maniacInventory.includes('módulo de control')) {
            maniacInventory.push('módulo de control');
        }

        return '¡Has conseguido el módulo de control!';
    },


    // ------------------------
    // COMPONENTE DE PLASMA
    // ------------------------
    plasmaComponent_look(room, object) {
        return 'Un componente de plasma. Parece formar parte del sistema de propulsión.';
    },

    plasmaComponent_take(room, object) {

        if (room.state.plasmaComponentTaken) {
            return 'Ya has recogido el componente de plasma.';
        }

        room.state.plasmaComponentTaken = true;
        object.visible = false;

        if (!maniacInventory.includes('componente de plasma')) {
            maniacInventory.push('componente de plasma');
        }

        return '¡Has conseguido el componente de plasma!';
    },


    // ------------------------
    // CRISTAL DE DILITIO
    // ------------------------
    dilithiumCrystal_look(room, object) {
        return 'Un cristal de dilitio. Es un elemento fundamental para el sistema de energía de la nave.';
    },

    dilithiumCrystal_take(room, object) {

        if (room.state.dilithiumCrystalTaken) {
            return 'Ya has recogido el cristal de dilitio.';
        }

        room.state.dilithiumCrystalTaken = true;
        object.visible = false;

        if (!maniacInventory.includes('cristal de dilitio')) {
            maniacInventory.push('cristal de dilitio');
        }

        return '¡Has conseguido el cristal de dilitio!';
    },


    // ------------------------
    // CONSOLA DE MONTAJE
    // ------------------------
    assemblyConsole_look(room, object) {

        return room.state.consoleUsed
            ? 'La consola muestra el sistema de reparación completado.'
            : 'Una consola de ingeniería preparada para ensamblar los componentes del sistema de reparación.';
    },

    assemblyConsole_use(room, object) {

        if (room.state.consoleUsed) {
            return 'El sistema de reparación ya está montado.';
        }

        const requiredItems = [
            'célula de energía',
            'módulo de control',
            'componente de plasma',
            'cristal de dilitio'
        ];

        const missingItems = requiredItems.filter(item =>
            !maniacInventory.includes(item)
        );

        if (missingItems.length > 0) {
            return 'Todavía faltan componentes para completar el montaje.';
        }

        room.state.consoleUsed = true;

        return '¡Has ensamblado todos los componentes! El sistema de reparación está listo.';
    },

    // ------------------------
    // INGENIERO
    // ------------------------
    engineer_look(room, object) {
        return 'Es un ingeniero de la Flota Estelar. Parece estar ocupado con sus tareas.';
    },

    engineer_talk(room, object) {
        return 'INGENIERO: Ahora mismo estoy ocupado. Si necesitas reparar algo, habla con el jefe de ingeniería.';
    },

    // ------------------------
    // OTRO JUGADOR
    // ------------------------
    player_look(room, object) {
        const otherPlayer = maniacCharacters.find(
            character => character.name !== maniacPlayer.name
        );

        return `Es ${otherPlayer.name}, tu compañero de la Flota Estelar.`;
    },

    player_talk(room, object) {
        const otherPlayer = maniacCharacters.find(
            character => character.name !== maniacPlayer.name
        );

        maniacStartPlayerConversation();
        return maniacMessage;
        //return `${otherPlayer.name}: El jefe de ingeniería es ${otherPlayer.name === 'JESUS' ? 'ANDREU' : 'JESUS'}.`;
    }
};


// ------------------------------------------------------------
// MOTOR COMÚN DE EJECUCIÓN DE ACCIONES
// ------------------------------------------------------------
function maniacRoomExecuteAction(roomId, objectId, verb) {

    const room = maniacRooms[roomId];

    if (!room) {
        console.warn('Habitación inexistente:', roomId);
        return;
    }

    const object = room.objects.find(o => o.id === objectId);

    if (!object || !object.visible) {
        maniacMessage = 'No puedes interactuar con ese objeto.';
        return;
    }

    const actionId = object.actions
        ? object.actions[verb]
        : null;

    if (!actionId) {
        maniacMessage = 'No puedes ' + verb.toLowerCase() + ' eso.';
        return;
    }

    const action = maniacActions[actionId];

    if (!action) {
        console.warn('Acción no implementada:', actionId);
        maniacMessage = 'No sabes cómo hacer eso.';
        return;
    }

    maniacMessage = action(room, object);
    maniacActionMessage = true;
}


// ------------------------------------------------------------
// TECLADO DE LA HABITACIÓN
// ------------------------------------------------------------
function maniacRoomHandleKey(key) {

    // ESC: volver a la pantalla inicial.
    if (key === 'Escape') {
        gameState = 'MANIAC_EASTER_EGG';
        return;
    }

    // Las flechas quedan reservadas para el movimiento.
    if (key.startsWith('Arrow')) return;

    const normalizedKey = key.toLowerCase();

    // Selección de verbos con A/D y W/S.
    const col = maniacSelectedVerb % 4;
    const row = Math.floor(maniacSelectedVerb / 4);

    if (normalizedKey === 'a' && col > 0) {
        maniacSelectedVerb--;
        return;
    }

    if (normalizedKey === 'd' && col < 3) {
        maniacSelectedVerb++;
        return;
    }

    if (normalizedKey === 'w' && row > 0) {
        maniacSelectedVerb -= 4;
        return;
    }

    if (normalizedKey === 's' && row < 1) {
        maniacSelectedVerb += 4;
        return;
    }

    // ENTER o ESPACIO: ejecutar acción.
    if (key === 'Enter' || key === ' ' || key === 'Space' || key === 'Spacebar') {

        if (!maniacNearbyObject) {
            maniacMessage = 'No hay ningún objeto al alcance.';
            return;
        }

        const verb = MANIAC_VERBS[maniacSelectedVerb];

        maniacRoomExecuteAction(
            maniacCurrentRoom,
            maniacNearbyObject.id,
            verb
        );

        //console.log('Acción ejecutada:', verb, maniacNearbyObject.id);
    }
}
