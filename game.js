const directions = ["up", "right", "down", "left"];

const state = {
    gameArea: document.querySelector("#game-area"),
    gameAreaRect: document.querySelector("#game-area").getBoundingClientRect(),
    startOverlay: document.querySelector("#start-overlay"),
    pauseOverlay: document.querySelector("#pause-overlay"),
    endedOverlay: document.querySelector("#ended-overlay"),
    snake: null,
    head: null,
    tail: [],
    positions: [],
    turns: [],
    started: false,
    paused: false,
    ended: false,
    score: 0,
    speed: 50,
    direction: "up"
};

let GAME_LOOP = createGameLoop();

(() => {
    init();
    setKeyBindings();
})();

function init () {
    // create snake
    (() => {
        const snake = document.createElement("div");
        snake.id = "snake";
        snake.classList.add("snake");
        
        const head = document.createElement("div");
        head.id = "head";
        head.classList.add("head");
        head.style.top = `${window.snake.helpers.getRandomValueInRangeWithStep(120, 450, 30)}px`;
        head.style.left = `${window.snake.helpers.getRandomValueInRangeWithStep(120, 1050, 30)}px`;

        snake.appendChild(head);
        state.snake = snake;
        state.head = head;
    })();

    // randomizeDirection
    (() => {
        state.direction = directions[Math.floor(Math.random() * directions.length)];
    })();
}

function setKeyBindings () {
    document.addEventListener("keydown", (event) => {
        const { key } = event;

        if (state.ended) {
            if (key === "Enter") {
                window.location.reload();
            } else {
                return false;
            }
        }

        switch (key) {
            case "Enter":
                if (!state.started) {
                    preStart();
                } else if (state.paused) {
                    start();
                }
                break;
            case "ArrowUp":
                if (state.direction === "down") return false;
                changeDirection("up");
                break;
            case "ArrowRight":
                if (state.direction === "left") return false; 
                changeDirection("right");
                break;
            case "ArrowDown":
                if (state.direction === "up") return false;
                changeDirection("down");
                break;
            case "ArrowLeft":
                if (state.direction === "right") return false; 
                changeDirection("left");
                break;
            case "p":
                if (state.paused) {
                    start();
                } else {
                    pause();
                }
                break;
        }
    });
}

function changeDirection (newDirection) {
    const top = +state.head.style.top.replace("px", "");
    const left = +state.head.style.left.replace("px", "");
    const oldDirection = state.direction;

    state.turns.push({ top, left, oldDirection, newDirection });
    state.direction = newDirection;
}

function preStart () {
    state.startOverlay.classList.add("hidden");
    state.gameArea.appendChild(state.snake);
    state.started = true;
    
    generateApple();
    start();
}

function start () {
    state.paused = false;
    state.pauseOverlay.classList.add("hidden");
}

function pause () {
    state.paused = true;
    state.pauseOverlay.classList.remove("hidden");
}

function end () {
    state.ended = true;
    state.endedOverlay.classList.remove("hidden");
    document.querySelector("[data-score]").innerText = state.score;
}

function generateApple () {
    let disallowedPositions = [state.head, ...state.tail].map(item => {
        const x = +item.style.left.replace("px", "");
        const y = +item.style.top.replace("px", "");

        return { x, y }; 
    });

    let appleYPosition = window.snake.helpers.getRandomValueInRangeWithStep(0, 570, 30);
    let appleXPosition = window.snake.helpers.getRandomValueInRangeWithStep(0, 1170, 30);

    while (disallowedPositions.every(position => position.x === appleXPosition && position.y === appleYPosition)) {
        appleYPosition = window.snake.helpers.getRandomValueInRangeWithStep(0, 570, 30);
        appleXPosition = window.snake.helpers.getRandomValueInRangeWithStep(0, 1170, 30);
    }

    const apple = document.createElement("div");
    apple.classList.add("apple");
    apple.style.top = `${appleYPosition}px`;
    apple.style.left = `${appleXPosition}px`;

    const appleInner = document.createElement("div");
    appleInner.classList.add("apple-inner");

    apple.appendChild(appleInner);
    state.gameArea.appendChild(apple);
}

function checkIsGoingOutOfBounds () {
    let willBeOutOfBounds = false;
    let headRect = state.head.getBoundingClientRect();

    if (state.direction === "up") {
        willBeOutOfBounds = (headRect.top - 30) < state.gameAreaRect.top;
    } else if (state.direction === "right") {
        willBeOutOfBounds = (headRect.right + 30) > state.gameAreaRect.right;
    } else if (state.direction === "down") {
        willBeOutOfBounds = (headRect.bottom + 30) > state.gameAreaRect.bottom;
    } else if (state.direction === "left") {
        willBeOutOfBounds = (headRect.left - 30) < state.gameAreaRect.left;
    }

    return willBeOutOfBounds;
}

