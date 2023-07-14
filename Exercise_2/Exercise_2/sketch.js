/*Ref: basic code is taken from the fft analyzer example exercise_8 from the course and modified it*/
let analyzer;
let features;

let audioData = [{
        loadedAudio: null,
        file: '../sounds/Ex2_sound1.wav',
        features: ['rms', 'zcr', 'spectralCrest', 'spectralKurtosis'],
        featureFactors: [1000, 10, 10, 10]
    },

    {
        loadedAudio: null,
        file: '../sounds/Ex2_sound1.wav',
        features: ['rms', 'zcr', 'spectralCrest', 'energy'],
        featureFactors: [1000, 10, 10, 100]
    },

    {
        loadedAudio: null,
        file: '../sounds/Ex2_sound3.wav',
        features: ['rms', 'zcr', 'spectralCrest', 'spectralKurtosis'],
        featureFactors: [1000, 10, 10, 100]
    }, ];



let lowerRight;
let lowerLeft;
let upperLeft;
let upperRight;

let adoDataIndex = 0;

const featureColors = {
    rms: [0, 0, 205, 200],
    spectralCentroid: [65, 105, 225, 200],
    mfcc: [255, 69, 0, 200],
    zcr: [255, 165, 0, 200],
    spectralCrest: [0, 206, 209, 200],
    energy: [139, 0, 0, 200],
    spectralKurtosis: [138, 43, 226, 200]
};

function preload() {
    soundFormats('mp3', 'ogg', 'wav');
    audioData[adoDataIndex]['loadedAudio'] = loadSound(audioData[adoDataIndex]['file']);
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
                source: audioData[adoDataIndex]['loadedAudio'],
                bufferSize: 512, // Adjust buffer size as needed
                featureExtractors: audioData[adoDataIndex]['features'], // extract the desired features
                callback: features => {
                    console.log(features);
                    lowerRight = features[audioData[adoDataIndex]['features'][0]] * audioData[adoDataIndex]['featureFactors'][0];
                    lowerLeft = features[audioData[adoDataIndex]['features'][1]] * audioData[adoDataIndex]['featureFactors'][1];
                    upperLeft = features[audioData[adoDataIndex]['features'][2]] * audioData[adoDataIndex]['featureFactors'][2];
                    upperRight = features[audioData[adoDataIndex]['features'][3]] * audioData[adoDataIndex]['featureFactors'][3];
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
    audioData[adoDataIndex]['loadedAudio'].setVolume(vol);
    audioData[adoDataIndex]['loadedAudio'].rate(sliderRate.value());
    audioData[adoDataIndex]['loadedAudio'].pan(sliderPan.value());

    let spectrum = fft.analyze();
    drawSpectrum(spectrum, 200, 50);
    drawArcs();
}

function drawSpectrum(spectrum, translateX, translatey) {

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
    fill(featureColors[audioData[adoDataIndex]['features'][0]]);
    arc(200, 275, lowerLeft, lowerLeft, 0, HALF_PI);
    fill(featureColors[audioData[adoDataIndex]['features'][1]]);
    arc(200, 275, lowerRight, lowerRight, HALF_PI, PI);
    fill(featureColors[audioData[adoDataIndex]['features'][2]]);
    arc(200, 275, upperRight, upperRight, PI, PI + HALF_PI);
    fill(featureColors[audioData[adoDataIndex]['features'][3]]);
    arc(200, 275, upperLeft, upperLeft, PI + HALF_PI, 2 * PI);
}

function jumpSong() {
    var dur = audioData[adoDataIndex]['loadedAudio'].duration();
    var t = random(dur);
    audioData[adoDataIndex]['loadedAudio'].jump(t);


    audioData[adoDataIndex]['loadedAudio'] = loadSound(audioData[adoDataIndex]['file']);
    location.reload();
}

function playStopSound() {
    if (audioData[adoDataIndex]['loadedAudio'].isPlaying()) {
        audioData[adoDataIndex]['loadedAudio'].stop();
        analyzer.stop();
        //mySound.pause();
        playStopButton.html('play');
        background(180);



    } else {
        //mySound.play();
        audioData[adoDataIndex]['loadedAudio'].loop()
        analyzer.start();
        playStopButton.html('stop');


    }
}
