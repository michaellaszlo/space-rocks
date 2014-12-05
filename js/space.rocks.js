
var SpaceRocks = {
	width: 960, height: 720
};

var Sprite = {
	source: 'i/sprites.png'
};
Sprite.image = new Image();
Sprite.image.src = Sprite.source;
Sprite.make = function (center, size, context) {
	var sprite = {center: center, size: size, context: context},
			halfSize = {x: size.x/2, y: size.y/2},
			corner = {x: center.x - size.x/2, y: center.y - size.y/2};
	sprite.draw = function (position, angle, scale, alpha) {
    scale = (scale === undefined ? 1 : scale);
    alpha = (alpha === undefined ? 1 : alpha);
    if (alpha !== 1) {
      var saveAlpha = context.globalAlpha;
      context.globalAlpha = alpha;
    }
		context.translate(position.x, position.y);
		context.rotate(angle);
		context.drawImage(Sprite.image,
        corner.x, corner.y, size.x, size.y,
				-halfSize.x*scale, -halfSize.y*scale, size.x*scale, size.y*scale);
		context.setTransform(1, 0, 0, 1, 0, 0);
    if (alpha !== 1) {
      context.globalAlpha = saveAlpha;
    }
	};
	return sprite;
};

SpaceRocks.keyToAction = {
  65: 'left', 68: 'right', 87: 'forward'
};
SpaceRocks.activeKeys = {};

SpaceRocks.keyDownHandler = function (event) {
	var global = SpaceRocks;
  var code = event.keyCode,
      action = global.keyToAction[code];
  if (action !== undefined) {
    global.activeKeys[action] = true;
  }
};
SpaceRocks.keyUpHandler = function (event) {
	var global = SpaceRocks;
  var code = event.keyCode,
      action = global.keyToAction[code];
  if (action !== undefined) {
    global.activeKeys[action] = false;
  }
};

SpaceRocks.update = function () {
	var global = SpaceRocks,
      canvas = global.canvas,
      context = canvas.context,
      ship = global.ship;

  // Update ship in response to user input.
  if (global.activeKeys['left'] && !global.activeKeys['right']) {
    ship.angle = (ship.angle - 60 + 3600) % 3600;
  } else if (global.activeKeys['right'] && !global.activeKeys['left']) {
    ship.angle = (ship.angle + 60) % 3600;
  }
  if (global.activeKeys['forward']) {
    var radians = ship.angle/1800*Math.PI;
    ship.vel.x += Math.cos(radians)*ship.thrust;
    ship.vel.y += Math.sin(radians)*ship.thrust;
    ship.underThrust = true;
  } else {
    ship.underThrust = false;
  }

  // Update ship according to eternal forces.
  ship.vel.x *= (1-ship.friction);
  ship.vel.y *= (1-ship.friction);
  ship.pos.x = (ship.pos.x + ship.vel.x + global.width) % global.width;
  ship.pos.y = (ship.pos.y + ship.vel.y + global.height) % global.height;

  context.drawImage(global.background, 0, 0);
  global.tick += 1;
  var seconds = Math.floor(global.tick/global.hertz);
      minutes = Math.floor(seconds/60),
      hours = Math.floor(minutes/60);
  minutes %= 60;
  seconds %= 60;
  if (hours > 0) {
    var timeString = hours + ':' + Math.floor(minutes/10) + minutes%10 + ':' +
        Math.floor(seconds/10) + seconds%10;
  } else if (minutes > 0) {
    var timeString = minutes + ':' + Math.floor(seconds/10) + seconds%10;
  } else {
    var timeString = seconds;
  }
  context.fillText(timeString, 20, 30);
  if (ship.underThrust) {
    ship.thrustImage.draw(ship.pos, Math.PI*ship.angle/1800);
  } else {
    ship.plainImage.draw(ship.pos, Math.PI*ship.angle/1800);
  }
  if (minutes == 3) {
    SpaceRocks.stop();
  }
};

SpaceRocks.load = function () {
	var global = SpaceRocks;

	var canvas = global.canvas = document.getElementById('mainCanvas');
	canvas.width = global.width;
	canvas.height = global.height;
	var canvasContainer = document.getElementById('mainCanvasContainer');
	global.canvasContainer = canvasContainer;
	canvasContainer.style.width = global.width + 'px';
	canvasContainer.style.height = global.height + 'px';
	var context = canvas.context = canvas.getContext('2d');

	var ship = global.ship = {
		pos: { x: global.width / 2, y: global.height / 2 },
		vel: { x: 0, y: 0 },
    angle: 3600,
    thrust: 0.2, friction: 0.01,
		plainImage: Sprite.make({ x: 70.5, y: 36.5 }, { x: 135, y: 63 }, context),
		thrustImage: Sprite.make({ x: 70.5, y: 108.5 }, { x: 135, y: 63 }, context)
	};

  // Draw background.
	var background = document.getElementById('backgroundCanvas');
  global.background = background;
  background.width = global.width;
  background.height = global.height;
  background.context = background.getContext('2d');
  background.context.fillStyle = '#0f2741';
  background.context.fillRect(0, 0, background.width, background.height);
  var numStarTypes = 8,
      starSprites = [],
      starSize = { x: 64, y: 60 };
  for (var i = 0; i < numStarTypes; ++i) {
    starSprites.push(Sprite.make(
        { x: starSize.x*(0.5 + i), y: 150 + 0.5*starSize.y },
        starSize, background.context));
  }
  var numStars = Math.floor(background.width*background.height/1000),
      maxStarX = 10, minStarX = 3,
      maxScale = maxStarX / starSize.x, minScale = minStarX / starSize.x,
      minAlpha = 0.2, maxAlpha = 1;
  for (var i = 0; i < numStars; ++i) {
    var position = { x: Math.round(Math.random()*background.width),
                     y: Math.round(Math.random()*background.height) },
        angle = Math.floor(Math.random()*2*Math.PI),
        scaleFactor = Math.random(),
        scale = minScale + scaleFactor*(maxScale - minScale),
        alpha = minAlpha + (1-scaleFactor)*(maxAlpha - minAlpha);
        starType = Math.floor(Math.random()*numStarTypes),
    starSprites[starType].draw(position, angle, scale, alpha);
  }

  document.onkeydown = global.keyDownHandler;
  document.onkeyup = global.keyUpHandler;
  context.fillStyle = '#ccc';
  context.font = '20px sans-serif';
  global.hertz = 60;
  global.tick = 0;
  global.updateIntervalID = window.setInterval(SpaceRocks.update,
      1000/global.hertz);
};

SpaceRocks.stop = function () {
  window.clearInterval(SpaceRocks.updateIntervalID);
};

window.onload = SpaceRocks.load;
