// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

//Local Storage
window.onload = (e) => {
    const storedScore = localStorage.getItem(scoreKey);
    if (storedScore) {
        highScore = storedScore; //Updates high score from previous plays
    }
}
//Stores High Score
let prefix = "dv8618-";
let scoreKey = prefix + "score";
let highScore = 100;
let score = 0;


//Used to scale all the objects in the game (equal to the width of each grid segment)
let universalWidth = 40;

const app = new PIXI.Application({ width: universalWidth * 15, height: universalWidth * 15 });

document.body.appendChild(app.view);

//Game Screen Size
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

//Load required Images
const loader = PIXI.Loader.shared;
loader.add(['images/player_sheet.png', 'images/enemy_sheet.png',
        'images/key.png', 'images/key_red.png', 'images/key_green.png',
        'images/cover.png', 'images/wall.png', 'images/tile.png', 'images/stairs.png']);
loader.load(setup);

// Input
let keys = {};

let stage;

//Game Variables
let startScene;
let instructionsScene;
let controlsScene;
let gameScene, player, scoreLabel, floorLabel;
let gameOverScene, gameOverFloorLabel, gameOverScoreLabel, highScoreLabel;

//Animations
let playerSheet = {};
let enemySheet = {};

//Sounds
let clinkSound, heartbeatSound, splatSound;

//Lists of Game Objects
let enemies = [];
let views = [];
let boxes = [];
let keys_collectable = [];
let walls = [];
let tiles = [];
let stairs = [];
let hud = [];

let level = 1;
let paused = true;

function setup() {
	stage = app.stage;

    // Input
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

	//Create Start Scene
	startScene = new PIXI.Container();
    stage.addChild(startScene);

    //Create Instructions Scene
    instructionsScene = new PIXI.Container();
    instructionsScene.visible = false;
    stage.addChild(instructionsScene);

    //Create Controls Scene
    controlsScene = new PIXI.Container();
    controlsScene.visible = false;
    stage.addChild(controlsScene);
	
	//Create Game Scene
	gameScene = new PIXI.Container();
	gameScene.visible = false;
	stage.addChild(gameScene);

	//Create GameOver Scene
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
	
	//Creates Labels for each scene
    createLabels();

    //Load Sprite Sheets
    createPlayerSheet();
    createEnemySheet();

	//Create Player
    player = new Player(playerSheet.standUp, universalWidth / 2);
    gameScene.addChild(player);


	//Load Sounds
    clinkSound = new Howl({ src: ['sounds/chain_clink.mp3'] });
    heartbeatSound = new Howl({ src: ['sounds/heart_beat.mp3'] });
    splatSound = new Howl({ src: ['sounds/splat.mp3'] });

	//Start Update Loop
    app.ticker.add(gameLoop);
}

