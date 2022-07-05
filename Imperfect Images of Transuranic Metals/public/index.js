// Imperfect Representations of Transuranic Metals
// 2022 Mandy Brigwell

var nameOfPiece = "Imperfect Images of Transuranic Metals";
var shortNameOfPiece = "ImperfectImages";

let randomSeedValue = ~~(fxrand() * 12345);
let noiseSeedValue = ~~(fxrand() * 56789);
let screenSize;

var mainCanvas, graphics, renderBuffer, staticLayer;
var fullRes = 1024;

var sphereCount = ~~(fxrand() * fxrand() * 8) + 4;
var xRotation = fxrand();
var yRotation = fxrand();
var zRotation = fxrand();
var graphicsHue = ~~(fxrand() * 360);
var choices = [16, 24, 32, 32, 64, 128];
var xChoice = choices[~~(fxrand() * choices.length)];
var yChoice = choices[~~(fxrand() * choices.length)];
var zChoice = choices[~~(fxrand() * choices.length)];
var backgroundRotationRange = fxrand() * fxrand() * fxrand();
var textAlpha = 0;
var textTargetAlpha = 0;
var textOverlay;

// fxhash features
window.$fxhashFeatures = {
  Protons: ~~xChoice,
  Neutrons: ~~yChoice,
  Electrons: ~~zChoice,
  "Half-life": sphereCount,
};

function setup() {
  pixelDensity(1);
  randomSeed(randomSeedValue);
  noiseSeed(noiseSeedValue);
  
  screenSize = min(windowWidth, windowHeight);
  mainCanvas = createCanvas(screenSize, screenSize);
  colorMode(HSB, 360);
  imageMode(CENTER);

  // Graphics buffer
  graphics = createGraphics(fullRes, fullRes, WEBGL);
  graphics.colorMode(HSB, 360);
  graphics.imageMode(CENTER);
  graphics.ortho();

  // renderBuffer
  renderBuffer = createGraphics(fullRes, fullRes);
  renderBuffer.colorMode(HSB, 360);
  renderBuffer.imageMode(CENTER);

  // Static layer buffer
  staticLayer = createGraphics(fullRes, fullRes);
  staticLayer.colorMode(HSB, 360);
  staticLayer.imageMode(CENTER);

	// Create text.
	pushTextOverlay();

}

function draw() {
  staticLayer.resetMatrix();
  staticLayer.translate(fullRes * 0.5, fullRes * 0.5);
  renderBuffer.resetMatrix();
  renderBuffer.clear();
  renderBuffer.translate(fullRes * 0.5, fullRes * 0.5);

  // First frame only
  if (frameCount === 1) {
    graphics.resetMatrix();
    graphics.pointLight(graphicsHue, 60, 360, 0, 0, -10);
    // Render graphics layer
    graphics.rotateX(xRotation * TAU);
    graphics.rotateY(yRotation * TAU);
    graphics.rotateZ(zRotation * TAU);
    graphics.fill(
      (graphicsHue + map(xPos + yPos + zPos, 0, 3 * sphereCount, -30, 30)) %
        360,
      360,
      360
    );
    graphics.noStroke();
    for (var xPos = -sphereCount; xPos < sphereCount; xPos++) {
      for (var yPos = -sphereCount; yPos < sphereCount; yPos++) {
        for (var zPos = -sphereCount; zPos < sphereCount; zPos++) {
          graphics.push();
          graphics.translate(xPos * xChoice, yPos * yChoice, zPos * zChoice);
          var sphereSize = noise(64 + xPos, 64 + yPos, zPos);
          graphics.specularMaterial(180);
          var type = ~~map(noise(xPos / 10, yPos / 10, zPos / 10), 0, 1, 0, 3);
          switch (type) {
            case 0:
              graphics.box(map(sphereSize, 0, 1, 128, 0), 48, 64);
              break;
            case 1:
              graphics.sphere(map(sphereSize, 0, 1, 128, 0), 48, 64);
              break;
            case 3:
              graphics.cone(map(sphereSize, 0, 1, 128, 0), 48, 64);
              break;
          }
          graphics.pop();
        }
      }
    }
    
    for (var i = 0; i < 65535; i++) {
      staticLayer.push();
      staticLayer.rotate(random(backgroundRotationRange * TAU));
      staticLayer.stroke(graphicsHue, 180, random(60, 300), 2);
      staticLayer.strokeWeight(1);
      staticLayer.line(
        random(-fullRes),
        random(-fullRes),
        random(fullRes),
        random(fullRes)
      );
      staticLayer.pop();
    }
    
  }
  

  renderBuffer.drawingContext.shadowOffsetX = 8;
  renderBuffer.drawingContext.shadowOffsetY = -16;
  renderBuffer.drawingContext.shadowBlur = 64;
  renderBuffer.drawingContext.shadowColor = color(
    (graphicsHue + 30) % 360,
    90,
    90,
    240
  );
  renderBuffer.image(
    graphics,
    8 * sin(frameCount / 1000),
    8 * sin(frameCount / 900),
    fullRes,
    fullRes
  );
  // Render graphics layer to canvas
  background(360);
  translate(screenSize / 2, screenSize / 2);
  image(staticLayer, 0, 0, screenSize * 0.95, screenSize * 0.95);
  image(renderBuffer, 0, 0, screenSize * 0.95, screenSize * 0.95);
  noFill();
  strokeWeight(screenSize / 1024);
  rect(
    -screenSize * 0.95 * 0.5,
    -screenSize * 0.95 * 0.5,
    screenSize * 0.95,
    screenSize * 0.95
  );
  
  if (frameCount === 2) {
        fxpreview();
	}

  // Text
  
  // Handle information text visibility
  if (textAlpha < textTargetAlpha) {
    textAlpha += 2;
  } else if (textAlpha > textTargetAlpha) {
    textAlpha -= 2;
  }
  
  if (textAlpha > 0) {
    stroke(0, textAlpha);
    fill(360, textAlpha);
    strokeWeight(screenSize * 0.005);
    textSize(screenSize * 0.0222);
    textAlign(LEFT, CENTER);
    text(textOverlay, -screenSize * 0.4, -screenSize * 0.4, screenSize * 0.8);
  }
}

