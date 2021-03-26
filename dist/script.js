let container = document.querySelector('.container');

// BPM input
let msValue = bpmToMilliseconds(100);
let bpmNumber = document.getElementById('bpmNumber');
let bpmSlider = document.getElementById('bpmSlider');

bpmSlider.oninput = function() {
  if(this.value <= 200 && this.value >= 40){
    bpmNumber.value = this.value;
    msValue = bpmToMilliseconds(this.value);
  }  
}

bpmNumber.oninput = function() {
  if(this.value <= 200 && this.value >= 40){
    bpmSlider.value = this.value;
    msValue = bpmToMilliseconds(this.value);
  }  
}

function bpmToMilliseconds(bpm){
  return (60 * 1000) / (bpm * 4);
}


// Sound line definition
function soundLine(label, soundSource){
  this.el = '';
  this.soundName = '';
  this.pads = [];
  this.columns = 16;
  this.iteration = 0;
  this.soundSource = '';
  this.howler = null;
  
  this.init= function(){    
    this.el = document.createElement("div");
    this.el.classList.add('sequencerLine');
    this.soundName = document.createElement("div");
    this.soundName.classList.add('soundName');
    this.soundName.innerHTML = label;
    this.soundSource = soundSource;
    this.howler = new Howl({
      src: [`${this.soundSource}`]
    })
    
    for(let i=0; i < this.columns; i++){
      this.pads.push({
        el: this.createPad(),
        activated: true,
      });
    }
    // Workaround to remove toggled line at the end
    this.pads[this.columns - 1].el.classList.toggle('onBeat')
  }
  
  this.render = function(){
    container.appendChild(this.el);
    this.el.appendChild(this.soundName);
    for(let i=0; i < this.pads.length; i++){   
      this.el.appendChild(this.pads[i].el);
    }
  }
  
  this.createPad = function(){
    let pad = document.createElement("div");
    pad.classList.add('pad');
    this.createEventListener(pad);
    return pad;
  }
  
  this.createEventListener = function(el){
    let self = this;
    return el.addEventListener('click', (e) => {
      self.handleClick(e.target);
    })
  }
  
  this.handleClick = function(e){
    this.pads.map((pad) => {
      if(pad.el === e){
        pad.clicked = !pad.clicked;
        pad.el.classList.toggle('clicked');
      }
    })
  }
  
  // Loop through the row / play
  this.loop = function(){
    this.pads[this.iteration].el.classList.toggle('onBeat');
    if(this.pads[this.iteration].clicked) this.howler.play();
    
    if(this.iteration > 0) this.pads[this.iteration - 1].el.classList.toggle('onBeat');
    else this.pads[this.columns - 1].el.classList.toggle('onBeat');
          
    if(this.iteration < this.columns - 1) this.iteration++;
    else this.iteration = 0;
  }
  
  // Clear all clicked buttons
  this.clear = function(){
    for(let i=0; i < this.pads.length; i++){   
      if(this.pads[i].clicked){
        this.pads[i].clicked = false;  
        this.pads[i].el.classList.toggle('clicked');
      }      
    }
  }
  // Generate random sound line pattern
  this.randomize = function(){    
    let previousBeatClicked = 0;
    for(let i=0; i < this.columns; i++){
      // The odds of beat being marked are 1/3
      let randomNumber = Math.floor(Math.random() * 3);
      // Beat won't be marked
      if(randomNumber == 2 && previousBeatClicked < 2){
        this.pads[i].clicked = true;
        this.pads[i].el.classList.toggle('clicked');
        previousBeatClicked++;
      }
      else previousBeatClicked = 0;
    }
  }
}


// Sound declaration and initialization
let kick = new soundLine('Kick', 'https://raw.githubusercontent.com/LewisGRobotics/LewisCoolDrumMachine/main/Kick.wav');
let snare = new soundLine('Snare','https://raw.githubusercontent.com/LewisGRobotics/LewisCoolDrumMachine/main/Snare.wav');
let hihatclosed = new soundLine('hh closed','https://raw.githubusercontent.com/LewisGRobotics/LewisCoolDrumMachine/main/CLHH.wav');
let hihatopen = new soundLine('hh open','https://raw.githubusercontent.com/LewisGRobotics/LewisCoolDrumMachine/main/OPHH.wav');

kick.init();
snare.init();
hihatclosed.init();
hihatopen.init();

kick.render();
snare.render();
hihatclosed.render();
hihatopen.render();


// Play/pause and reset buttons
let playButton = document.getElementById('playButton');
let resetButton = document.getElementById('resetButton');
let randomButton = document.getElementById('randomButton');

playButton.addEventListener("click", playPause);
resetButton.addEventListener("click", reset);
randomButton.addEventListener("click", random);

let play = true;
function playPause(){
  play = !play;
}

function reset(){
  kick.clear();
  snare.clear();
  hihatclosed.clear();
  hihatopen.clear();
  play = false;
}

function random(){
  reset();
  kick.randomize();
  snare.randomize();
  hihatclosed.randomize();
  hihatopen.randomize();
  play = true;
}


// Loop function
(function loop(){
  if(play){
    kick.loop();
    snare.loop();
    hihatclosed.loop();
    hihatopen.loop();
  }  
  setTimeout(loop, msValue);
})()