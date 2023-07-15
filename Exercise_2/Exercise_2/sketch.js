/*Ref: basic code is taken from the fft analyzer example exercise_8 from the course and modified it*/
let analyzer;
let features;

let appData;
let storedVariables;
let allowToPlayTrack = false;
let shape = 'circle';

let voiceCommandsRec;

let audioData = [{
        loadedAudio: null,
        file: '../sounds/Ex2_sound1.wav',
        features: ['rms', 'zcr', 'spectralCrest', 'spectralKurtosis'],
        featureFactors: [1000, 10, 10, 10]
    },

    {
        loadedAudio: null,
        file: '../sounds/Ex2_sound2.wav',
        features: ['rms', 'zcr', 'spectralCrest', 'energy'],
        featureFactors: [1000, 10, 10, 100]
    },

    {
        loadedAudio: null,
        file: '../sounds/Ex2_sound3.wav',
        features: ['rms', 'zcr', 'spectralCrest', 'spectralKurtosis'],
        featureFactors: [1000, 10, 10, 100]
    },
    {
        loadedAudio: null,
        file: '../sounds/Kalte_Ohren_(_Remix_).mp3',
        features: ['rms', 'zcr', 'spectralCrest', 'spectralKurtosis'],
        featureFactors: [1000, 10, 10, 100]
    }];



let lowerRight;
let lowerLeft;
let upperLeft;
let upperRight;

let adoDataIndex = 0;

const featureColors = {
    rms: [0, 0, 205, 200],
    spectralCentroid: [65, 105, 225, 200],
    mfcc: [255, 69, 0, 200],
    zcr: [173, 255, 47, 200],
    spectralCrest: [0, 206, 209, 200],
    energy: [139, 0, 0, 200],
    spectralKurtosis: [138, 43, 226, 200]
};

function preload() {
    // Retrieve the stored variable values from localStorage
    const storedData = localStorage.getItem('adoDataIndex');

    // Restore the index if it'S available
    if (storedData) {
        adoDataIndex = JSON.parse(storedData);
    }
    const storedFlag = localStorage.getItem('allowToPlayTrack');

    // Restore the index if it'S available
    if (storedData) {
        allowToPlayTrack = JSON.parse(storedFlag);
    }

    soundFormats('mp3', 'ogg', 'wav');
    audioData[adoDataIndex]['loadedAudio'] = loadSound(audioData[adoDataIndex]['file']);
}

function setupEverything() {



    if (!allowToPlayTrack) {
        adoDataIndex = 0;
    }

    createCanvas(windowWidth, windowHeight);
    background(180);

    playStopButton = createButton('play');
    playStopButton.position(200, 20);
    playStopButton.mousePressed(playStopSound);
    jumpButton = createButton('jump');
    jumpButton.position(250, 20);
    jumpButton.mousePressed(jumpSong);
    nextTrack = createButton('Next track');
    nextTrack.position(300, 20);
    nextTrack.mousePressed(loadNextTrack);

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
    amplitude = new p5.Amplitude();

    initSpeechRec(); //speech recognisation started only after presseing "stop" else it is stopped.


}

function initSpeechRec() {
    //ref: https://github.com/IDMNYU/p5.js-speech/blob/master/examples/05continuousrecognition.html
    voiceCommandsRec = new p5.SpeechRec('en-UK', extractCommands);
    voiceCommandsRec.continuous = true; // do continuous recognition
    voiceCommandsRec.interimResults = true; // allow partial recognition (faster, less accurate)
}

function setup() {
    setupEverything();
};

