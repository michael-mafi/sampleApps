var snapped = false;
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var canvasWidth = 0;
  var canvasHeight = 0;
  var iterations = 0;

  // ==========================
  // Sprite Class
  // ==========================

  window.onresize = updateCanvasSize;

  window.break = function() {
    var index = 0;
    if (!snapped) {
      for (index; index < Sprite.total; index++) {
        Sprite.collection[index].type.backToStart = false;
        Sprite.collection[index].type.pong = true;
        Sprite.collection[index].type.orb = false;
      }
      snapped = true;
      document.getElementById("action").innerHTML = "G L U E";
    } else {
      for (index; index < Sprite.total; index++) {
        Sprite.collection[index].type.backToStart = true;
        Sprite.collection[index].type.pong = false;
        Sprite.collection[index].type.orb = true;
      }
      snapped = false;
      document.getElementById("action").innerHTML = "B R E A K";
    }
  }

  function Sprite(obj) {
    var property;
    Sprite.total++;
    this.index = Sprite.total;
    this.x = 0;
    this.y = 0;
    this.xStart = 0;
    this.yStart = 0;
    this.flag = 1;
    this.xOffset = 0;
    this.yOffset = 0;
    this.xdir = 1;
    this.ydir = 1;
    this.width = 10;
    this.height = 10;
    this.color = "0,0,0";
    this.alpha = 1;
    this.type = {
      "orb": false,
      "colorPulse": false,
      "backToStart": false,
      "pong": false
    };
    this.deg = 0;
    this.degSpeed = 0;
    this.orbWidth = 0;
    this.orbHeight = 0;
    this.collidable = false;
    this.colorPulse = {
      color: "",
      speed: 0
    };
    if (obj) {
      for (property in obj) {
        if (this.hasOwnProperty(property)) {
          this[property] = obj[property];
        }
      }
    }
    Sprite.collection.push(this);
  }
  Sprite.collection = [];
  Sprite.total = 0;

  // ==========================
  // Routines
  // ==========================

  init();

  function init() {
    updateCanvasSize();

    var degSpeed = 0;
    var degSpeedInc = .00003;
    var orbWidth = 0;
    var orbWidthInc = .15;
    var spriteTotal = 2000;
    var colorIndex = 0;

    // Generate some sprites
    for (x=0;x<spriteTotal;x++) {
      colorIndex = 255-Math.floor((x/spriteTotal)*255);
      degSpeed+=degSpeedInc;
      orbWidth+=orbWidthInc;
      new Sprite({
        width: 5,
        height: 5,
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        xStart: canvasWidth / 2,
        yStart: canvasHeight / 2,
        xdir: Math.random() * 1+3 * (Math.random() > .5 ? -1 : 1),
        ydir: Math.random() * 1+3 * (Math.random() > .5 ? -1 : 1),
        degSpeed: degSpeed,
        orbWidth: orbWidth,
        orbHeight: orbWidth,
        alpha: .5,
        colorPulse: {
          color: "red",
          speed: 1,
          value: Math.floor((x/spriteTotal) * 255)
        },
        type: {
          orb: true,
          colorPulse: true
        },
        collidable: false
      });
    }

    // Gotta go in when it looks cool, duh
    for (x=0;x<2000;x++) {
      calculateSprites();
    }

    run();
  }

  function run() {
    iterations++;
    if (iterations === 30) {
      window.break();
    }
    if (iterations === 80) {
      window.break();
    }
    var index = 0;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    calculateSprites();
    drawSprites();
    window.requestAnimationFrame(run);
  }

  function collisionDetect(sprite1, sprite2) {
    if (sprite1.x+sprite1.xOffset < sprite2.x+sprite2.xOffset + sprite2.width
    && sprite1.x+sprite1.xOffset + sprite1.width > sprite2.x+sprite2.xOffset
    && sprite1.y+sprite1.yOffset < sprite2.y+sprite2.yOffset + sprite2.height
    && sprite1.height + sprite1.y+sprite1.yOffset > sprite2.y+sprite2.yOffset) {
      return true;
    }
    return false;
  }

  function collisionDetected(sprite) {
    var index = 0;
    var foundCollision = false;
    // Worry about collisions later
    return false;
    for (index; index < Sprite.total; index++) {
      if (Sprite.collection[index].index === sprite.index || !Sprite.collection[index].collidable || Sprite.collection[index].flag === 0) {
        continue;
      }
      if (collisionDetect(sprite, Sprite.collection[index])) {
        foundCollision = true;
        break;
      }
    }
    return foundCollision;
  }

  function calculateSprites() {
    Sprite.collection.forEach(function(sprite) {
      if (sprite.flag === 0) {
        return;
      }

      if (sprite.type.backToStart) {
        sprite.x+=sprite.xdir;
        sprite.y+=sprite.ydir;
        if (sprite.x >= sprite.xStart) {
          sprite.xdir=-Math.abs(sprite.xdir);
        }
        if (sprite.x <= sprite.xStart) {
          sprite.xdir=Math.abs(sprite.xdir);
        }
        if (sprite.y >= sprite.yStart) {
          sprite.ydir=-Math.abs(sprite.ydir);
        }
        if (sprite.y <= sprite.yStart) {
          sprite.ydir=Math.abs(sprite.ydir);
        }

        // Lazy Course correction
        sprite.x+=sprite.xdir;
        sprite.y+=sprite.ydir;

      }

      if (sprite.type.colorPulse) {
        sprite.colorPulse.value+=sprite.colorPulse.speed;
        if (sprite.colorPulse.value >= 255 || sprite.colorPulse.value < 0) {
          sprite.colorPulse.speed = -sprite.colorPulse.speed;
        }
        sprite.colorPulse.value+=sprite.colorPulse.speed;
        if (sprite.colorPulse.color === "red") {
          sprite.color = sprite.colorPulse.value.toString() + ",0,0";
        }
        if (sprite.colorPulse.color === "green") {
          sprite.color = "0," + sprite.colorPulse.value.toString() + ",0";
        }
        if (sprite.colorPulse.color === "blue") {
          sprite.color = "0,0," + sprite.colorPulse.value.toString();
        }
      }

      if (sprite.type.orb) {
        sprite.deg+=sprite.degSpeed;
        sprite.xOffset = (Math.sin(sprite.deg) * sprite.orbWidth);
        sprite.yOffset = (Math.cos(sprite.deg) * sprite.orbHeight);
      }

      if (sprite.type.pong) {
        sprite.x+=sprite.xdir;
        sprite.y+=sprite.ydir;
        if (collisionDetected(sprite)) {
          sprite.xdir = -sprite.xdir;
          sprite.ydir = -sprite.ydir;
          sprite.x+=sprite.xdir;
          sprite.y+=sprite.ydir;
        } else {
          if (sprite.x+sprite.xdir+sprite.width >= canvasWidth || sprite.x + sprite.xdir <= 0) {
            sprite.xdir = -sprite.xdir;
          }
          if (sprite.y+sprite.ydir+sprite.height >= canvasHeight || sprite.y + sprite.ydir <= 0) {
            sprite.ydir = -sprite.ydir;
          }
        }
        if (sprite.xdir === 0 || sprite.ydir === 0) {
          sprite.flag = 0;
        }
      }

    });
  }

  function drawSprites() {
    Sprite.collection.forEach(function(sprite) {
      if (sprite.flag === 0) {
        return;
      }
      ctx.beginPath();
      ctx.fillStyle = "rgba(" + sprite.color + "," + sprite.alpha + ")";
      ctx.fillRect(sprite.x+sprite.xOffset, sprite.y+sprite.yOffset, sprite.width, sprite.height);
    });
  }

  function updateCanvasSize() {
    getCanvasDimensions();
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    var index = 0;



    // Because this a codepen and we just want it to look cool...
    for (index; index < Sprite.total; index++) {
      Sprite.collection[index].x = canvasWidth / 2;
      Sprite.collection[index].y = canvasHeight / 2;
      Sprite.collection[index].xStart = canvasWidth / 2;
      Sprite.collection[index].yStart = canvasHeight / 2;
    }

  }

  function getCanvasDimensions() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
  }