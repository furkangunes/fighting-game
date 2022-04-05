const constants = {
    ARENA_WIDTH: 1024,
    ARENA_HEIGHT: 576,
    FIGHTER_WIDTH: 115,
    FIGHTER_HEIGHT: 200,
    MOVE_SPEED: 5,
    JUMP_SPEED: 20,
    GRAVITY: 1
}

const actions = {
    NO_ACTION: 0,
    MOVE_LEFT: 1,
    MOVE_RIGHT: 2,
    JUMP: 3,
}

class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    move(velocity) {
        this.x += velocity.x;
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > constants.ARENA_WIDTH) {
            this.x = constants.ARENA_WIDTH - this.width;
        }
        
        this.y += velocity.y;
        if (this.y < 0) {
            this.y = 0;
        } else if (this.y + this.height > constants.ARENA_HEIGHT) {
            this.y = constants.ARENA_HEIGHT - this.height;
        }
    }
}

class Fighter {
    constructor(pos, dir) {
        this.rect = new Rect(pos.x, pos.y, constants.FIGHTER_WIDTH, constants.FIGHTER_HEIGHT);
        this.dir = dir;
        this.velocity = {x: 0, y: 0}
        this.actions = new Set();
    }

    act() {
        this.velocity.x = 0;
        console.log(this.velocity.y)
        // this.velocity = this.isMidAir() ? this.velocity + constants.GRAVITY : 0;
        if (this.isMidAir()) {
            this.velocity.y += constants.GRAVITY;
        } else {
            this.velocity.y = 0
        }
        for (const action of this.actions) {
            switch (action) {
                case actions.MOVE_LEFT:
                    this.velocity.x = -constants.MOVE_SPEED;
                    break;
                case actions.MOVE_RIGHT:
                    this.velocity.x = constants.MOVE_SPEED;
                    break;
                case actions.JUMP:
                    this.velocity.y = -constants.JUMP_SPEED;
                    this.actions.delete(actions.JUMP);
                    break;
            }
        }
    }

    animate() {
        this.rect.move(this.velocity);
    }

    draw(ctx, img) {
        ctx.drawImage(img, this.rect.x, this.rect.y);
    }

    isMidAir() {
        return this.rect.y + this.rect.height < constants.ARENA_HEIGHT;
    }
}

function registerKeyBindings(keyBindings) {
    window.addEventListener("keydown", event => {
        try {
            keyBindings[event.key].onPress();
        } catch (e) {
            console.log(e);
        }
    });

    window.addEventListener("keyup", event => {
        try {
            keyBindings[event.key].onRelease();
        } catch (e) {
            console.log(e);
        }
    });
}

function run(fighter, ctx, img) {
    window.requestAnimationFrame(() => run(fighter, ctx, img));
    ctx.clearRect(fighter.rect.x, fighter.rect.y, fighter.rect.width, fighter.rect.height);
    fighter.act();
    fighter.animate();
    fighter.draw(ctx, img);
}

function main() {
    const canvas = document.querySelector("canvas");
    canvas.width = constants.ARENA_WIDTH;
    canvas.height = constants.ARENA_HEIGHT;
    canvas.style.backgroundColor = "crimson";

    const ctx = canvas.getContext("2d");
    
    const img = new Image(115, 200);
    img.src = "test.png";

    const fighter = new Fighter({x: 200, y: 200}, null);
    const keyBindings = {
        "a": {
            onPress: () => {
                fighter.actions.delete(actions.MOVE_RIGHT);
                fighter.actions.add(actions.MOVE_LEFT);  
            },
            onRelease: () => fighter.actions.delete(actions.MOVE_LEFT)
        },
        "d": {
            onPress: () => {
                fighter.actions.delete(actions.MOVE_LEFT);
                fighter.actions.add(actions.MOVE_RIGHT);
            },
            onRelease: () => fighter.actions.delete(actions.MOVE_RIGHT)
        },
        "w": {
            onPress: () => !fighter.isMidAir() && fighter.actions.add(actions.JUMP),
            onRelease: () => null
        }
    }

    registerKeyBindings(keyBindings);    
    run(fighter, ctx, img);
}

main();