function createLabels() {
    //------Styles------
    //Title Style
    let titleStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 108,
        fontFamily: 'Arcade',
    });

    //Subtitle Style
    let subtitleStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 72,
        fontFamily: 'Arcade',
    });

    //Medium Style
    let mediumStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 48,
        fontFamily: 'Arcade',
    });

    //Small Style
    let smallStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: 'Arcade',
    });

    //------Start Scene------
    // Title Label
    let titleLabel = new PIXI.Text("Dungeon\n Escape");
    titleLabel.style = titleStyle;
    titleLabel.x = sceneWidth / 2;
    titleLabel.y = sceneHeight / 3;
    titleLabel.anchor.set(0.5);
    startScene.addChild(titleLabel);

    // Left Key Label
    let leftKeyLabel = new PIXI.Sprite(loader.resources["images/key.png"].texture);
    leftKeyLabel.height = 100;
    leftKeyLabel.width = 100;
    leftKeyLabel.anchor.set(0.5);
    leftKeyLabel.x = sceneWidth / 2 - 100;
    leftKeyLabel.y = sceneHeight / 2 + 100;
    startScene.addChild(leftKeyLabel);

    // Middle Key Label
    let middleKeyLabel = new PIXI.Sprite(loader.resources["images/key_green.png"].texture);
    middleKeyLabel.height = 100;
    middleKeyLabel.width = 100;
    middleKeyLabel.anchor.set(0.5);
    middleKeyLabel.x = sceneWidth / 2;
    middleKeyLabel.y = sceneHeight / 2 + 100;
    startScene.addChild(middleKeyLabel);

    // Right Key Label
    let rightKeyLabel = new PIXI.Sprite(loader.resources["images/key_red.png"].texture);
    rightKeyLabel.height = 100;
    rightKeyLabel.width = 100;
    rightKeyLabel.anchor.set(0.5);
    rightKeyLabel.x = sceneWidth / 2 + 100;
    rightKeyLabel.y = sceneHeight / 2 + 100;
    startScene.addChild(rightKeyLabel);

    // Start Button
    let startLabel1 = new PIXI.Text("Start");
    startLabel1.style = mediumStyle;
    startLabel1.x = sceneWidth / 2;
    startLabel1.y = sceneHeight * 7 / 8 - 30;
    startLabel1.anchor.set(0.5);
    startLabel1.interactive = true;
    startLabel1.buttonMode = true;
    startLabel1.on("pointerup", startGame);
    startLabel1.on("pointerover", e => e.target.alpha = 0.7);
    startLabel1.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startLabel1);

    // Instruction Button
    let instructionsButton = new PIXI.Text("Instructions");
    instructionsButton.style = mediumStyle;
    instructionsButton.x = sceneWidth / 2;
    instructionsButton.y = sceneHeight * 7 / 8 + 30;
    instructionsButton.anchor.set(0.5);
    instructionsButton.interactive = true;
    instructionsButton.buttonMode = true;
    instructionsButton.on("pointerup", showInstructions);
    instructionsButton.on("pointerover", e => e.target.alpha = 0.7);
    instructionsButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(instructionsButton);


    //------Instructions Scene
    // Instructions Label
    let intructionsLabel = new PIXI.Text("Instructions");
    intructionsLabel.style = subtitleStyle;
    intructionsLabel.x = sceneWidth / 2;
    intructionsLabel.y = sceneHeight / 8;
    intructionsLabel.anchor.set(0.5);
    instructionsScene.addChild(intructionsLabel);

    //Instructions Description Label
    let instructionsDescLabel = new PIXI.Text("\nCollect  keys  while  avoiding" +
        "\nmonsters.  If  a  monster  spots  you," +
        "\nhide  in  a  crate  to  make  it  lose" +
        "\nsight  of  you." +
        "\n\nCollect  all  the keys on  a  floor  to" +
        "\nreveal  the  stairs  to  the  next  floor." +
        "\n\nUse  WASD  to  move  around." +
        "\nHold  Space Bar  to  hide  in  the  crates");
    instructionsDescLabel.style = smallStyle;
    instructionsDescLabel.x = 30;
    instructionsDescLabel.y = sceneHeight / 2;
    instructionsDescLabel.anchor.set(0, 0.5);
    instructionsScene.addChild(instructionsDescLabel);

    //Start Label
    let menuButton = new PIXI.Text("Menu");
    menuButton.style = mediumStyle;
    menuButton.x = sceneWidth / 2;
    menuButton.y = sceneHeight * 15 / 16;
    menuButton.anchor.set(0.5);
    menuButton.interactive = true;
    menuButton.buttonMode = true;
    menuButton.on("pointerup", mainMenu);
    menuButton.on('pointerover', e => e.target.alpha = 0.7);
    menuButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    instructionsScene.addChild(menuButton);

    //------Game Scene------
    //HUD Style
    let hudStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 36,
        fontFamily: 'Arcade',
    });

    //Floor Label
    floorLabel = new PIXI.Text();
    floorLabel.style = hudStyle;
    floorLabel.x = universalWidth / 2;
    floorLabel.y = universalWidth / 2;
    floorLabel.anchor.set(0, 0.5);
    gameScene.addChild(floorLabel);
    setFloorLabel();

    //Score Label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = hudStyle;
    scoreLabel.x = universalWidth * parseInt(sceneWidth / universalWidth / 2) - universalWidth / 2;
    scoreLabel.y = universalWidth / 2;
    scoreLabel.anchor.set(0, 0.5);
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);


    //------GameOver Scene------
    //Game Over Label
    let gameOverLabel = new PIXI.Text("You  Died");
    gameOverLabel.style = titleStyle;
    gameOverLabel.x = sceneWidth / 2;
    gameOverLabel.y = sceneHeight / 4;
    gameOverLabel.anchor.set(0.5);
    gameOverScene.addChild(gameOverLabel);

    //Game Over Floor Label
    gameOverFloorLabel = new PIXI.Text();
    gameOverFloorLabel.style = mediumStyle;
    gameOverFloorLabel.x = sceneWidth / 2;
    gameOverFloorLabel.y = sceneHeight / 2 - 20;
    gameOverFloorLabel.anchor.set(0.5);
    gameOverScene.addChild(gameOverFloorLabel);

    //Game Over Score Label
    gameOverScoreLabel = new PIXI.Text();
    gameOverScoreLabel.style = mediumStyle;
    gameOverScoreLabel.x = sceneWidth / 2;
    gameOverScoreLabel.y = sceneHeight / 2 + 40;
    gameOverScoreLabel.anchor.set(0.5);
    gameOverScene.addChild(gameOverScoreLabel);

    //High Score Label
    highScoreLabel = new PIXI.Text();
    highScoreLabel.style = mediumStyle;
    highScoreLabel.x = sceneWidth / 2;
    highScoreLabel.y = sceneHeight / 2 + 100;
    highScoreLabel.anchor.set(0.5);
    gameOverScene.addChild(highScoreLabel);

    //Play Again Label
    let playAgainLabel = new PIXI.Text("Play Again");
    playAgainLabel.style = mediumStyle;
    playAgainLabel.x = sceneWidth / 2;
    playAgainLabel.y = sceneHeight  * 7 / 8 - 30;
    playAgainLabel.anchor.set(0.5);
    playAgainLabel.interactive = true;
    playAgainLabel.buttonMode = true;
    playAgainLabel.on("pointerup", startGame);
    playAgainLabel.on("pointerover", e => e.target.alpha = 0.7);
    playAgainLabel.on("pointerout", e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainLabel);
}

