class CPU{
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
                        case 0x00E0: // clear the display
                            this.renderer.clear();
                            break;
                        case 0x00EE: //store last element on stack in pc
                            this.pc = this.stack.pop();
                            break;
                    }
            
                    break;
                case 0x1000: //set pc to value stored
                    this.pc - (opcode & 0xFFF);
                    break;
                case 0x2000: //call address
                    this.stack.push(this.pc);
                    this.pc = (opcode & 0xFFF);
                    break;
                case 0x3000: // compare x to value, skip if the same
                    if(this.v[x] === (opcode & 0xFF)){
                        this.pc += 2;
                    }
                    break;
                case 0x4000: //compare x to value, skip if not the same
                    if (this.v[x] !== (opcode & 0xFF)) {
                        this.pc += 2;
                    }
                    break;
                case 0x5000: // skip if x and y are the same
                    if(this.v[x] === this.v[y]) {
                        this.pc += 2;
                    }
                    break;
                case 0x6000: // Set x to value
                    this.v[x] = (opcode & 0xFF);
                    break;
                case 0x7000: // add value to x
                    this.v[x] += (opcode & 0xFF);
                    break;
                case 0x8000:
                    switch (opcode & 0xF) {
                        case 0x0: // set x to y
                            this.v[x] = this.v[y];
                            break;
                        case 0x1://x is equal to x or y
                            this.v[x] |= this.v[y];
                            break;
                        case 0x2://x is equal to x and y
                            this.v[x] &= this.v[y];
                            break;
                        case 0x3://x is equal to x XOR y
                            this.v[x] ^= this.v[y];
                            break;
                        case 0x4://add x and y, carry stored in Vf
                            let sum = (this.v[x] + this.v[y])
                            this.v[0xF] = 0;
                            if (sum > 0xFF) {
                                this.v[0xF] = 1;
                            }
                            this.v[x] = sum;
                            break;
                        case 0x5://subtract x and y, borrow stored in Vf
                            this.v[0xF] = 0;
                            if (this.v[x] > this.v[y]){
                                this.v[0xF] = 1;
                            }
                            this.v[x] -= this.v[y];
                            break;
                        case 0x6://Shift right x
                            this.v[0xF] = (this.v[x] & 0x1);
                            this.v[x] >>= 1;
                            break;
                        case 0x7://SUBN x and y
                            this.v[0xF] = 0;
                            if(this.v[y] > this.v[x]) {
                                this.v[0xF] = 1;
                            }
                            this.v[x] = this.v[y] - this.v[x];
                            break;
                        case 0xE: //Shift left x
                            this.v[0xF] = (this.v[x] & 0x80);
                            this.v[x] <<= 1;
                            break;
                    }
            
                    break;
                case 0x9000:// skip next if x and y are not equal
                    if(this.v[x] !== this.v[y]) {
                        this.pc += 2;
                    }
                    break;
                case 0xA000: //set index to value.
                    this.i = (opcode & 0xFFF);
                    break;
                case 0xB000://set pc to value plus register 0
                    this.pc = (opcode & 0xFFF) + this.v[0];
                    break;
                case 0xC000: //Random value set to X
                    let rand = Math.floor(Math.random() * 0xFF);
                    this.v[x] = rand & (opcode & 0xFF);
                    break;
                case 0xD000://Draw and Erase pixels
                    let width = 8;
                    let height = (opcode & 0xF);

                    this.v[0xF] = 0;
                    for (let row = 0; row < height; row++){
                        let sprite = this.memory[this.i + row];

                        for(let col = 0; col < width; col++){
                            //sprite != 0 erase the pixel
                            if ((sprite & 0x80) > 0){
                                if (this.renderer.setPixel(this.v[x] + col, this.v[y] + row)){
                                    this.v[0xF] = 1;
                                }
                            }
                            //Shift sprite left by  1
                            sprite <<= 1;
                        }
                    }
                    break;
                case 0xE000:
                    switch (opcode & 0xFF) {
                        case 0x9E:// Skip next instruction if key stored in x is pressed
                            if(this.keyboard.isKeyPressed(this.v[x])){
                                this.pc += 2;
                            }
                            break;
                        case 0xA1://skip next instruction if key stored in x is not pressed
                            if(!this.keyboard.isKeyPressed(this.v[x])){
                                this.pc += 2;
                            }
                            break;
                    }
            
                    break;
                case 0xF000:
                    switch (opcode & 0xFF) {
                        case 0x07: //x set equal to delayTimer
                            this.v[x] = this.delayTimer;
                            break;
                        case 0x0A://pauses emulator if key is pressed
                            this.paused = true;
                            this.keyboard.onNextKeyPress = function(key) {
                                this.v[x] = key;
                                this.paused = false;
                            }.bind(this);
                            break;
                        case 0x15://sets delayTimer to x
                            this.delayTimer = this.v[x];
                            break;
                        case 0x18:// sets soundTimer to x
                            this.soundTimer = this.v[x];
                            break;
                        case 0x1E://adds x to index
                            this.i += this.v[x];
                            break;
                        case 0x29://sets index to x
                            this.i = this.v[x] * 5;
                            break;
                        case 0x33://grabs hundreds tens and ones digit from x, stores them in i, i+1 i+2
                            //Hundreds set to i
                            this.memory[this.i] = parseInt(this.v[x] / 100);
                            //Tens sent to i+1
                            this.memory[this.i + 1] = parseInt((this.v[x] % 100) / 10);
                            //Ones sent to i+2
                            this.memory[this.i + 2] = parseInt(this.v[x] % 10);
                            break;
                        case 0x55://V0 to Vx(x) is stored starting from index
                            for(let rI = 0; rI <= x; rI++){
                                this.memory[this.i + rI] = this.v[rI];
                            }
                            break;
                        case 0x65://Stores values starting from index in V0 to Vx
                            for(let rI = 0; rI <= x; rI++){
                                this.v[rI] = this.memory[this.i + rI];
                            }
                            break;
                    }
            
                    break;
            
                default:
                    throw new Error('Unknown opcode ' + opcode);
            }
            
        }

}

export default CPU