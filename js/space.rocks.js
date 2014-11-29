
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
		context.rotate(angle);
		context.drawImage(Sprite.image, corner.x, corner.y, size.x, size.y,
				-halfSize.x, -halfSize.y, size.x, size.y);
		context.setTransform(1, 0, 0, 1, 0, 0);
	};
	return sprite;
};

SpaceRocks.keyToAction = {
  65: 'left', 68: 'right', 87: 'up'
};

SpaceRocks.keydown = function (event) {
	var global = SpaceRocks;
  var code = event.keyCode,
      action = global.keyToAction[code];
  console.log(code);
  if (action == 'left') {
    console.log('left');
  } else if (action == 'right') {
    console.log('right');
  } else if (action == 'up') {
    console.log('up');
  }
};

SpaceRocks.update = function () {
	var global = SpaceRocks,
      canvas = global.canvas,
      context = global.context,
      ship = global.ship;
  context.clearRect(0, 0, canvas.width, canvas.height);
	ship.plainImage.draw(ship.pos, Math.PI/2);
};

SpaceRocks.load = function () {
	var global = SpaceRocks;

	var canvas = document.getElementById('mainCanvas');
	SpaceRocks.canvas = canvas;
	canvas.width = global.width;
	canvas.height = global.height;
	var canvasContainer = document.getElementById('mainCanvasContainer');
	SpaceRocks.canvasContainer = canvasContainer;
	canvasContainer.style.width = global.width + 'px';
	canvasContainer.style.height = global.height + 'px';
	var context = Sprite.context = SpaceRocks.context = canvas.getContext('2d');

	var ship = SpaceRocks.ship = {
		pos: {x: global.width / 2, y: global.height / 2},
		vel: {x: 0, y: 0},
		plainImage: Sprite.make({x: 70.5, y: 36.5}, {x: 135, y: 63}),
		thrustImage: Sprite.make({x: 70.5, y: 108.5}, {x: 135, y: 63})
	};

  document.onkeydown = SpaceRocks.keydown;

  window.setInterval(SpaceRocks.update, 16.666666);
};

window.onload = SpaceRocks.load;