//Creates the sprite arrays for the player
function createPlayerSheet() {
    let ssheet = new PIXI.BaseTexture.from("images/player_sheet.png");
    let w = 64;
    let h = 72;

    playerSheet["standDown"] = [new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 0 * h, w, h))];
    playerSheet["standRight"] = [new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 1 * h, w, h))];
    playerSheet["standUp"] = [new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 2 * h, w, h))];
    playerSheet["standLeft"] = [new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 3 * h, w, h))];

    playerSheet["walkDown"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 0 * h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(1 * w, 0 * h, w, h))
    ];
    playerSheet["walkRight"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 1 * h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(1 * w, 1 * h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(2 * w, 1 * h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(3 * w, 1 * h, w, h))
    ];
    playerSheet["walkUp"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 2 * h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(1 * w, 2 * h, w, h))
    ];
    playerSheet["walkLeft"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 3 * h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(1 * w, 3 * h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(2 * w, 3 * h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(3 * w, 3 * h, w, h))
    ];

}

//Creates the sprite arrays for the enemies
function createEnemySheet() {
    let ssheet = new PIXI.BaseTexture.from("images/enemy_sheet.png");
    let w = 60;
    let h = 65;

    enemySheet["standDown"] = [new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 0 * h, w, h))];
    enemySheet["standUp"] = [new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 1 * h, w, h))];

    enemySheet["walkDown"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(4 * w, 1.8 * h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(5 * w, 1.8 * h, w, h))
    ];
    enemySheet["walkUp"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(5 * w, 0 * h, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(6 * w, 0 * h, w, h))
    ];
}

// Display the main menu
function mainMenu() {
    startScene.visible = true;
    instructionsScene.visible = false;
    gameScene.visible = false;
    gameOverScene.visible = false;
}

// Displays the instructions screen
function showInstructions() {
    startScene.visible = false;
    instructionsScene.visible = true;
    gameScene.visible = false;
    gameOverScene.visible = false;
}

