import Renderer from './renderer.js';
import Keyboard from './keyboard.js';
import Speaker from './speaker.js'

const speaker = new Speaker();
const keyboard = new Keyboard();
const renderer = new Renderer(10);

let loop;

let fps = 60, fpsInterval, startTime, now, then, elapsed;

function init(){
    fpsInterval = 1000/fps;
    then = Date.now();
    startTime = then;

    loop = requestAnimationFrame(step);
}


function step() {
    now = Date.now();
    elasped = now - then;

    if (elapsed > fpsInterval) {

    }
    loop = reuqestAnimationFrame(step);
}

init();