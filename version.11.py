import simplegui
import math, random

WIDTH, HEIGHT = 800, 600
HEIGHT = 600
lives, score = 3, 0
time = 0.5

class ImageInfo:
  def __init__(self, image, center, size, radius=0, animated=False):
    self.image = image
    self.center, self.size, self.radius = center, size, radius
    self.animated = animated

debris_source = simplegui.load_image("http://dl.dropbox.com/s/mweiyzhblrg1qxm/debris.png")
debris_image = ImageInfo(debris_source, [400, 300], [800, 600])
nebula_source = simplegui.load_image("http://dl.dropbox.com/s/u1zc7wne2xzquim/background.png")
nebula_image = ImageInfo(nebula_source, [400, 300], [800, 600])
sprite_source = simplegui.load_image("http://dl.dropbox.com/s/5235h827al08dhx/sprites.png")
ship_plain_image = ImageInfo(sprite_source, [70.5, 36.5], [135, 63], 35)
ship_thrust_image = ImageInfo(sprite_source, [70.5, 108.5], [135, 63], 35)
missile_image = ImageInfo(sprite_source, [162.5, 108], [55, 22], 3, 50)
rock_image = ImageInfo(sprite_source, [175.5, 34], [61, 64], 40)
images = [debris_source, nebula_source, sprite_source]
soundtrack = simplegui.load_sound(
    "http://commondatastorage.googleapis.com/codeskulptor-assets/sounddogs/soundtrack.mp3")
missile_sound = simplegui.load_sound(
    "http://dl.dropbox.com/s/57vppejin937joy/shoot.a.mp3?")
missile_sound.set_volume(0.5)
ship_thrust_sound = simplegui.load_sound(
    "http://dl.dropbox.com/s/5e4dbwc2bz6aebd/thrust.b.mp3")
explosion_sound = simplegui.load_sound(
    "http://commondatastorage.googleapis.com/codeskulptor-assets/sounddogs/explosion.mp3")


class Ship:
  def __init__(self, pos, vel, plain_image, thrust_image):
    self.pos, self.vel = list(pos), list(vel)
    self.plain_image, self.thrust_image = plain_image, thrust_image
    self.thrusting = False
    self.angle = 0
    self.friction = 0.01
    self.thrust = 0.2
    self.shoot_timer = None
    
  def draw(self, canvas):
    if keys['up']:
      if not self.thrusting:
        self.thrusting = True
      image = self.thrust_image
      ship_thrust_sound.play()
    else:
      if self.thrusting:
        self.thrusting = False
        ship_thrust_sound.rewind()
      image = self.plain_image
    canvas.draw_image(image.image,
        image.center, image.size, self.pos, image.size, self.angle)
  
  def shoot(self):
    pos = self.pos
    speed = 7.5
    vel = [self.vel[0] + math.cos(self.angle)*speed,
         self.vel[1] + math.sin(self.angle)*speed]
    missile = Sprite(pos, vel, self.angle, 0, missile_image, 50)
    missiles.append(missile)
    missile_sound.rewind()
    missile_sound.play()

  def update(self, canvas):
    if keys['space']:
      if not self.shoot_timer:
        self.shoot()
        self.shoot_timer = simplegui.create_timer(300, self.shoot)
        self.shoot_timer.start()
    elif self.shoot_timer:
      self.shoot_timer.stop()
      self.shoot_timer = None
    if keys['left'] and not keys['right']:
      self.angle = (self.angle - 0.1) % (2*math.pi)
    if keys['right'] and not keys['left']:
      self.angle = (self.angle + 0.1) % (2*math.pi)    
    if keys['up']:
      self.vel[0] += math.cos(self.angle)*self.thrust
      self.vel[1] += math.sin(self.angle)*self.thrust
    for i in range(2):
      self.vel[i] *= 1-self.friction
    self.pos[0] = (self.pos[0] + self.vel[0]) % WIDTH
    self.pos[1] = (self.pos[1] + self.vel[1]) % HEIGHT
    self.draw(canvas)

class Sprite:
  def __init__(self, pos, vel, angle, angle_delta, image, lifespan=-1, sound=None):
    self.pos, self.vel = list(pos), list(vel)
    self.angle, self.angle_delta = angle, angle_delta
    self.image = image
    self.lifespan = lifespan
    self.age = 0
    if sound:
      sound.rewind()
      sound.play()
   
  def draw(self, canvas):
    image = self.image
    canvas.draw_image(image.image,
        image.center, image.size, self.pos, image.size, self.angle)
  
  def update(self, canvas):
    self.pos[0] = (self.pos[0] + self.vel[0]) % WIDTH
    self.pos[1] = (self.pos[1] + self.vel[1]) % HEIGHT
    self.angle = (self.angle + self.angle_delta) % (2*math.pi)
    self.age += 1
    self.draw(canvas)


def draw(canvas):
  global time, missiles
  for image in images:
    if image.get_width() == 0:
      canvas.draw_text('loading images...', (200, 200), 36, '#fff', 'sans-serif')
      return
  time += 1
  wtime = (time / 4.0) % WIDTH
  center = debris_image.center
  size = debris_image.size
  canvas.draw_image(nebula_image.image, nebula_image.center, nebula_image.size,
      [WIDTH / 2, HEIGHT / 2], [WIDTH, HEIGHT])
  canvas.draw_image(debris_image.image, center, size,
      (wtime - WIDTH / 2, HEIGHT / 2), (WIDTH, HEIGHT))
  canvas.draw_image(debris_image.image, center, size,
      (wtime + WIDTH / 2, HEIGHT / 2), (WIDTH, HEIGHT))
  canvas.draw_text('%d lives' % lives, (30, 50), 36, '#fff', 'sans-serif')
  score_text = 'score %d' % score
  score_width = frame.get_canvas_textwidth(score_text, 36, 'sans-serif')
  canvas.draw_text(score_text, (WIDTH-30-score_width, 50), 36, '#fff', 'sans-serif')
  a_rock.update(canvas)
  next_missiles = []
  for missile in missiles:
    if missile.age != missile.lifespan:
      missile.update(canvas)
      next_missiles.append(missile)
  missiles = next_missiles
  my_ship.update(canvas)

keys = {'left': False, 'up': False, 'right': False, 'space': False}

def keydown(code):
  for key in keys:
    if code == simplegui.KEY_MAP[key]:
      keys[key] = True
      
def keyup(code):      
  for key in keys:
    if code == simplegui.KEY_MAP[key]:
      keys[key] = False

def spawn_rock():
  global a_rock
  pos = [random.randrange(WIDTH+1), random.randrange(HEIGHT+1)]
  speed = random.randrange(5, 26) / 10.0
  angle = (random.randrange(100)/100.0 * 4 - 2) * math.pi
  vel = [math.cos(angle)*speed, math.sin(angle)*speed]
  angle_delta = (random.randrange(21) - 10)/100.0
  #print('speed = %.3f, angle = %.3f, angle_delta = %.3f' % (speed, angle, angle_delta))  
  a_rock = Sprite(pos, vel, 0, angle_delta, rock_image)

frame = simplegui.create_frame("Asteroids", WIDTH, HEIGHT)

spawn_rock()
missiles = []
my_ship = Ship([WIDTH / 2, HEIGHT / 2], [0, 0], ship_plain_image, ship_thrust_image)

frame.set_draw_handler(draw)
frame.set_keydown_handler(keydown)
frame.set_keyup_handler(keyup)
simplegui.create_timer(1000.0, spawn_rock).start()
frame.start()