//Gets the game ready to play
function startGame() {
    startScene.visible = false;
    instructionsScene.visible = false;
    controlsScene.visible = false;
    gameScene.visible = true;
    gameOverScene.visible = false;
    player.x = sceneWidth / 2;
    player.y = sceneHeight - universalWidth * 1.5;
    score = 0;
    level = 1;
    loadLevel();
    increaseScoreBy(0);
}

//Increases score and displays it
function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = `Score  -  ${score}`;
}

//Shows what floor the player is on
function setFloorLabel() {

    floorLabel.text = `Floor  -  B${level}`;
}

//The main loop of the game
function gameLoop() {
    player.prevHiding = player.hiding;
    
    //No sounds play in the menus
    if (startScene.visible || instructionsScene.visible || controlsScene.visible) {
        clinkSound.stop();
        heartbeatSound.stop();
        splatSound.stop();
    }

    //Only death sounds play in the Game Over Scene
    else if (gameOverScene.visible) {
        clinkSound.stop();
        heartbeatSound.stop();
    }

    //Game logic and sounds stop while not in game
    if (paused) {

        return;
    }

    //Calculates delta time
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    if (!player.hiding) {
        //Moves Player
        //D
        if (keys["68"]) {

            player.dx = player.speed;
        }
        //A
        else if (keys["65"]) {

            player.dx = -player.speed;
        }
        else {
            player.dx = 0;
        }

        // S
        if (keys["83"]) {

            player.dy = player.speed;
        }
        // W
        else if (keys["87"]) {

            player.dy = -player.speed;
        }
        else {
            player.dy = 0;
        }

        //Updates Animations
        //Player is moving Down or Diagonal-Down
        if (player.dy > 0) {
            if (!player.playing || player.textures != playerSheet.walkDown) {
                player.textures = playerSheet.walkDown;
                player.play();
            }
        }
        //Player is moving Up or Diagonal-Up
        else if (player.dy < 0) {
            if (!player.playing || player.textures != playerSheet.walkUp) {
                player.textures = playerSheet.walkUp;
                player.play();
            }
        }
        //Player is moving Right
        else if (player.dx > 0 && player.dy == 0) {
            if (!player.playing || player.textures != playerSheet.walkRight) {
                player.textures = playerSheet.walkRight;
                player.play();
            }
        }
        //Player is moving Left
        else if (player.dx < 0 && player.dy == 0) {
            if (!player.playing || player.textures != playerSheet.walkLeft) {
                player.textures = playerSheet.walkLeft;
                player.play();
            }
        }

        //Player does not animate while not moving
        if (player.dx == 0 && player.dy == 0) {
            player.stop();
        }

        //Ensures speed does not exceed the set speed
        if (player.dx != 0 && player.dy != 0) {
            let moveDist = Math.sqrt(player.dx * player.dx + player.dy * player.dy);
            player.dx = player.dx / moveDist * player.speed;
            player.dy = player.dy / moveDist * player.speed;
        }

        player.move(dt);
    }

    player.touchingBox = false;

    //Prevents Player from intersecting walls
    for (let w of walls) {
        handleAABBCollisions(player, w);
    }

    //Prevents Player from intersecting boxes
    for (let b of boxes) {
        handleAABBCollisions(player, b);

        //Player's left or right side intersects the box's horizontal position 
        if (Math.abs(player.x - b.x) <= (player.width / 2 + b.width / 2 + 1) && 
            Math.abs(player.y - b.y) <= (player.height / 2 + b.height / 2 + 1)) {
            player.touchingBox = true;

            //Prevents player from displaying in then wrong box
            let box = { x: player.boxX, y: player.boxY };
            if (getDistance(player, b) <= getDistance(player, box)) {
                player.boxX = b.x;
                player.boxY = b.y;
            } 
        }
    }

    //Saves player's position
    if (!player.hiding) {
        player.origX = player.x;
        player.origY = player.y;
    }

    // Spacebar
    if (player.touchingBox && keys["32"]) {
        player.hiding = true;
        player.alpha = 0.5;
        player.x = player.boxX;
        player.y = player.boxY;
    }
    else {
        player.hiding = false;
        player.alpha = 1.0;
    }

    //Allows player to exit box on any side as long as it is not blocked by an obstacle
    if (!player.hiding && player.prevHiding) {
        // D
        if (keys["68"]) {
            player.x += player.width / 2 + universalWidth / 2;
            if (intersectsObstacles(player)) {
                player.x = player.origX;
                player.y = player.origY;
            }
        }
        // A
        else if (keys["65"]) {
            player.x -= player.width / 2 + universalWidth / 2;
            if (intersectsObstacles(player)) {
                player.x = player.origX;
                player.y = player.origY;
            }
        }
        // S
        else if (keys["83"]) {
            player.y += player.height / 2 + universalWidth / 2;
            if (intersectsObstacles(player)) {
                player.x = player.origX;
                player.y = player.origY;
            }
        }
        // W
        else if (keys["87"]) {
            player.y -= player.height / 2 + universalWidth / 2;
            if (intersectsObstacles(player)) {
                player.x = player.origX;
                player.y = player.origY;
            }
        }
        else {
            player.x = player.origX;
            player.y = player.origY;
        }
    }

    //Player does not animate while hiding
    if (player.hiding) {
        player.stop();
    }

    //Keeps the player on the screen with clamp()
    let w2 = player.width / 2;
    let h2 = player.height / 2;
    player.x = clamp(player.x, 0 + w2, sceneWidth - w2);
    player.y = clamp(player.y, 0 + h2, sceneHeight - h2);

    let enemyChasing = false;
    //Determines whether Enemies have found the player
    for (let e of enemies) {

        let dist = getDistance(e, player);
        let directionToPlayer = { x: player.x - e.x, y: player.y - e.y };

        //Enemies notice the player if they are in front of the enemy and within a certain range
        if (dist <= e.alertRadius && dotProduct(e.fwd, directionToPlayer) > 0 && !player.hiding)  {
            e.chasing = true;
            enemyChasing = true;
        }
        else if (e.chasing && player.hiding) {
            e.chasing = false;
        }
    }

    if (enemyChasing) {
        if (!heartbeatSound.playing())
            heartbeatSound.play();
    }
    else {
        heartbeatSound.stop();
    }

    //Moves Enemies
    for (let e of enemies) {
        if (e.chasing) {
            e.chase(dt, player);
            e.animationSpeed = 0.25;
        }
        else {
            e.move(dt);
            e.animationSpeed = 0.125;
        }
        
        if (e.x <= e.radius || e.x >= sceneWidth - e.radius) {
            e.reflectX();
            e.move(dt);
        }

        if (e.y <= e.radius || e.y >= sceneHeight - e.radius) {
            e.reflectY();
            e.move(dt);
        }

        //Moves Enemy's destination when they get close to it
        if (getDistance(e, e.target) <= universalWidth * 1.5) {
            e.target.x = getRandom(universalWidth, sceneWidth - universalWidth);
            e.target.y = getRandom(universalWidth * 2, sceneWidth - universalWidth);
        }

        //Handles Collisions with obstacles
        for (let b of boxes) {
            if (e.chasing) {
                handleAABBCollisions(e, b);
            }

            else {
                if (handleCircleCollisions(e, b)) {
                    let direction = getDirectionVector(b, e);
                    e.target.x = b.x + direction.x * universalWidth * 3;
                    e.target.y = b.y + direction.y * universalWidth * 3;

                    if (e.target.x < universalWidth || e.target.x > sceneWidth - universalWidth) {
                        e.target.x = getRandom(universalWidth, sceneWidth - universalWidth);
                    }
                    if (e.target.y < universalWidth * 2 || e.target.y > sceneHeight - universalWidth) {
                        e.target.y = getRandom(universalWidth * 2, sceneHeight - universalWidth);
                    }
                }
            }
        }
        for (let w of walls) {
            if (e.chasing) {
                handleAABBCollisions(e, w);
            }
            else {
                if (handleCircleCollisions(e, w)) {
                    let direction = getDirectionVector(w, e);
                    e.target.x = w.x + direction.x * universalWidth * 3;
                    e.target.y = w.y + direction.y * universalWidth * 3;

                    if (e.target.x < universalWidth || e.target.x > sceneWidth - universalWidth) {
                        e.target.x = getRandom(universalWidth, sceneWidth - universalWidth);
                    }
                    if (e.target.y < universalWidth * 2 || e.target.y > sceneHeight - universalWidth) {
                        e.target.y = getRandom(universalWidth * 2, sceneHeight - universalWidth);
                    }
                }
            }
        }

        //Changes animation based on movement direction
        if (e.fwd.y >= 0 && (!e.playing || e.textures != enemySheet.walkDown)) {
            e.textures = enemySheet.walkDown;
            e.play();
        }
        else if (e.fwd.y < 0 && (!e.playing || e.textures != enemySheet.walkUp)) {
            e.textures = enemySheet.walkUp;
            e.play();
        }
    }

    //Updates Enemies' Field of View
    for (let i = 0; i < views.length; i++) {
        views[i].x = enemies[i].x;
        views[i].y = enemies[i].y - 10;
        views[i].rotation = getAngle(enemies[i].fwd);
    }

    //Check Collisions
    for (let e of enemies) {
        //Player dies when an enemy touches them
        if (!player.hiding && rectsIntersect(e, player)) {
            end();
            splatSound.play();
            return;
        }
    }

    //Collecting a key removes it from the scene
    for (let k of keys_collectable) {
        if (!k.collected && rectsIntersect(k, player)) {
            k.collected = true;
            gameScene.removeChild(k);
            increaseScoreBy(k.points);
            clinkSound.play();
        }
    }

    //Remove Collected keys
    keys_collectable = keys_collectable.filter(k => !k.collected);

    //Stairs appear when all keys are collected
    if (keys_collectable.length == 0) {
        for (let s of stairs) {
            s.visible = true;
        }
    }
    else {
        for (let s of stairs) {
            s.visible = false;
        }
    }

    //Level increments when the player reaches the stairs
    for (let s of stairs) {
        if (s.visible && rectsIntersect(s, player)) {
            level++;
            loadLevel();
        }
    }
}