function keyPressed() {
  if (key == "s") {
    saveCanvas(
      shortNameOfPiece +
        "Canvas" +
        nf(hour(), 2, 0) +
        nf(minute(), 2, 0) +
        nf(second(), 2),
      "png"
    );
  }

  if (key == "T") {
    if (textTargetAlpha == 0) {
      textTargetAlpha = 360;
    } else {
      textTargetAlpha = 0;
    }
  }
}

function windowResized() {
  if (navigator.userAgent.indexOf("HeadlessChrome") == -1) {
    screenSize = min(windowWidth, windowHeight);
    resizeCanvas(screenSize, screenSize);
  }
}

function pushTextOverlay() {
  textOverlay =
    "I don't know if " + random(["anyone", "anybody"]) + " will ever " + random(["find", "see"]) + " this. In some ways I hope they don't. I kind of like the " + random(["idea", "feeling"]) + " that somewhere, " + random(["tucked away", "hidden", "concealed", "safe"]) + " under all this rubble, there's this little secret, hidden away in the fragments of space between now and  " + random(["never", "eternity", "forever", "tomorrow"]) + " . I'm not going to " + random(["survive this", "make it"]) + ", and I know it. I'm okay with it, after a fashion—don't worry about me. I made my peace long ago, back when I first took this job and the " + random(["morality", "ethics"]) + " of it all weighed heavily on what was left of my conscience. The pay soon " + random(["ground", "broke"]) + "  it into dust; money beats morals every time. I always knew there'd be consequences, though; there are some laws you can't break. There have to be rules. Gravity. Magnetism. The  " + random(["weak", "subtle", "immutable"]) + " nuclear forces that hold " + random(["our world", "reality", "existence", "it all"]) + " together.";
  textOverlay += "\n";
  textOverlay +=
    "\nContainment's " + random(["gone", "failed", "broken down"]) + ". I can hear the alarms " + random(["going now", "sounding", "wailing", "screaming"]) + ", and that means that slowly, " + random(["this", "my"]) + " " + random(["fragile", "tiny"]) + " world is going to come to an end. If you could see it in time, map it out into four dimensions, you'd see a long, thin " + random(["string", "cone", "trail"]) + " of cones, a hypercone, comprising a single " + random(["shrinking", "diminishing"]) + " sphere where the centre of the machine was. We're unlikely to reach our Schwarzchild radius: our mass is so " + random(["pathetic", "insignificant", "unobtrusive"]) + " that we'd need to become a mere pinprick before gravity could take us down. Even so, things aren't looking good. I doubt I can exist in a sphere with a radius smaller than " + random(["an electron", "a hydrogen atom", "a proton"]) + ". They tried to model it once. I guess it doesn't matter now.";
  textOverlay += "\n";
  textOverlay +=
    "\nSo, if containment's failed—and it has—you'll never read this. All the same, you should know that we tried. Tried to contain it. Which is ridiculous in a way, because without us there'd be nothing to contain.";
  textOverlay += "\n";
  textOverlay +=
    "\nIt makes me laugh, you know? All those times they told me to reach for the stars—you should reach for the stars, they said, and a million " + random(["motivational posters", "foolish slogans", "hubristic aphorisms", "pointless exhortations"]) + " cry out in " + random(["terror", "pain"]) + " and are suddenly silenced.";
  textOverlay += "\n";
  textOverlay += "\nBecause it turns out sometimes, you " + random(["shouldn't", "should just leave the stars alone", "should leave well alone", "should stick to the shallows"]) + ".";
  
}


//  " + random(["WORD", "WORD"]) + " 