
var SpaceRocks = {
	width: 960, height: 720
};

var Sprite = {
	source: 'i/sprites.png'
};
Sprite.image = new Image();
Sprite.image.src = Sprite.source;
Sprite.make = function (corner, size, context, points) {
	var center = { x: corner.x + size.x/2, y: corner.y + size.y/2 },
      sprite = { center: center, size: size, context: context },
			halfSize = { x: size.x/2, y: size.y/2 },
      points = points;
  if (points !== undefined) {
    for (var i = 0; i < points.length; ++i) {
      points[i].x -= halfSize.x - 0.5;
      points[i].y -= halfSize.y - 0.5;
    }
  }
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
    if (points !== undefined) {
      context.beginPath();
      context.strokeStyle = '#444';
      var n = points.length;
      context.moveTo(points[n-1].x, points[n-1].y);
      for (var i = 0; i < n; ++i) {
        context.lineTo(points[i].x, points[i].y);
      }
      context.stroke();
    }
		context.setTransform(1, 0, 0, 1, 0, 0);
    if (alpha !== 1) {
      context.globalAlpha = saveAlpha;
    }
	};
	return sprite;
};

var Rock = {
  corner: { x: 144, y: 1 }, size: { x: 62, y: 66 },
  points: [{ x: 2, y: 37 }, { x: 5, y: 32 }, { x: 5, y: 18 }, { x: 11, y: 12 },
      { x: 11, y: 11 }, { x: 14, y: 7 }, { x: 16, y: 6 }, { x: 33, y: 6 },
      { x: 40, y: 2 }, { x: 46, y: 2 }, { x: 48, y: 3 }, { x: 51, y: 5 },
      { x: 52, y: 11 }, { x: 56, y: 14 }, { x: 58, y: 16 }, { x: 58, y: 22 },
      { x: 60, y: 24 }, { x: 60, y: 29 }, { x: 58, y: 32 }, { x: 58, y: 36 },
      { x: 60, y: 41 }, { x: 60, y: 46 }, { x: 59, y: 49 }, { x: 51, y: 57 },
      { x: 48, y: 58 }, { x: 43, y: 59 }, { x: 37, y: 60 }, { x: 32, y: 61 },
      { x: 25, y: 63 }, { x: 17, y: 63 }, { x: 14, y: 60 }, { x: 7, y: 60 },
      { x: 3, y: 57 }, { x: 2, y: 43 }, { x: 2, y: 37 }, { x: 5, y: 32 }]
};
Rock.spawn = function (sprite) {
  if (sprite === undefined) {
    sprite = Rock.sprite;  // Assuming this was added to Rock. Awful kludge!
  }
  var global = SpaceRocks,
      minRotVel = 3, maxRotVel = 33, rotDir = (Math.random() < 0.5 ? -1 : 1),
      minSpeed = 0.5, maxSpeed = 2.5,
      speed = minSpeed + Math.random() * (maxSpeed - minSpeed),
      dir = Math.random() * 2 * Math.PI;
  return {
      pos: { x: global.width * 1/4, y: global.height * 1/4 },
      vel: { x: Math.cos(dir) * speed, y: Math.sin(dir) * speed },
      rot: Math.random() * 3600,
      rotVel: rotDir * (minRotVel + Math.random()*(maxRotVel - minRotVel)),
      sprite: sprite
  };
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
      ship = global.ship,
      rocks = global.rocks;

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
  // Update ship according to environmental forces.
  ship.vel.x *= (1-ship.friction);
  ship.vel.y *= (1-ship.friction);
  ship.pos.x = (ship.pos.x + ship.vel.x + global.width) % global.width;
  ship.pos.y = (ship.pos.y + ship.vel.y + global.height) % global.height;

  // Update rocks.
  for (var i = 0; i < rocks.length; ++i) {
    var rock = rocks[i];
    rock.rot = (rock.rot + rock.rotVel + 3600) % 3600;
    rock.pos.x = (rock.pos.x + rock.vel.x + global.width) % global.width;
    rock.pos.y = (rock.pos.y + rock.vel.y + global.height) % global.height;
  }

  // Paint background.
  context.drawImage(global.background, 0, 0);
  // Display time.
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
  // Render ship.
  if (ship.underThrust) {
    ship.sprite.whoosh.draw(ship.pos, ship.angle*Math.PI/1800);
  } else {
    ship.sprite.cruise.draw(ship.pos, ship.angle*Math.PI/1800);
  }
  if (minutes == 3) {
    SpaceRocks.stop();
  }
  // Render rocks.
  for (var i = 0; i < rocks.length; ++i) {
    var rock = rocks[i], sprite = rock.sprite;
    sprite.draw(rock.pos, rock.rot*Math.PI/1800);
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
    sprite: {
      cruise: Sprite.make({ x: 3, y: 5 }, { x: 135, y: 63 }, context),
      whoosh: Sprite.make({ x: 3, y: 77 }, { x: 135, y: 63 }, context)
    }
	};

  var rocks = global.rocks = [];
  Rock.sprite = Sprite.make(Rock.corner, Rock.size, context, Rock.points);
  for (var i = 0; i < 6; ++i) {
    rocks.push(Rock.spawn());
  }

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
        { x: i * starSize.x, y: 150 },
        starSize, background.context));
  }
  var numStars = Math.floor(background.width*background.height/1000),
      maxStarX = 10, minStarX = 3,
      maxScale = maxStarX / starSize.x, minScale = minStarX / starSize.x,
      minAlpha = 0.1, maxAlpha = 0.8;
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