//------------Level Loading------------

//Adds all the game objects to the stage
function loadLevel() {
    clearLevel();

    player.x = sceneWidth / 2;
    player.y = sceneHeight - universalWidth * 1.5;

    createTiles(); //Tiles floor
    createStairs(1); //Adds exit stairs

    //Starts with 10 boxes, decreasing by 1 per level (min 2)
    if (11 - level > 2)
        createBoxes(11 - level);
    else
        createBoxes(2);
    //Starts with 2 keys, increasing by 1 per level (max 20)
    if (1 + level < 20)
        createKeys(1 + level);
    else
        createKeys(20);

    gameScene.addChild(player); //Allows the player to be drawn at the correct depth

    //Starts with 2 enemies, increasing by 1 per level (max 20)
    if (1 + level < 20)
        createEnemies(1 + level);
    else
        createEnemies(20);

    createWalls(); //Makes border of obstacles around the screen

    createHUD();
    gameScene.addChild(scoreLabel); //Allows the label to be drawn over the game elements
    setFloorLabel();
    gameScene.addChild(floorLabel); //Allows the label to be drawn over the game elements
    paused = false;
}

//Spawns the specified number of enemies and adds them to the scene
function createEnemies(numEnemies) {
    for (let i = 0; i < numEnemies; i++) {

        let x = parseInt(getRandom(1, sceneWidth / universalWidth - 1)) * universalWidth + universalWidth / 2;
        let y = parseInt(getRandom(2, (sceneHeight / universalWidth) / 2 - 1)) * universalWidth + universalWidth / 2;
        let e = new Enemy(enemySheet.standUp, universalWidth / 2, x, y);
        e.target.x = getRandom(universalWidth, sceneWidth - universalWidth);
        e.target.y = getRandom(universalWidth, sceneWidth - universalWidth);
        enemies.push(e);
        gameScene.addChild(e);

        //Prevents overlap
        while (intersectsObjects(e)) {
            e.x = parseInt(getRandom(1, sceneWidth / universalWidth - 1)) * universalWidth + universalWidth / 2;
            e.y = parseInt(getRandom(2, (sceneHeight / universalWidth) / 2 - 1)) * universalWidth + universalWidth / 2;
        }

        let v = new View(x, y - 10, e.alertRadius - universalWidth / 2);
        v.alpha = 0.25;
        views.push(v);
        gameScene.addChild(v);
    }
}