function checkIsCollidingWithTail () {
    let willCollideWithTail = false;
    let headRect = state.head.getBoundingClientRect();
    let tail = state.tail.slice(1);

    for (let item of tail) {
        let inner = item.querySelector(".inner-tail");
        let innerRect = inner.getBoundingClientRect();

        if (state.direction === "up") {
            willCollideWithTail = !(
                headRect.right < innerRect.left ||
                headRect.left > innerRect.right ||
                headRect.bottom < innerRect.top ||
                (headRect.top - 30) > innerRect.bottom
            );
        } else if (state.direction === "right") {
            willCollideWithTail = !(
                (headRect.right + 30) < innerRect.left ||
                headRect.left > innerRect.right ||
                headRect.bottom < innerRect.top ||
                headRect.top > innerRect.bottom
            );
        } else if (state.direction === "down") {
            willCollideWithTail = !(
                headRect.right < innerRect.left ||
                headRect.left > innerRect.right ||
                (headRect.bottom + 30) < innerRect.top ||
                headRect.top > innerRect.bottom
            );
        } else if (state.direction === "left") {
            willCollideWithTail = !(
                headRect.right < innerRect.left ||
                (headRect.left - 30) > innerRect.right ||
                headRect.bottom < innerRect.top ||
                headRect.top > innerRect.bottom
            );
        }

        if (willCollideWithTail) {
            break;
        }
    }

    return willCollideWithTail;
}

function move () {
    let top = +state.head.style.top.replace("px", "");
    let left = +state.head.style.left.replace("px", "");

    if (state.direction === "up") {
        top -= 30;
    } else if (state.direction === "right") {
        left += 30;
    } else if (state.direction === "down") {
        top += 30;
    } else if (state.direction === "left") {
        left -= 30;
    }

    state.head.style.top = `${top}px`;
    state.head.style.left = `${left}px`;
    
    for (let i = 0; i < state.tail.length; i++) {
        let attachTo = i > 0 ? state.tail[i-1] : state.head;
        let direction;

        if (i > 0) {
            let currentTail = state.tail[i - 1];
            let currentTailTop = +currentTail.style.top.replace("px", "");
            let currentTailLeft = +currentTail.style.left.replace("px", "");
            let foundTurn = state.turns.find((turn) => turn.top === currentTailTop && turn.left === currentTailLeft);
    
            if (foundTurn) {
                direction = foundTurn.oldDirection;
            } else {
                direction = i > 0 ? state.positions[i-1].direction : state.direction;
            }
        } else {
            direction = i > 0 ? state.positions[i-1].direction : state.direction;
        }
        
        let top = +attachTo.style.top.replace("px", "");
        let left = +attachTo.style.left.replace("px", "");
    
        if (direction === "up") {
            top += 30;
        } else if (direction === "right") {
            left -= 30;
        } else if (direction === "down") {
            top -= 30;
        } else if (direction === "left") {
            left += 30;
        }
    
        state.tail[i].style.top = `${top}px`;
        state.tail[i].style.left = `${left}px`;

        state.positions[i] = { top, left, direction };
    }

    state.turns = state.turns.filter(turn => {
        return state.tail.some(item => {
            let itemTop = +item.style.top.replace("px", "");
            let itemLeft = +item.style.left.replace("px", "");

            return itemTop === turn.top && itemLeft === turn.left;
        });
    });
}

function eat () {
    let apples = document.querySelectorAll(".apple");
    
    for (let apple of apples) {
        let inner = apple.querySelector(".apple-inner");

        if (window.snake.helpers.areElementsIntersecting(inner, state.head)) {
            state.score++;
            state.speed = state.speed - 1;
            
            clearInterval(GAME_LOOP);
            GAME_LOOP = createGameLoop();
            
            grow();
            apple.remove();

            let frenzyGenerated = generateFrenzyByChance();

            if (!document.querySelector(".apple") && !frenzyGenerated) {
                generateApple();
            }
        }
    }
}

function generateFrenzyByChance () {
    let randomNumber = window.snake.helpers.getRandomNumber(0, 100);
    
    if (randomNumber === 50) {
        let count = 0;
        let frenzyInterval = setInterval(() => {
            generateApple();
            count++;

            if (count === 15) {
                clearInterval(frenzyInterval)
            }
        }, 10);

        return true;
    } else {
        return false;
    }
}

function grow () {
    const tail = document.createElement("div");
    tail.classList.add("tail");
    tail.dataset.index = state.tail.length;
    const inner = document.createElement("div");
    inner.classList.add("inner-tail");

    tail.appendChild(inner);
    
    let direction = state.tail.length > 0 ? state.positions[state.positions.length - 1].direction : state.direction;
    let attachTo = state.tail.length > 0 ? state.tail[state.tail.length - 1] : state.head;
    let top = +attachTo.style.top.replace("px", "");
    let left = +attachTo.style.left.replace("px", "");
    
    if (direction === "up") {
        top += 30;
    } else if (direction === "right") {
        left -= 30;
    } else if (direction === "down") {
        top -= 30;
    } else if (direction === "left") {
        left += 30;
    }

    tail.style.top = `${top}px`;
    tail.style.left = `${left}px`;

    state.tail.push(tail);
    state.positions.push({ left, top, direction });
    state.snake.appendChild(tail);
}


function createGameLoop () {
    return setInterval(() => {
        if (!state.started) return false;
        if (state.paused) return false;
        if (state.ended) return false;
    
        const isGoingOutOfBounds = checkIsGoingOutOfBounds();
        const isCollidingWithTail = checkIsCollidingWithTail();
        
        if (isGoingOutOfBounds || isCollidingWithTail) {
            end();
        } else {
            move();
            eat();
        }
    }, state.speed);
}