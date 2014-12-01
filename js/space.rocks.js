
var SpaceRocks = {
	width: 800, height: 600
};

var Sprite = {
	source: 'i/sprites.png'
};
Sprite.image = new Image();
Sprite.image.src = Sprite.source;
Sprite.make = function (center, size) {
	var sprite = {center: center, size: size},
			halfSize = {x: size.x/2, y: size.y/2},
			corner = {x: center.x - size.x/2, y: center.y - size.y/2},
			context = Sprite.context;
	sprite.draw = function (position, angle) {
		context.translate(position.x, position.y);
		context.rotate(Math.PI*angle/1800);
		context.drawImage(Sprite.image, corner.x, corner.y, size.x, size.y,
				-halfSize.x, -halfSize.y, size.x, size.y);
		context.setTransform(1, 0, 0, 1, 0, 0);
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
      context = global.context,
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
  }

  // Update ship according to eternal forces.
  ship.vel.x *= (1-ship.friction);
  ship.vel.y *= (1-ship.friction);
  ship.pos.x = (ship.pos.x + ship.vel.x + global.width) % global.width;
  ship.pos.y = (ship.pos.y + ship.vel.y + global.height) % global.height;

  context.clearRect(0, 0, canvas.width, canvas.height);
  global.tick += 1;
  var seconds = Math.floor(global.tick);
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
	ship.plainImage.draw(ship.pos, ship.angle);
};

SpaceRocks.load = function () {
	var global = SpaceRocks;

	var canvas = document.getElementById('mainCanvas');
	global.canvas = canvas;
	canvas.width = global.width;
	canvas.height = global.height;
	var canvasContainer = document.getElementById('mainCanvasContainer');
	global.canvasContainer = canvasContainer;
	canvasContainer.style.width = global.width + 'px';
	canvasContainer.style.height = global.height + 'px';
	var context = Sprite.context = global.context = canvas.getContext('2d');

	var ship = global.ship = {
		pos: {x: global.width / 2, y: global.height / 2},
		vel: {x: 0, y: 0},
    angle: 3600,
    thrust: 0.2, friction: 0.01,
		plainImage: Sprite.make({x: 70.5, y: 36.5}, {x: 135, y: 63}),
		thrustImage: Sprite.make({x: 70.5, y: 108.5}, {x: 135, y: 63})
	};

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