//Spawns the specified number of keys and adds them to the scene
function createKeys(numKeys) {
    for (let i = 0; i < numKeys; i++) {

        let x = parseInt(getRandom(1, sceneWidth / universalWidth - 1)) * universalWidth + universalWidth / 2;
        let y = parseInt(getRandom(2, sceneHeight / universalWidth - 1)) * universalWidth + universalWidth / 2;

        //Randomly determines which key to place
        let keyIndex = getRandom(0, 10);
        let key_collectable;
        let keyScore;

        // Different keys worth different amounts of points
        if (keyIndex <= 1) {
            key_collectable = "images/key_red.png";
            keyScore = 50;
        }
        else if (keyIndex <= 4) {
            key_collectable = "images/key_green.png";
            keyScore = 25;
        }
        else {
            key_collectable = "images/key.png";
            keyScore = 10;
        }

        let k = new Keys(universalWidth / 4, key_collectable, keyScore, x, y);
        keys_collectable.push(k);
        gameScene.addChild(k);

        //Prevents overlap
        while (intersectsObjects(k)) {
            k.x = parseInt(getRandom(1, sceneWidth / universalWidth - 1)) * universalWidth + universalWidth / 2;
            k.y = parseInt(getRandom(2, sceneHeight / universalWidth - 1)) * universalWidth + universalWidth / 2;
        }
    }
}

