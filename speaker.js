class Speaker {
    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        this.audioCtx = new AudioContext();
        //Volume 
        this.gain = this.audioCtx.createGain();
        this.finish = this.audioCtx.destination;
        //Connects gain to audio context
        this.gain.connect(this.finish);
    }

    play(frequency) {
        if(this.audioCtx && !this.oscillator){
            this.oscillator = this.audioCtx.createOscillator();
            //Set Frequency
            this.oscillator.frequency.setValueAtTime(frequency || 440, this.audioCtx.currentTime);
            //Square Wave
            this.oscillator.type = 'square';
            //Connect to gain, start sound
            this.oscillator.connect(this.gain);
            this.oscillator.start();

        }
    }

    stop(){
        if(this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }
}

export default Speaker;