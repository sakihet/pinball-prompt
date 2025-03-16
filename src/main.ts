import './style.css';

const canvas = document.getElementById('cv') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('Canvas context not available');
}

// Canvas setup
canvas.style.border = '2px solid black';

// Ball setup - 12px diameter as per specs
const ball = {
  x: canvas.width - 22, // Centered horizontally on the plunger (plungerWidth / 2)
  y: canvas.height - 90, // Positioned above the plunger (plungerHeight + 18px padding)
  radius: 6, // 12px diameter means 6px radius
  dx: 0,
  dy: 0,
  color: 'black',
  launched: false,
  targetSpeed: 0,   // Target speed to reach
  acceleration: 0.3 // How quickly to reach target speed
};

// Flippers setup - positioned 100px above bottom, centered horizontally
const flippers = [
  { 
    x: canvas.width / 2 - 60, 
    y: canvas.height - 100, 
    width: 50, 
    height: 4, // 4px thickness as per specs
    color: 'blue', // blue color as per specs
    angle: Math.PI / 6, // Left flipper tilted downward
    pivot: 'left',
    target: 'down' // Initial target position
  },
  { 
    x: canvas.width / 2 + 10, 
    y: canvas.height - 100, 
    width: 50, 
    height: 4, 
    color: 'blue', 
    angle: -Math.PI / 6, // Right flipper tilted downward
    pivot: 'right',
    target: 'down' // Initial target position
  }
];

// Bottom lanes setup
const bottomLanes = [
  // Left lane: from left flipper pivot toward left wall, 16px from wall, 30-degree incline, 200px length
  {
    x1: flippers[0].x,
    y1: flippers[0].y,
    x2: 16, // 16px from left wall
    y2: flippers[0].y - Math.tan(Math.PI / 6) * (flippers[0].x - 16), // 30-degree incline
    length: 200
  },
  // Right lane: from right flipper pivot toward right wall, 16px from wall, 30-degree incline, 200px length
  {
    x1: flippers[1].x + flippers[1].width,
    y1: flippers[1].y,
    x2: canvas.width - 16, // 16px from right wall
    y2: flippers[1].y - Math.tan(Math.PI / 6) * (canvas.width - 16 - (flippers[1].x + flippers[1].width)), // 30-degree incline
    length: 200
  }
];

// Calculate actual endpoints for the lanes based on their specified length
bottomLanes.forEach(lane => {
  const dx = lane.x2 - lane.x1;
  const dy = lane.y2 - lane.y1;
  const totalLength = Math.sqrt(dx * dx + dy * dy);
  const ratio = lane.length / totalLength;
  
  // Adjust endpoint to match desired length
  lane.x2 = lane.x1 + dx * ratio;
  lane.y2 = lane.y1 + dy * ratio;
});

// Gravity - 10 pixels per second squared as per specs
const gravity = 0.166; // 10 pixels per second squared when running at 60fps

// Score
let score = 0;

// Initialize remaining balls
let remainingBalls = 3;

// Update score display to use output#score
function updateScore() {
  const scoreElement = document.getElementById('score') as HTMLOutputElement;
  if (scoreElement) {
    scoreElement.value = score.toString();
  }
}

// Update remaining balls display to use output#balls
function updateBalls(remainingBalls: number) {
  const ballsElement = document.getElementById('balls') as HTMLOutputElement;
  if (ballsElement) {
    ballsElement.value = remainingBalls.toString();
  }
}

// Reset game when no balls remain
function resetGame() {
  score = 0;
  remainingBalls = 3;
  updateScore();
  updateBalls(remainingBalls);
}

// Wrap all ctx-related operations with null checks
function safeCtxOperation(callback: (ctx: CanvasRenderingContext2D) => void) {
  if (ctx) {
    callback(ctx);
  }
}

// Draw ball
function drawBall() {
  safeCtxOperation((ctx) => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
  });
}