//Spawns the specified number of boxes and adds them to the scene
function createBoxes(numBoxes) {
    for (let i = 0; i < numBoxes; i++) {

        let x = parseInt(getRandom(1, sceneWidth / universalWidth - 1)) * universalWidth + universalWidth / 2;
        let y = parseInt(getRandom(2, sceneHeight / universalWidth - 1)) * universalWidth + universalWidth / 2;
        let b = new Box(universalWidth / 2, x, y);
        boxes.push(b);
        gameScene.addChild(b);

        //Prevents overlap
        while (intersectsObjects(b)) {
            b.x = parseInt(getRandom(1, sceneWidth / universalWidth - 1)) * universalWidth + universalWidth / 2;
            b.y = parseInt(getRandom(2, sceneHeight / universalWidth - 1)) * universalWidth + universalWidth / 2;
        }
    }
}

//Creates walls as a boundary around the map
function createWalls() {
    for (let i = universalWidth / 2; i < sceneWidth; i += universalWidth) {
        for (let j = universalWidth / 2; j < sceneHeight; j += universalWidth) {
            if (i == universalWidth / 2 || j == universalWidth / 2 + universalWidth || i == sceneWidth - universalWidth / 2 || j == sceneHeight - universalWidth / 2) {
                let w = new Wall(universalWidth / 2, i, j);
                walls.push(w);
                gameScene.addChild(w);
            }
        }
    }
}

//Creates tiles as the floor of the map
function createTiles() {
    for (let i = universalWidth / 2; i < sceneWidth; i += universalWidth) {
        for (let j = universalWidth / 2 + universalWidth; j < sceneHeight; j += universalWidth) {
            let t = new Tile(universalWidth / 2, i, j);
            tiles.push(t);
            gameScene.addChild(t);
        }
    }
}

//Spawns the specified number of stairs and adds them to the scene
function createStairs(numStairs) {
    for (let i = 0; i < numStairs; i++) {

        let x = parseInt(getRandom(1, sceneWidth / universalWidth - 1)) * universalWidth + universalWidth / 2;
        let y = parseInt(getRandom(2, sceneHeight / universalWidth - 1)) * universalWidth + universalWidth / 2;
        let s = new Stairs(universalWidth / 2, x, y);
        stairs.push(s);
        gameScene.addChild(s);

        //Prevents overlap
        while (intersectsObjects(s)) {
            s.x = parseInt(getRandom(1, sceneWidth / universalWidth - 1)) * universalWidth + universalWidth / 2;
            s.y = parseInt(getRandom(2, sceneHeight / universalWidth - 1)) * universalWidth + universalWidth / 2;
        }
    }
}

