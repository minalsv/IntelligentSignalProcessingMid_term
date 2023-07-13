/*Ref: basic code is taken from the fft analyzer example exercise_8 from the course and modified it*/
let mySound;
let analyzer;
let features;
let startAnalyzer;
let analyzerStarted;

let lowMid;
let treble;
let highMid;
let mid;

const featureColors = {
    rms: [0, 0, 255],
    spectralCentroid: [255, 0, 0],
    mfcc: [0, 255, 0]
};

function preload() {
    soundFormats('mp3', 'ogg', 'wav');
    mySound = loadSound('../sounds/Ex2_sound3.wav');


    startAnalyzer = false;
    analyzerStarted = false;
}

function setup() {
    createCanvas(400, 400);
    background(180);

    playStopButton = createButton('play');
    playStopButton.position(200, 20);
    playStopButton.mousePressed(playStopSound);
    jumpButton = createButton('jump');
    jumpButton.position(250, 20);
    jumpButton.mousePressed(jumpSong);

    sliderVolume = createSlider(0, 1, 1, 0.01);
    sliderVolume.position(20, 25);
    sliderRate = createSlider(-2, 2, 1, 0.01);
    sliderRate.position(20, 70);
    sliderPan = createSlider(-1, 1, 0, 0.01);
    sliderPan.position(20, 115);

    fft = new p5.FFT(0.2, 2048);

    if (typeof Meyda == 'undefined') {
        cpnsole.log("Error: No Meyda libraries found");
    } else {
        console.log("Meyda is present!");
        // Create an AudioContext
        const audioContext = getAudioContext();
        analyzer =
            analyzer = Meyda.createMeydaAnalyzer({
                audioContext: audioContext,
                source: mySound,
                bufferSize: 512, // Adjust buffer size as needed
                featureExtractors: ['rms', 'zcr','spectralCrest','energy'], // Add desired features
                callback: features => {
                    console.log(features);
                    lowMid = features.rms*10; //0.022
                    treble = features.zcr*10;//10
                    highMid = features.spectralCrest*10;//7.9
                    mid = features.energy*10;//0.5
                    console.log(lowMid,treble,highMid,mid);
                } // Function to handle the extracted features
            });
        console.log("Analyzer initialized!");

    }

}
;
function draw() {
    background(180, 100);

    fill(0);
    text('volume', 80, 20);
    text('rate', 80, 65);
    text('pan', 80, 110);

    let vol = Math.pow(sliderVolume.value(), 3);
    mySound.setVolume(vol);
    mySound.rate(sliderRate.value());
    mySound.pan(sliderPan.value());

    let spectrum = fft.analyze();

    push();
    translate(200, 50);
    scale(0.33, 0.20);
    noStroke();
    fill(60);
    rect(0, 0, width, height);
    fill(255, 0, 0);
    for (let i = 0; i < spectrum.length; i++) {
        let x = map(i, 0, spectrum.length, 0, width);
        let h = -height + map(spectrum[i], 0, 255, height, 0);
        rect(x, height, width / spectrum.length, h);
    }
    pop();

    fill(30, 30, 255, 200);


    arc(200, 275, treble, treble, 0, HALF_PI);
    fill(100, 55, 255, 200);
    arc(200, 275, lowMid, lowMid, HALF_PI, PI);
    fill(55, 100, 255, 200);
    arc(200, 275, mid, mid, PI, PI + HALF_PI);
    fill(130, 130, 255, 200);
    arc(200, 275, highMid, highMid, PI + HALF_PI, 2 * PI);
}


function jumpSong() {
    var dur = mySound.duration();
    var t = random(dur);
    mySound.jump(t);
}

function playStopSound() {
    if (mySound.isPlaying()) {
        mySound.stop();
        analyzer.stop();
        //mySound.pause();
        playStopButton.html('play');
        background(180);
    } else {
        //mySound.play();
        mySound.loop()
        analyzer.start();
        playStopButton.html('stop');
    }
}
