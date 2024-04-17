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

    loadSpritesIntoMemory() {
        //Hex values for sprites.
        const sprites = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];
        //Load into memory
        for (let i = 0; i <sprites.length; i++){
            this.memory[i] = sprites[i];
        }
    }

    loadProgramIntoMemory(program) {
        for (let loc = 0; loc < program.length; loc++){
            this.memory[0x200 + loc] = program[loc];
        }
    }

    loadRom(romName) {
        var request = new XMLHttpRequest;
        var self = this;

        //Request handler
        request.onload = function(){
            //has content
            if(request.response){
                //Store into array
                let program = new Uint8Array(request.response);

                //Load into memory
                self.loadProgramIntoMemory(program);
            }
        }

        //Get rerquest to get ROM from roms folder
        request.open('GET', 'roms/' + romName);
        request.responseType = 'arraybuffer';

        //Send GET request
        request.send();
    }

        cycle(){
            for (let i = 0; i < this.speed; i++){
                if(!this.paused){
                    let opcode = (this.memory[this.pc] << 8 | this.memory[this.pc + 1]);
                    this.executeInstruction(opcode);
                }
            }
            if (!this.paused) {
                this.updateTimers();
            }

            this.playSound();
            this.renderer.render();
        }

        updateTimers() {
            if (this.delayTimer > 0) {
                this.delayTimer -= 1;
            }

            if (this.soundTimer > 0) {
                this.soundTimer -= 1;
            }
        }

        playSound() {
            if (this.soundTimer > 0) {
                this.speaker.play(440);
            }
            else {
                this.speaker.stop();
            }
        }

        executeInstruction(opcode) {
            this.pc += 2;

            let x = (opcode & 0x0F00) >> 8;

            let y = (opcode & 0x00F0) >> 4;

            switch (opcode & 0xF000) {
                case 0x0000:
                    switch (opcode) {
                        case 0x00E0:
                            break;
                        case 0x00EE:
                            break;
                    }
            
                    break;
                case 0x1000:
                    break;
                case 0x2000:
                    break;
                case 0x3000:
                    break;
                case 0x4000:
                    break;
                case 0x5000:
                    break;
                case 0x6000:
                    break;
                case 0x7000:
                    break;
                case 0x8000:
                    switch (opcode & 0xF) {
                        case 0x0:
                            break;
                        case 0x1:
                            break;
                        case 0x2:
                            break;
                        case 0x3:
                            break;
                        case 0x4:
                            break;
                        case 0x5:
                            break;
                        case 0x6:
                            break;
                        case 0x7:
                            break;
                        case 0xE:
                            break;
                    }
            
                    break;
                case 0x9000:
                    break;
                case 0xA000:
                    break;
                case 0xB000:
                    break;
                case 0xC000:
                    break;
                case 0xD000:
                    break;
                case 0xE000:
                    switch (opcode & 0xFF) {
                        case 0x9E:
                            break;
                        case 0xA1:
                            break;
                    }
            
                    break;
                case 0xF000:
                    switch (opcode & 0xFF) {
                        case 0x07:
                            break;
                        case 0x0A:
                            break;
                        case 0x15:
                            break;
                        case 0x18:
                            break;
                        case 0x1E:
                            break;
                        case 0x29:
                            break;
                        case 0x33:
                            break;
                        case 0x55:
                            break;
                        case 0x65:
                            break;
                    }
            
                    break;
            
                default:
                    throw new Error('Unknown opcode ' + opcode);
            }
            
        }

}

export default CPU