// Update flippers' shape to taper from the pivot point to the tip
function drawFlippers() {
  flippers.forEach((flipper, index) => {
    safeCtxOperation((ctx) => {
      ctx.save();

      // Set pivot points at one end as per specs
      if (index === 0) { // Left flipper
        ctx.translate(flipper.x, flipper.y);
      } else { // Right flipper
        ctx.translate(flipper.x + flipper.width, flipper.y);
      }

      ctx.rotate(flipper.angle); // Apply the tilt angle

      // Draw flipper with a tapered shape
      ctx.fillStyle = flipper.color;
      ctx.beginPath();
      if (index === 0) {
        ctx.moveTo(0, -3); // Start at the pivot point (6px wide)
        ctx.lineTo(flipper.width, -1); // Taper to the tip (2px wide)
        ctx.lineTo(flipper.width, 1);
        ctx.lineTo(0, 3);
        ctx.closePath();
      } else {
        ctx.moveTo(0, -3); // Start at the pivot point (6px wide)
        ctx.lineTo(-flipper.width, -1); // Taper to the tip (2px wide)
        ctx.lineTo(-flipper.width, 1);
        ctx.lineTo(0, 3);
        ctx.closePath();
      }
      ctx.fill();

      ctx.restore();
    });
  });
}

// Draw bottom lanes
function drawBottomLanes() {
  safeCtxOperation((ctx) => {
    ctx.beginPath();
    bottomLanes.forEach(lane => {
      ctx.moveTo(lane.x1, lane.y1);
      ctx.lineTo(lane.x2, lane.y2);
    });
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.stroke();
  });
}

// Draw the top-right corner lane as per specs
function drawTopRightLane() {
  safeCtxOperation((ctx) => {
    ctx.beginPath();
    // Quarter-circle centered at (400, 200)
    ctx.arc(400, 200, 200, -Math.PI/2, 0);
    ctx.lineWidth = 2; // 2px thickness as per specs
    ctx.strokeStyle = 'black';
    ctx.stroke();
  });
}

// Draw the top-left corner lane as per specs
function drawTopLeftLane() {
  safeCtxOperation((ctx) => {
    ctx.beginPath();
    // Quarter-circle centered at (100, 100)
    ctx.arc(100, 100, 100, -Math.PI, -Math.PI/2);
    ctx.lineWidth = 2; // 2px thickness as per specs
    ctx.strokeStyle = 'black';
    ctx.stroke();
  });
}

// Define bumpers to meet the specs
const bumpers = [
  { x: 150, y: 150, radius: 24, color: 'red' },
  { x: 300, y: 100, radius: 24, color: 'red' },
  { x: 450, y: 150, radius: 24, color: 'red' }
];

// Draw bumpers
function drawBumpers() {
  bumpers.forEach(bumper => {
    safeCtxOperation((ctx) => {
      // Draw outer red circle
      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2);
      ctx.fillStyle = bumper.color; // Red color
      ctx.fill();
      ctx.closePath();

      // Draw inner white circle
      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, 20, 0, Math.PI * 2); // Radius of 20px
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.closePath();
    });
  });
}

// Update ball position
function updateBall() {
  if (!ball.launched) return;

  // Update position first
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Apply gravitational acceleration
  ball.dy += gravity;

  // Improved collision detection with walls
  // Right wall
  if (ball.x + ball.radius > canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.dx = -Math.abs(ball.dx) * WALL_BOUNCE_COEFFICIENT;
  }
  // Left wall
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.dx = Math.abs(ball.dx) * WALL_BOUNCE_COEFFICIENT;
  }
  // Top wall
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.dy = Math.abs(ball.dy) * WALL_BOUNCE_COEFFICIENT;
  }

  // Check for collision with flippers
  checkFlipperCollision();

  // Check for collision with the corner lanes
  checkTopRightLaneCollision();
  checkTopLeftLaneCollision();

  // Check for collision with bottom lanes
  checkBottomLanesCollision();

  // Check for collision with bumpers
  checkBumperCollision();

  // Reset ball if it falls below the canvas
  if (ball.y - ball.radius > canvas.height) {
    resetBall();
  }
}

