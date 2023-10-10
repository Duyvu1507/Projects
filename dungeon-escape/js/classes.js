// Player Character
class Player extends PIXI.AnimatedSprite {
    constructor(playerSprite, radius = 20, x = 0, y = 0) {
        super(playerSprite);
        this.anchor.set(0.5, 0.5); //Position, scaling, rotating, etc. are now from center of sprite
        this.scale.set(radius / 40);
        this.animationSpeed = 0.125;
        this.loop = false;

        this.play();

        this.x = x;
        this.y = y;
        this.radius = radius;

        this.origX = 0;
        this.origY = 0;
        this.boxX = 0;
        this.boxY = 0;

        this.dx = 0;
        this.dx = 0;
        this.speed = 150;
        this.touchingBox = false;
        this.hiding = false;
        this.prevHiding = false;
    }

    move(dt = 1 / 60) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
    }
}

// Enemy Character
class Enemy extends PIXI.AnimatedSprite {
    constructor(enemySprite, radius = 10, x = 0, y = 0, walkRadius = 150, alertRadius = 100) {
        super(enemySprite);
        this.anchor.set(0.5, 0.5); //Position, scaling, rotating, etc. are now from center of sprite
        this.scale.set(radius / 40);
        this.animationSpeed = 0.125;
        this.loop = false;

        this.x = x;
        this.y = y;
        this.walkRadius = walkRadius;
        this.alertRadius = alertRadius;
        this.radius = radius;
        this.target = { x: 0, y: 0 };

        //Variables
        this.fwd = getRandomUnitVector();
        this.speed = 75;
        this.isAlive = true;
        this.chasing = false;
        this.chaseSpeed = this.speed * 2;
        this.reseting = false;
    }

    move(dt = 1 / 60) {

        this.fwd.x = getDirectionVector(this, this.target).x;
        this.fwd.y = getDirectionVector(this, this.target).y;

        //Moves Enemies
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;     
    }

    chase(dt = 1 / 60, player) {

        this.fwd.x = getDirectionVector(this, player).x;
        this.fwd.y = getDirectionVector(this, player).y;

        //Moves Enemies
        this.x += this.fwd.x * this.chaseSpeed * dt;
        this.y += this.fwd.y * this.chaseSpeed * dt;

    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}

// Collectable Item
class Keys extends PIXI.Sprite {
    constructor(radius = 10, gem = "images/key.png", points = 10, x = 0, y = 0) {
        super(PIXI.Loader.shared.resources[gem].texture);
        this.anchor.set(0.5, 0.5); //Position, scaling, rotating, etc. are now from center of sprite
        this.scale.set(radius / 20);
        this.radius = radius;
        this.x = x;
        this.y = y;

        this.points = points;
        this.collected = false;
    }
}

// Interactable Obstacle
class Box extends PIXI.Sprite {
    constructor(radius = 20, x = 0, y = 0) {
        super(PIXI.Loader.shared.resources["images/cover.png"].texture);
        this.anchor.set(0.5, 0.5); //Position, scaling, rotating, etc. are now from center of sprite
        this.scale.set(radius / 40);
        this.radius = radius;
        this.x = x;
        this.y = y;

    }
}

// Noninteractable Obstacle
class Wall extends PIXI.Sprite {
    constructor(radius = 20, x = 0, y = 0) {
        super(PIXI.Loader.shared.resources["images/wall.png"].texture);
        this.anchor.set(0.5, 0.5); //Position, scaling, rotating, etc. are now from center of sprite
        this.scale.set(radius / 40);
        this.radius = radius;
        this.x = x;
        this.y = y;
    }
}

// Background Tile Image
class Tile extends PIXI.Sprite {
    constructor(radius = 20, x = 0, y = 0) {
        super(PIXI.Loader.shared.resources["images/tile.png"].texture);
        this.anchor.set(0.5, 0.5); //Position, scaling, rotating, etc. are now from center of sprite
        this.scale.set(radius / 40);
        this.radius = radius;
        this.x = x;
        this.y = y;
    }
}

// Background Staircase Image
class Stairs extends PIXI.Sprite {
    constructor(radius = 20, x = 0, y = 0) {
        super(PIXI.Loader.shared.resources["images/stairs.png"].texture);
        this.anchor.set(0.5, 0.5); //Position, scaling, rotating, etc. are now from center of sprite
        this.scale.set(radius / 40);
        this.radius = radius;
        this.x = x;
        this.y = y;
    }
}


// Field of View for Enemies
class View extends PIXI.Graphics {
    constructor(x = 0, y = 0, radius = 50, color = 0xFFFF99) {
        super();
        this.beginFill(color);
        this.arc(this.x, this.y, radius, -Math.PI /2, Math.PI / 2);
        this.endFill();
        this.x = x;
        this.y = y
    }
}

// Draws black squares for the HUD
class HUD extends PIXI.Graphics {
    constructor(radius = 20, x = 0, y = 0) {
        super();
        this.beginFill(0x000000);
        this.drawRect(-radius, -radius, radius * 2, radius * 2);
        this.endFill();
        this.x = x;
        this.y = y
    }
}