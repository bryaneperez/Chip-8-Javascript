class CPU(){
    constructor(renderer,keyboard,speaker){
        this.renderer = renderer;
        this.keyboard = keyboard;
        this.speaker = speaker;
        //Memory
        this.memory = new Uint8Array(4096);
        //Register
        this.v = new Uint8Array(16);
        //Memory address index
        this.i = 0;
        //Timers
        this.delayTimer = 0;
        this.soundTimer = 0;
        //Program Counter
        this.pc  = 0x200;
        //Stack
        this.stack = new Array();
        //pause for some instructions
        this.paused = false;

        this.speed = 10;
    }
}

export default CPU