// Update flipper collision logic to prevent the ball from passing through
function checkFlipperCollision() {
  flippers.forEach((flipper, index) => {
    // Simplified collision detection
    const flipperX = index === 0 ? flipper.x + flipper.width / 2 : flipper.x + flipper.width / 2;
    const flipperY = flipper.y;

    // Calculate distance between ball and flipper (simplified)
    const dx = ball.x - flipperX;
    const dy = ball.y - flipperY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If collision detected
    if (distance < ball.radius + flipper.height) {
      // Reflect the ball's velocity
      ball.dy = -Math.abs(ball.dy) * (flipper.target === 'up' ? FLIPPER_MOVING_BOUNCE_COEFFICIENT : FLIPPER_STATIC_BOUNCE_COEFFICIENT); // Moving or not moving flipper

      // Add upward velocity if the flipper is moving
      if (flipper.target === 'up') {
        ball.dy -= 6; // Add extra upward velocity
      }

      // Adjust ball position to stay above the flipper
      ball.y = flipperY - ball.radius - flipper.height;

      // Increase score for flipper hits
      score += 10;
      updateScore();
    }
  });
}

// Check for collision with bottom lanes
function checkBottomLanesCollision() {
  bottomLanes.forEach(lane => {
    // Line segment distance calculation
    const x1 = lane.x1;
    const y1 = lane.y1;
    const x2 = lane.x2;
    const y2 = lane.y2;

    // Vector from line start to ball
    const vx = ball.x - x1;
    const vy = ball.y - y1;

    // Vector representing the line
    const lineVx = x2 - x1;
    const lineVy = y2 - y1;

    // Length of the line squared
    const lineLenSquared = lineVx * lineVx + lineVy * lineVy;

    // Calculate projection of ball position onto the line
    let t = (vx * lineVx + vy * lineVy) / lineLenSquared;
    t = Math.max(0, Math.min(1, t));

    // Closest point on line to ball
    const closestX = x1 + t * lineVx;
    const closestY = y1 + t * lineVy;

    // Distance from ball to closest point
    const distance = Math.sqrt(
      (ball.x - closestX) * (ball.x - closestX) +
      (ball.y - closestY) * (ball.y - closestY)
    );

    // Check if collision occurred (ball radius + line thickness/2)
    // Update bounce coefficient and add offset to prevent sticking
    if (distance < ball.radius + 1) {
      // Calculate normal vector to the line
      const normalX = ball.y - closestY;
      const normalY = -(ball.x - closestX);

      // Normalize the normal vector
      const normalLen = Math.sqrt(normalX * normalX + normalY * normalY);
      const unitNormalX = normalX / normalLen;
      const unitNormalY = normalY / normalLen;

      // Calculate dot product of ball velocity and normal
      const dot = ball.dx * unitNormalX + ball.dy * unitNormalY;

      // Reflect ball velocity across the normal
      ball.dx = ball.dx - 2 * dot * unitNormalX;
      ball.dy = ball.dy - 2 * dot * unitNormalY;

      // Adjust velocity to consider both the ball's direction and the lane's angle
      const laneAngle = Math.atan2(lineVy, lineVx); // Angle of the lane
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = speed * Math.cos(laneAngle) * Math.sign(ball.dx); // Preserve horizontal direction
      ball.dy = speed * Math.sin(laneAngle);

      // Slightly reduce speed to simulate energy loss
      ball.dx *= LANE_BOUNCE_COEFFICIENT; // Increased bounce coefficient to prevent sticking
      ball.dy *= LANE_BOUNCE_COEFFICIENT; // Increased bounce coefficient to prevent sticking

      // Add a small offset to the ball's position to prevent sticking
      ball.x += unitNormalX * 2; // Push the ball slightly away from the lane
      ball.y += unitNormalY * 2; // Push the ball slightly away from the lane

      // Increase score by 0 points for hitting the lane
    }
  });
}

