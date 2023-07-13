/*Ref: basic code is taken from the fft analyzer example exercise_8 from the course and modified it*/
let mySound;
let analyzer;
let features;


let file1 = '../sounds/Ex2_sound1.wav';
let file1Features = ['rms', 'zcr', 'spectralCrest', 'spectralKurtosis'];
let file1Factors = [1000,10,10,10];

let file2 = '../sounds/Ex2_sound2.wav';
let file2Features = ['rms', 'zcr', 'spectralCrest', 'energy'];
let file2Factors = [1000,10,10,100];

let file3 = '../sounds/Ex2_sound3.wav';
let file3Features = ['rms', 'zcr', 'spectralCrest', 'energy'];
let file3Factors = [1000,10,10,100];


let lowerRight;
let lowerLeft;
let upperLeft;
let upperRight;

let currentFeatures = file2Features;
let currentFile = file2;
let currentFactors = file2Factors;

const featureColors = {
    rms: [0, 0, 205, 200],
    spectralCentroid: [65, 105, 225, 200],
    mfcc: [255, 69, 0, 200],
    zcr: [255, 165, 0, 200],
    spectralCrest: [0, 206, 209, 200],
    energy: [139, 0, 0, 200],
    spectralKurtosis:[138, 43, 226,200]
};

function preload() {
    soundFormats('mp3', 'ogg', 'wav');
    mySound = loadSound(currentFile);
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
                featureExtractors: currentFeatures, // Add desired features
                callback: features => {
                    console.log(features);
                    lowerRight = features[currentFeatures[0]] * currentFactors[0]; 
                    lowerLeft = features[currentFeatures[1]] * currentFactors[1]; 
                    upperLeft = features[currentFeatures[2]] * currentFactors[2]; 
                    upperRight = features[currentFeatures[3]] * currentFactors[3]; 
                    console.log(lowerRight, lowerLeft, upperLeft, upperRight);
                } // Function to handle the extracted features
            });
        console.log("Analyzer initialized!");

    }

};

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
    drawSpectrum(spectrum,200,50);
    drawArcs();
}

function drawSpectrum(spectrum,translateX,translatey) {
    
    push();
    translate(translateX, translatey);
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
}

function drawArcs() {
    fill(featureColors[currentFeatures[0]]);
    arc(200, 275, lowerLeft, lowerLeft, 0, HALF_PI);
    fill(featureColors[currentFeatures[1]]);
    arc(200, 275, lowerRight, lowerRight, HALF_PI, PI);
    fill(featureColors[currentFeatures[2]]);
    arc(200, 275, upperRight, upperRight, PI, PI + HALF_PI);
    fill(featureColors[currentFeatures[3]]);
    arc(200, 275, upperLeft, upperLeft, PI + HALF_PI, 2 * PI);
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
