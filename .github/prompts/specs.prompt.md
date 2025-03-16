# Pinball Game Specifications

## General Requirements
- Use `canvas#cv` element for the game view.
- Use `output#score` for showing the score.
- Use `output#balls` for showing the remaining balls.

## Cabinet Requirements
- Surround the canvas with a 2px thick black border to represent the cabinet.

## Lane Requirements
### Top-Left Corner Lane
- Draw a quarter-circle-shaped lane centered at `(x: 100px, y: 100px)`.
- Extend the lane from `(x: 100px, y: 0px)` to `(x: 0px, y: 100px)`.
- Set the lane's thickness to 2px.
- When the ball hits the lane, its direction should change to align with the lane's curve (following the tangent at the point of impact).
- Prevent the ball from getting embedded in the lane by repositioning it to the edge of the lane upon collision.
- The bounce coefficient is `0.5` when the ball hits the lane.

### Top-Right Corner Lane
- Draw a quarter-circle-shaped lane centered at `(x: 400px, y: 200px)`.
- Extend the lane from `(x: 400px, y: 0px)` to `(x: 600px, y: 200px)`.
- Set the lane's thickness to 2px.
- When the ball hits the lane, its direction should change to align with the lane's curve (following the tangent at the point of impact).
- Prevent the ball from getting embedded in the lane by repositioning it to the edge of the lane upon collision.
- The bounce coefficient is `0.5` when the ball hits the lane.

### Bottom Lanes
- Create a lane extending from the left flipper's pivot point toward the left wall.
- Create a lane extending from the right flipper's pivot point toward the right wall.
- Each lane should be 16px away from the respective wall and have a 30-degree incline.
- Increase the lane length to 200px.
- Make the ball change direction and bounce when it collides with the lanes, considering both the ball's direction and the lane's angle.
- Prevent the ball from getting embedded in the lane by repositioning it to the edge of the lane upon collision.
- The bounce coefficient is `0.7` when the ball hits the lane.

## Plunger Requirements
- Place a plunger in the bottom right corner of the screen with a width of 24px, a height of 72px, and a gray color.

## Ball Requirements
- Design the pinball as a 12px diameter ball with a simple color (e.g., black).
- Place the ball above the plunger.
- The ball can be launched from the plunger by pressing the space key or the on-screen launch button.
- The ball's initial speed when launched from the plunger should be randomly set between 15 and 20 units.
- The ball's launch angle should be randomly offset by 0 to 5 degrees from straight up.
- The ball should launch with its full speed.
- Make the ball bounce off the cabinet walls and flippers.
- Apply a downward gravity effect of 10 pixels per second squared to simulate realistic ball movement.
- The ball should naturally move and accelerate downward under the influence of gravitational acceleration.
- Gravity should continuously increase the ball's downward velocity over time.
- When the ball falls, it should return to the top of the plunger.
- When the ball is hit by a moving flipper, it should bounce upward.
- The bounce coefficient is `0.7` when the ball hits walls.

## Flipper Requirements
- Position two flippers 100px above the bottom of the canvas, with the center point between the two flippers aligned to the horizontal center of the canvas.
- Color the flippers blue.
- Set the flippers' thickness to 4px.
- Position each flipper tilted 30 degrees downward from its pivot point.
- Control the flippers using the left and right arrow keys.
- Rotate the left flipper upwards when the left key is pressed and return it to its original position when released.
- Rotate the right flipper clockwise when the right key is pressed and return it to its original position when released.
- Set the flippers' pivot points at one end, similar to real pinball machines.
- Ensure the flippers can hit the ball to keep it in play.
- Make the flippers' shape taper from the pivot point to the tip with the pivot being 6px wide and the tip 2px wide.
- Make the flipper's angle change gradually when moving.
- The bounce coefficient is `1.2` when the ball is hit by a moving flipper.
- The bounce coefficient is `0.7` when the ball is hit by a not moving flipper.

## Bumper Requirements
- Add circular bumpers to the game area to make the ball's movement more complex.
- Place 3 bumpers in the upper half of the game view.
- Each bumper should have a red outer circle with a radius of 24px.
- Each bumper should have a white inner circle with a radius of 20px.
- Prevent the ball from getting embedded in the bumper by repositioning it to the edge of the bumper upon collision.
- The bounce coefficient is `1.2` when the ball hits a bumper.

## Score System Requirements
- Use `output#score` for showing the score.
- Use `output#balls` for showing the remaining balls.
- Start with 3 balls remaining.
- Decrease remaining ball count by 1 when a ball falls out of play.
- Reset the score to 0, and the balls remaining to 3 when the remaining ball count reaches 0.
- Increase the score by 10 points each time the ball hits a flipper.
- Increase the score by 30 points each time the ball hits bumpers.
- Increase the score by 0 points each time the ball hits the cabinet or any lanes.

## Control Requirements
- Add on-screen buttons for controlling the flippers.
- Include a left button for the left flipper and a right button for the right flipper.
- Place the buttons directly below the canvas.

## General Collision Requirements
- Ensure the ball does not overlap with any game objects (e.g., lanes, walls, bumpers, flippers, or the plunger).
- Reposition the ball to the edge of the object upon collision to prevent embedding or overlap.
- Adjust the ball's velocity to reflect the collision and ensure it moves away from the object.
- Apply a small positional offset to the ball after collision to avoid repeated collisions in the same frame.