// Check for collision with the top-right corner lane
function checkTopRightLaneCollision() {
  const laneCenterX = 400;
  const laneCenterY = 200;
  const laneRadius = 200;

  const dx = ball.x - laneCenterX;
  const dy = ball.y - laneCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (Math.abs(distance - laneRadius) < ball.radius + 2) {
    if (ball.x >= laneCenterX && ball.y <= laneCenterY) {
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = -speed * 0.7;
      ball.dy = -speed * 0.7;
    }
  }
}

// Check for collision with the top-left corner lane
function checkTopLeftLaneCollision() {
  // Lane is centered at (100, 100) with radius 100
  const laneCenterX = 100;
  const laneCenterY = 100;
  const laneRadius = 100;
  
  // Calculate distance from ball to lane center
  const dx = ball.x - laneCenterX;
  const dy = ball.y - laneCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Check if ball is near the lane's path (allowing for some tolerance)
  if (Math.abs(distance - laneRadius) < ball.radius + 2) {
    // Make sure the ball is in the top-left quadrant
    if (ball.x <= laneCenterX && ball.y <= laneCenterY) {
      // Calculate angle of impact (angle between center and ball)
      const angle = Math.atan2(dy, dx);
      
      // Calculate tangent angle (perpendicular to radius at point of impact)
      const tangentAngle = angle + Math.PI / 2;
      
      // Set ball's velocity to follow the tangent
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = Math.cos(tangentAngle) * speed;
      ball.dy = Math.sin(tangentAngle) * speed;
      
      // Score points for hitting the lane
      score += 5;
      updateScore(); // Update the score display
    }
  }
}

// Check for collision with bumpers
function checkBumperCollision() {
  bumpers.forEach(bumper => {
    const dx = ball.x - bumper.x;
    const dy = ball.y - bumper.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ball.radius + bumper.radius) {
      // Calculate normal vector
      const normalX = dx / distance;
      const normalY = dy / distance;

      // Reposition the ball to the edge of the bumper
      const overlap = ball.radius + bumper.radius - distance;
      ball.x += normalX * overlap;
      ball.y += normalY * overlap;

      // Reflect ball velocity with a slight random variation
      const dot = ball.dx * normalX + ball.dy * normalY;
      const randomVariation = (Math.random() - 0.5) * 0.2; // Random variation between -0.1 and 0.1
      ball.dx = ball.dx - 2 * dot * normalX + randomVariation;
      ball.dy = ball.dy - 2 * dot * normalY + randomVariation;

      ball.dx = ball.dx * BUMPER_BOUNCE_COEFFICIENT; // Bounce coefficient for bumpers
      ball.dy = ball.dy * BUMPER_BOUNCE_COEFFICIENT; // Bounce coefficient for bumpers

      // Slightly reduce speed to simulate energy loss
      ball.dx *= 0.9;
      ball.dy *= 0.9;

      // Add score for hitting a bumper
      score += 30; // Increase score by 30 for bumper hits
      updateScore();
    }
  });
}

// Launch ball with random speed and angle offset
function launchBall() {
  ball.launched = true;
  ball.dx = 0;

  // Random speed between 15 and 20
  const randomSpeed = 15 + Math.random() * 5;

  // Random angle offset between 0 and 5 degrees (converted to radians)
  const angleOffset = (Math.random() * 5) * (Math.PI / 180);

  // Calculate dx and dy based on the angle offset
  ball.dx = randomSpeed * Math.sin(angleOffset); // Horizontal component
  ball.dy = -randomSpeed * Math.cos(angleOffset); // Vertical component (negative for upward)
}

// Gradual angle change for flippers
const flipperSpeed = 0.1; // Adjusted speed for smoother gradual movement

function updateFlipperAngles() {
  flippers.forEach((flipper, index) => {
    const targetAngle = index === 0 ? (flipper.target === 'up' ? -Math.PI / 6 : Math.PI / 6) : (flipper.target === 'up' ? Math.PI / 6 : -Math.PI / 6);
    if (flipper.angle !== targetAngle) {
      const angleDiff = targetAngle - flipper.angle;
      flipper.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), flipperSpeed);
    }
  });
}