//Draws black squares at the top of the screen for the HUD
function createHUD() {
    for (let i = universalWidth / 2; i < sceneWidth; i += universalWidth) {
        let h = new HUD(universalWidth / 2, i, universalWidth / 2);
        hud.push(h);
        gameScene.addChild(h);
    }
}

//------------Level Unloading------------
//Handles ending the current run of game
function end() {
    paused = true;
    clearLevel();

    //Displays Game Data
    gameOverFloorLabel.text = `Made  it  to  Floor  -  B${level}`;
    gameOverScoreLabel.text = `Your  Score  -  ${score}`;

    //Stores new high score in local data
    if (score > highScore) {
        highScore = score;

        localStorage.setItem(scoreKey, highScore);
        highScoreLabel.text = `New  High  Score!`;
    }
    else {
        highScoreLabel.text = `High  Score  -  ${highScore}`;
    }

    gameOverScene.visible = true;
    gameScene.visible = false;
}

//Clear Game Objects from Level
function clearLevel() {
    //Clear out level
    enemies.forEach(e => gameScene.removeChild(e)); //Removes all Enemies from the scene
    enemies = [];

    views.forEach(v => gameScene.removeChild(v)); //Removes all Views from the scene
    views = [];

    boxes.forEach(b => gameScene.removeChild(b)); //Removes all Boxes from the scene
    boxes = [];

    keys_collectable.forEach(g => gameScene.removeChild(g)); //Removes all Keys from the scene
    keys_collectable = [];

    walls.forEach(s => gameScene.removeChild(s)); //Removes all Walls from the scene
    walls = [];

    tiles.forEach(t => gameScene.removeChild(t)); //Removes all Tiles from the scene
    tiles = [];

    stairs.forEach(s => gameScene.removeChild(s)); //Removes all Stairs from the scene
    stairs = [];

    hud.forEach(h => gameScene.removeChild(h)); //Removes all HUD squares from the scene
    hud = [];

    gameScene.removeChild(player);
    gameScene.removeChild(scoreLabel);
}

//Checks whether the supplied object intersects any other currently added object
function intersectsObjects(obj) {

    let intersecting = false

    // Player
    if (rectsIntersect(obj, player)) {
        intersecting = true;
    }
    // Enemies
    for (let i = 0; i < enemies.length; i++) {
        if (rectsIntersect(obj, enemies[i])) {
            intersecting = true;
        }
    }
    // Keys
    for (let i = 0; i < keys_collectable.length; i++) {
        if (rectsIntersect(obj, keys_collectable[i])) {
            intersecting = true;
        }
    }
    // Boxes
    for (let i = 0; i < boxes.length; i++) {
        if (rectsIntersect(obj, boxes[i])) {
            intersecting = true;
        }
    }
    // Wall
    for (let i = 0; i < walls.length; i++) {
        if (rectsIntersect(obj, walls[i])) {
            intersecting = true;
        }
    }
    //Stairs
    for (let j = 0; j < stairs.length; j++) {
        if (rectsIntersect(obj, stairs[j])) {
            intersecting = true;
        }
    }

    return intersecting;
}

//Checks whether the supplied object intersects any currently added obstacle
function intersectsObstacles(obj) {

    let intersecting = false

    //Boxes
    for (let j = 0; j < boxes.length; j++) {
        if (rectsIntersect(obj, boxes[j])) {
            intersecting = true;
        }
    }
    // Walls
    for (let j = 0; j < walls.length; j++) {
        if (rectsIntersect(obj, walls[j])) {
            intersecting = true;
        }
    }

    return intersecting;
}

// Detect when a key is pressed and store its new value
function keyDown(e) {
    keys[e.keyCode] = true;
}

// Detect when a key is released and store its new value
function keyUp(e) {
    keys[e.keyCode] = false;
}