function draw() {
    background(180, 100);

    fill(0);
    text('volume', 80, 20);
    text('rate', 80, 65);
    text('pan', 80, 110);
    textSize(12);
    fill(0, 0, 255); // Red color
    // Display text on the canvas
    text('Selected track: ' + extractFileName(audioData[adoDataIndex]['file']), 500, 20);
    text('Stop the track to give voice commands: Rectangle, Circle, Arcs', 500, 40);
    let vol = Math.pow(sliderVolume.value(), 3);
    audioData[adoDataIndex]['loadedAudio'].setVolume(vol);
    audioData[adoDataIndex]['loadedAudio'].rate(sliderRate.value());
    audioData[adoDataIndex]['loadedAudio'].pan(sliderPan.value());

    let spectrum = fft.analyze();
    drawSpectrum(spectrum, 200, 50);
    console.log(shape);
    if (shape == 'circle') {
        drawCircles();
    } else if (shape == 'rectangle') {
        drawRects();
    } else {
        drawArcs();
    }

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

function drawRects() {
    fill(featureColors[audioData[adoDataIndex]['features'][0]]);
    rect(50, 275, lowerLeft, lowerLeft, 0, HALF_PI);
    fill(featureColors[audioData[adoDataIndex]['features'][1]]);
    rect(200, 275, lowerRight, lowerRight, HALF_PI, PI);
    fill(featureColors[audioData[adoDataIndex]['features'][2]]);
    rect(350, 275, upperRight, upperRight, PI, PI + HALF_PI);
    fill(featureColors[audioData[adoDataIndex]['features'][3]]);
    rect(500, 275, upperLeft, upperLeft, PI + HALF_PI, 2 * PI);
}

function drawCircles() {
    // Get the current amplitude level of the audio
    level = amplitude.getLevel();

    // Map the amplitude to the y-coordinate of the circle
    let y = random(map(level, 0, 1, height, 275), height);


    fill(featureColors[audioData[adoDataIndex]['features'][0]]);
    circle(100, y, lowerLeft);

    fill(featureColors[audioData[adoDataIndex]['features'][1]]);
    y = map(level, 0, 1, height, 275);
    x = random(0, width / 2);
    circle(250, y, lowerRight);

    fill(featureColors[audioData[adoDataIndex]['features'][2]]);
    y = map(level, 0, 1, height, 275);
    x = random(0, width / 2);
    circle(450, y, upperRight);

    fill(featureColors[audioData[adoDataIndex]['features'][3]]);
    y = map(level, 0, 1, height, 275);
    x = random(0, width / 2);
    circle(500, y, upperLeft);

}

function extractFileName(fullPath) {
    /*ref:https://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript*/
    var filename = fullPath.split(['/', '\\']).pop();
    return filename
}

function drawArcs() {
    let x = width / 2;
    let y = height / 2;
    fill(featureColors[audioData[adoDataIndex]['features'][0]]);
    arc(x, y, lowerLeft, lowerLeft, 0, HALF_PI);
    fill(featureColors[audioData[adoDataIndex]['features'][1]]);
    arc(x, y, lowerRight, lowerRight, HALF_PI, PI);
    fill(featureColors[audioData[adoDataIndex]['features'][2]]);
    arc(x, y, upperRight, upperRight, PI, PI + HALF_PI);
    fill(featureColors[audioData[adoDataIndex]['features'][3]]);
    arc(x, y, upperLeft, upperLeft, PI + HALF_PI, 2 * PI);
}

function jumpSong() {
    var dur = audioData[adoDataIndex]['loadedAudio'].duration();
    var t = random(dur);
    audioData[adoDataIndex]['loadedAudio'].jump(t);
}

function playStopSound() {
    if (audioData[adoDataIndex]['loadedAudio'].isPlaying()) {
        audioData[adoDataIndex]['loadedAudio'].stop();
        analyzer.stop();
        // Start listening
        voiceCommandsRec.start();

        playStopButton.html('play');
        background(180);

    } else {

        audioData[adoDataIndex]['loadedAudio'].loop()
        analyzer.start();
        // Stop listening
        //voiceCommandsRec.stop();
        playStopButton.html('stop');


    }
}

function loadNextTrack() {
    if (!audioData[adoDataIndex]['loadedAudio'].isPlaying()) {
        if (adoDataIndex < (audioData.length - 1)) {
            adoDataIndex++;
        } else {
            adoDataIndex = 0;
        }
        allowToPlayTrack = true;
        localStorage.setItem('allowToPlayTrack', JSON.stringify(allowToPlayTrack));
        localStorage.setItem('adoDataIndex', JSON.stringify(adoDataIndex));
        reloadSketch();
    }

}

function reloadSketch() {
    // Store the variable values in localStorage
    localStorage.setItem('adoDataIndex', JSON.stringify(adoDataIndex));
    localStorage.setItem('allowToPlayTrack', JSON.stringify(allowToPlayTrack));

    preload();
    // Reload the sketch by calling the setup() function again
    setupEverything()
}

function extractCommands() {
    //Ref:https://idmnyu.github.io/p5.js-speech/
    let transcript = voiceCommandsRec.resultString;
    //ref: https://github.com/IDMNYU/p5.js-speech/blob/master/examples/05continuousrecognition.html
    var command = voiceCommandsRec.resultString.split(' ').pop();
    // Process the recognized commands
    processCommands(command);

}

function processCommands(transcript) {
    // Check if expected commands are present in the speech, and set the appropriate shape for the recognised command
    if (transcript.includes('circle')) {
        shape = 'circle';
    } else if (transcript.includes('rectangle')) {
        shape = 'rectangle';
    } else if (transcript.includes('arcs')) {
        shape = 'arcs';
    }

}
