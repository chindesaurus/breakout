/*jslint browser: true, devel: true, white: true */
(function() {
"use strict";
var x, y, dx, dy, ctx, width, height,
intervalId = 0, canvasMinX = 0, canvasMaxX = 0, 
velocityFactor = 1.02, score = 0, 

// sounds
hit, pop,

// paddle position
paddlex, paddleh, paddlew,

// left and right arrow keys
leftDown = false, rightDown = false,

// brick variables
bricks, NROWS, NCOLS, brick_width, brick_height, padding;


function showScore(i) {
    document.getElementsByName("score")[0].value = i;
}

function circle(x, y, r) {
    ctx.fillStyle = "#939393";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
}

function clear() {
    ctx.clearRect(0, 0, width, height);
}


function onKeyDown(evt) {
    if (evt.keyCode === 39) {
        rightDown = true;
    } else if (evt.keyCode === 37) {
        leftDown = true;
    }
}

function onKeyUp(evt) {
    if (evt.keyCode === 39) {
        rightDown = false;
    } else if (evt.keyCode === 37) {
        leftDown = false;
    }
}
window.onkeydown = onKeyDown;
window.onkeyup = onKeyUp;

function onMouseMove(evt) {
    if (evt.pageX > canvasMinX && evt.pageX < canvasMaxX) {
        paddlex = evt.pageX - canvasMinX - (paddlew / 2);
    }
}
window.onmousemove = onMouseMove;



function initbricks() {
    var i, j;

    NROWS = 5;
    NCOLS = 10;
    brick_width = (width / NCOLS) - 2.4;
    brick_height = 15;
    padding = 2;

    bricks = [NROWS];
    for (i = 0; i < NROWS; i += 1) {
        bricks[i] = [NCOLS];
        for (j = 0; j < NCOLS; j += 1) {
            bricks[i][j] = 1;
        }
    }
}

function drawBricks() {
    var i, j, colors;

    // red, orange, yellow, green, blue
    colors = ["#FA1100", "#FDCA00", "#FFFF00", "#3FFF00", "#3EFEFF"];
    
    for (i = 0; i < NROWS; i += 1) {
        ctx.fillStyle = colors[i];
        for (j = 0; j < NCOLS; j += 1) {
            if (bricks[i][j] === 1) {
                rect((j * (brick_width + padding)) + padding,
                     (i * (brick_height + padding)) + padding,
                           brick_width, brick_height);
            }
        }
    }
}

function won() {
    var i, j;

    for (i = 0; i < NROWS; i += 1) {
        for (j = 0; j < NCOLS; j += 1) {
            if (bricks[i][j] !== 0) {
                return false;
            }
        }
    }
    return true;
}

function draw() {
    var rowheight, colwidth, row, col;

    // clear the screen
    clear();
   
    // draw the ball 
    circle(x, y, 10);

    drawBricks();
   
    rowheight = brick_height + padding;
    colwidth = brick_width + padding;
    row = Math.floor(y / rowheight);
    col = Math.floor(x / colwidth);
    // if we have hit a brick, reverse the ball's direction
    // and mark the brick as broken
    if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] === 1) {
        
        // play pop sound        
        pop.play();

        // increase y-velocity for every brick broken
        dy = -dy * velocityFactor;

        // mark brick as broken
        bricks[row][col] = 0;

        // increase the score - higher bricks are worth more points
        switch (row) {
        case 4:
            score = score + 1;
            break;
        case 3:
            score = score + 1.5;
            break;
        case 2:
            score = score + 2;
            break;
        case 1:
            score = score + 2.5;
            break;
        case 0:
            score = score + 3;
            break;
        }
        showScore(score);
    }

    // move the paddle when left or right arrows are pressed
    if (rightDown) {
        paddlex = paddlex + 5;
    } else if (leftDown) {
        paddlex = paddlex - 5;
    }

    // don't let paddle go beyond the left and right walls
    while (paddlew + paddlex > width) {
        paddlex -= 1;
    }
    while (paddlex < 0) {
        paddlex += 1;
    }

    // draw the paddle
    ctx.fillStyle = "#000000";
    rect(paddlex, height - paddleh, paddlew, paddleh);

    // bounce off left and right walls 
    if (x + dx > width || x + dx < 0) {
        dx = -dx;
    }

    // bounce off of top wall
    if (y + dy < 0) {
        dy = -dy;
    }
   
    // check if the player has won
    if (won() === true) {
        clearInterval(intervalId);
        alert("You won!");
    } else if (y + dy > height) {
        // bounce off of paddle
        if (x > paddlex && x < paddlex + paddlew + 10) {
            // change x based on where it hits the paddle
            dx = 4 * ((x - (paddlex + paddlew / 2)) / paddlew);
            dy = -dy;

            // play boing sound
            hit.play();
        } else {    // player lost the ball
            clearInterval(intervalId);
            alert("Thanks for playing!");
        }
    }

    // create the illusion of movement
    x = x + dx;
    y = y + dy;
}

function init() {
    // get a reference to the canvas
    ctx = document.getElementById("canvas").getContext("2d");
    
    // set height and width variables from DOM
    width = document.getElementById("canvas").offsetWidth;
    height = document.getElementById("canvas").offsetHeight;

    paddlex = width / 2;
    paddleh = 10;
    paddlew = 75;

    canvasMinX = document.getElementById("canvas").offsetLeft;
    canvasMaxX = canvasMinX + width;

    initbricks();
    drawBricks();

    hit = document.getElementById("hit");
    pop = document.getElementById("pop");

    // draw the ball 
    x = 250;
    y = 125;
    circle(x, y, 10);
    // draw the paddle
    ctx.fillStyle = "#000000";
    rect(paddlex, height - paddleh, paddlew, paddleh);

    // start the game when the player clicks the button
    document.getElementById("button").onclick = function startGame() {
        x = 250;
        y = 125;
        initbricks();
     
        // reset scoreboard 
        score = 0;
        showScore(score);

        // reset velocity
        // dx is in interval (-3, +3)
        dx = (Math.random() * 6) - 3;
        dy = 4;
   
        // reset arrow keys 
        leftDown = false;
        rightDown = false;
            
        clearInterval(intervalId);

        // run draw() every 15 milliseconds 
        intervalId = setInterval(draw, 15);
    };

}
init();

}());