// Update flipper controls to set target angles
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    flippers[0].target = 'up'; // Set target for left flipper
  } else if (e.key === 'ArrowRight') {
    flippers[1].target = 'up'; // Set target for right flipper
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') {
    flippers[0].target = 'down'; // Return left flipper to original position
  } else if (e.key === 'ArrowRight') {
    flippers[1].target = 'down'; // Return right flipper to original position
  }
});

// Add event listener for space key to launch the ball
window.addEventListener('keydown', (e) => {
  if (e.key === ' ') { // Space key
    if (!ball.launched) {
      launchBall();
    }
  }
});

// Add on-screen launch button functionality
document.addEventListener('DOMContentLoaded', () => {
  const launchButton = document.querySelector('button:nth-child(3)');
  if (launchButton) {
    launchButton.addEventListener('click', () => {
      if (!ball.launched) {
        launchBall();
      }
    });
  }
});

// Add event listeners for on-screen buttons
document.addEventListener('DOMContentLoaded', () => {
  // Left flipper button
  const leftFlipperButton = document.querySelector('button:nth-child(1)');
  if (leftFlipperButton) {
    leftFlipperButton.addEventListener('mousedown', () => {
      flippers[0].angle = -Math.PI / 6;
    });
    leftFlipperButton.addEventListener('mouseup', () => {
      flippers[0].angle = 0;
    });
    leftFlipperButton.addEventListener('mouseleave', () => {
      flippers[0].angle = 0;
    });
  }

  // Right flipper button
  const rightFlipperButton = document.querySelector('button:nth-child(2)');
  if (rightFlipperButton) {
    rightFlipperButton.addEventListener('mousedown', () => {
      flippers[1].angle = Math.PI / 6;
    });
    rightFlipperButton.addEventListener('mouseup', () => {
      flippers[1].angle = 0;
    });
    rightFlipperButton.addEventListener('mouseleave', () => {
      flippers[1].angle = 0;
    });
  }

  // Launch button
  const launchButton = document.querySelector('button:nth-child(3)');
  if (launchButton) {
    launchButton.addEventListener('click', () => {
      if (!ball.launched) {
        launchBall();
      }
    });
  }

  // Initialize score display
  updateScore();
  updateBalls(remainingBalls);
});

// Reset ball if it falls below the canvas
function resetBall() {
  remainingBalls -= 1;
  updateBalls(remainingBalls);

  if (remainingBalls <= 0) {
    resetGame();
  } else {
    ball.launched = false;
    ball.x = canvas.width - 22; // Reset to above the plunger
    ball.y = canvas.height - 90;
    ball.dx = 0;
    ball.dy = 0;
  }
}

// Draw plunger in the bottom right corner of the canvas
function drawPlunger() {
  safeCtxOperation((ctx) => {
    const plungerWidth = 24;
    const plungerHeight = 72;
    const plungerX = canvas.width - plungerWidth - 10; // 10px padding from the right edge
    const plungerY = canvas.height - plungerHeight - 10; // 10px padding from the bottom edge

    ctx.fillStyle = 'gray';
    ctx.fillRect(plungerX, plungerY, plungerWidth, plungerHeight);
  });
}

// Update the game loop to include the plunger
let gameLoop = function() {
  safeCtxOperation((ctx) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
  drawBall();
  updateFlipperAngles(); // Gradually update flipper angles
  drawFlippers();
  drawTopRightLane();
  drawTopLeftLane();
  drawBottomLanes();
  drawBumpers();
  drawPlunger(); // Draw the plunger
  updateBall();
  checkBumperCollision();
  requestAnimationFrame(gameLoop);
};

gameLoop();

// Define missing constants
const WALL_BOUNCE_COEFFICIENT = 0.7;
const FLIPPER_MOVING_BOUNCE_COEFFICIENT = 1.2;
const FLIPPER_STATIC_BOUNCE_COEFFICIENT = 0.7;
const LANE_BOUNCE_COEFFICIENT = 0.7;
const BUMPER_BOUNCE_COEFFICIENT = 1.2;
