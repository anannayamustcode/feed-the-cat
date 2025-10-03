// Based on: 
// ml5.js handpose demo: 
// https://editor.p5js.org/ml5/sketches/QGH3dwJ1A
// Matter.js bridge demo: 
// https://editor.p5js.org/natureofcode/sketches/7U7yrrbNz

const THUMB_TIP = 4; 
const INDEX_FINGER_TIP = 8; 


// Matter.js physics stuff
const { Engine, Bodies, Composite, Constraint, Body, Vector } = Matter;
let engine;
let bridge;
let particles = [];

// ml5.js tracker stuff
let handpose;
let video;
let hands = [];
let handOptions = { maxHands: 1, flipHorizontal: true };

function preload() {
  // Load the handpose model.
  handpose = ml5.handpose(handOptions);
}
function gotHands(results) {
  // Callback function; save the output to the hands variable
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  engine = Engine.create();
  bridge = new Bridge(16);
  
  // Create the webcam, start detecting hands
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  handpose.detectStart(video, gotHands);
}


function draw() {
  background(255);
  push();
  if (handOptions.flipHorizontal){
    translate(width,0);scale(-1,1);
  }
  tint(255,255,255,80); 
  image(video, 0, 0, width, height);
  pop();
  renderTrackedHandPoints(); // if you want
  
  if (hands.length > 0){
    noFill();
    stroke("red");
    let thumbx = hands[0].keypoints[THUMB_TIP].x;
    let thumby = hands[0].keypoints[THUMB_TIP].y;
    let indexx = hands[0].keypoints[INDEX_FINGER_TIP].x;
    let indexy = hands[0].keypoints[INDEX_FINGER_TIP].y;
    circle (thumbx,thumby, 30);
    circle (indexx,indexy, 30);
  }
  
  occasionallyMakeNewBalls(); 
  Engine.update(engine);
  bridge.setToHandPoints();
  bridge.show();
  renderBalls(); 
  removeOutOfBoundsBalls(); 
}


//---------------------------------------------------------
function renderTrackedHandPoints(){
  // Draw all the tracked hand points
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill('red');
      noStroke();
      circle(keypoint.x, keypoint.y, 5);
    }
  }
}

//---------------------------------------------------------
function occasionallyMakeNewBalls(){
  if (random(1) < 0.05) {
    particles.push(new Particle(width / 2 + random(-60, 60), 0));
  }
}

function renderBalls(){
  // render the balls
  for (let i = 0; i< particles.length; i++) {
    particles[i].show();
  }
}

function removeOutOfBoundsBalls(){
  // Remove out-of-bounds balls, from the world and the array
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].checkEdge()) {
      particles[i].removeBody();
      particles.splice(i, 1);
    }
  }
}


//---------------------------------------------------------
class Bridge {
  // From https://editor.p5js.org/natureofcode/sketches/7U7yrrbNz
  constructor(len) {
    this.r = len / 2;
    this.len = len;
    this.particles = [];
    this.constraints = [];
    for (let i = 0; i < len; i++) {
      let px = map(i,0,len-1, 220,420);
      let py = height * 0.75;
      let particle = Bodies.circle(px, py, this.r, { restitution: 0.7 });
      this.particles.push(particle);
      Composite.add(engine.world, particle);
    }
    this.particles[0].isStatic = true;
    this.particles[this.particles.length - 1].isStatic = true;

    
    for (let i = 0; i < this.particles.length - 1; i++) {
      let options = {
        bodyA: this.particles[i],
        bodyB: this.particles[i + 1],
        length: len,
        stiffness: 1,
      };
      let constraint = Matter.Constraint.create(options);
      Composite.add(engine.world, constraint);
    }
  }
  
  setToHandPoints(){
    if (hands.length > 0){
      let thumbx = hands[0].keypoints[THUMB_TIP].x;
      let thumby = hands[0].keypoints[THUMB_TIP].y;
      let indexx = hands[0].keypoints[INDEX_FINGER_TIP].x;
      let indexy = hands[0].keypoints[INDEX_FINGER_TIP].y;

      let index0 = 0; 
      let index1 = this.particles.length - 1;
      Body.setPosition(this.particles[index0], {x:thumbx, y:thumby }); 
      Body.setPosition(this.particles[index1], {x:indexx, y:indexy }); 
    }
  }

  show() {
    fill(80);
    stroke(0);
    for (let particle of this.particles) {
      push();
      translate(particle.position.x, particle.position.y);
      circle(0, 0, this.r * 2);
      pop();
    }
  }
}

//---------------------------------------------------------
class Particle {
  constructor(x, y) {
    this.r = 8;
    let options = {
      restitution: 0.6,
      collisionFilter: {
        category: 0x0002,
      },
    };
    this.body = Bodies.circle(x, y, this.r, options);
    Composite.add(engine.world, this.body);
  }

  show() {
    let pos = this.body.position;
    let a = this.body.angle;
    fill(180);
    stroke(0);
    strokeWeight(2);
    push();
    translate(pos.x, pos.y);
    rotate(a);
    circle(0, 0, this.r * 2);
    line(0, 0, this.r, 0);
    pop();
  }

  checkEdge() {
    return this.body.position.y > height + this.r;
  }
  removeBody() {
    Composite.remove(engine.world, this.body);
  }
}

