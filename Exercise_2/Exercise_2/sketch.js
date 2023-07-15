/*Ref: basic code is taken from the fft analyzer example exercise_8 from the course and modified it
Also p5.js examples*/
/*App data and variables*/
let analyzer;
let features;

let appData;
let storedVariables;
let allowToPlayTrack = false;
let shape = 'circle';

let voiceCommandsRec;
let displayFlowers = false;

/*First 4 features are extracted in these variables for clarity.*/
let lowerRight;
let lowerLeft;
let upperLeft;
let upperRight;

/*The app allows to select 4 files and so adoDataIndex help to identify and select file related data*/
let adoDataIndex = 0;

/*Stores the track specific data e.g. which file, which features to extract and what shall be the multiplying factor for them*/
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
        features: ['rms', 'zcr', 'spectralCrest', 'spectralKurtosis', 'energy', 'spectralFlatness', 'chroma', 'spectralSlope'],
        featureFactors: [1000, 10, 10, 100, 100, 10, 10, 10]
    }];


/*Feature data is read after the analyzer gives it and then it has been stored here as "features" from analyzer are not accessible reliably throughout the scope */
let savedFeatureData = {
    rms: NaN,
    spectralCentroid: NaN,
    mfcc: NaN,
    zcr: NaN,
    spectralCrest: NaN,
    energy: NaN,
    spectralKurtosis: NaN,
    spectralFlatness: NaN,
    complexSpectrum: NaN,
    spectralSlope: NaN,
    spectralRolloff: NaN,
    spectralSpread: NaN,
    spectralSkewness: NaN,
    amplitudeSpectrum: NaN,
    loudness: NaN,
    perceptualSpread: NaN,
    perceptualSharpness: NaN,
    powerSpectrum: NaN,
    chroma: NaN,
    spectralFlux: NaN,
    melBands: NaN
};

/*Each available feature is mapped to a color so easy to extract later*/
const featureColors = {
    rms: [0, 0, 205, 200],
    spectralCentroid: [65, 105, 225, 200],
    mfcc: [255, 69, 0, 200],
    zcr: [173, 255, 47, 200],
    spectralCrest: [0, 206, 209, 200],
    energy: [139, 0, 0, 200],
    spectralKurtosis: [138, 43, 226, 200],
    spectralFlatness: [255, 0, 255],
    complexSpectrum: [0, 100, 0],
    spectralSlope: [85, 107, 47],
    spectralRolloff: [255, 218, 185],
    spectralSpread: [255, 105, 180],
    spectralSkewness: [240, 128, 128],
    amplitudeSpectrum: [255, 215, 0],
    loudness: [176, 224, 230],
    perceptualSpread: [165, 42, 42],
    perceptualSharpness: [0, 0, 0],
    powerSpectrum: [255, 222, 173],
    chroma: [127, 255, 212],
    spectralFlux: [30, 144, 255],
    melBands: [135, 206, 235]
};

/*Preload functins loads the resources.*/
function preload() {
    
    /*ref: https://thecodingtrain.com/tracks/p5-tips-and-tricks/more-p5/local-storage
    ref: https://www.geeksforgeeks.org/p5-js-storeitem-function/*/
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
    audioData[adoDataIndex]['loadedAudio'] = loadSound(audioData[adoDataIndex]['file']);//load cureent index related file
}

/*Need this function for reloading the app, calling setup was not working correctly after reload*/
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
                callback: processFeatures
            });
        console.log("Analyzer initialized!");

    }
    amplitude = new p5.Amplitude();

    
    initSpeechRec(); //speech recognisation started only after presseing "stop" else it is stopped.


}

/*A callback function to extract the features which are returned by the Meyda analyzer*/
function processFeatures(features) {

    console.log(features);
    displayFlowers = false;
    if (audioData[adoDataIndex]['features'].length > 5) {
        displayFlowers = true;
    }
    lowerRight = features[audioData[adoDataIndex]['features'][0]] * audioData[adoDataIndex]['featureFactors'][0];
    lowerLeft = features[audioData[adoDataIndex]['features'][1]] * audioData[adoDataIndex]['featureFactors'][1];
    upperLeft = features[audioData[adoDataIndex]['features'][2]] * audioData[adoDataIndex]['featureFactors'][2];
    upperRight = features[audioData[adoDataIndex]['features'][3]] * audioData[adoDataIndex]['featureFactors'][3];
    console.log(lowerRight, lowerLeft, upperLeft, upperRight);

    for (i = 0; i < audioData[adoDataIndex]['features'].length; i++) {
        savedFeatureData[audioData[adoDataIndex]['features'][i]] = features[audioData[adoDataIndex]['features'][i]];
    }

}

/*Initializes the speech recorder 
/*Ref: https://editor.p5js.org/re7l/sketches/SkcHNSSKQ*/
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
    /*Initialize the display setup*/
    background(180, 100);

    fill(0);
    text('volume', 80, 20);
    text('rate', 80, 65);
    text('pan', 80, 110);
    textSize(12);
    fill(0, 0, 255); // Red color
    // Display text on the canvas
    text('Selected track: ' + extractFileName(audioData[adoDataIndex]['file']), 500, 20);
    text('Stop the track to give voice commands: Rectangle, Circle, Arc', 500, 40);
    let vol = Math.pow(sliderVolume.value(), 3);
    audioData[adoDataIndex]['loadedAudio'].setVolume(vol);
    audioData[adoDataIndex]['loadedAudio'].rate(sliderRate.value());
    audioData[adoDataIndex]['loadedAudio'].pan(sliderPan.value());

    /*Draw a specturm for the current running track
    Ref: Intelligent signal processing course Exercise 8 */
    let spectrum = fft.analyze();
    drawSpectrum(spectrum, 200, 50);

    /*Draw the background shapes based on the current selection of the shape.*/
    console.log(shape);
    if (shape == 'circle') {
        drawCircles();
    } else if (shape == 'rectangle') {
        drawRects();
    } else if (shape == 'arc') {
        drawArcs();
    }

    /*Draw the flowers only for the file Kalte_Ohren_(_Remix_).mp3 */
    showFlowers();
}

/*Draw the flowers - PEr feature one flower, map it's parameters to the petal length, color of the petal, amplitude of the track*/
function showFlowers() {
    if (displayFlowers && audioData[adoDataIndex]['loadedAudio'].isPlaying()) {
        let centerColor = featureColors[audioData[adoDataIndex]['features'][0]];
        for (i = 1; i < audioData[adoDataIndex]['features'].length; i++) {

            let petalLength = savedFeatureData[audioData[adoDataIndex]['features'][i]] * audioData[adoDataIndex]['featureFactors'][i];
            let stemX = random(0, width);
            drawFlowers(featureColors[audioData[adoDataIndex]['features'][i]],
                centerColor, stemX, petalLength);
        }

    }
}

function drawFlowers(petalColor, centerColor, StemX, petalLength) {

    //Ref: https://editor.p5js.org/aanapandey05/sketches/r3diSJ9Gb
    // Draw a stem
    // Get the current amplitude level of the audio
    level = amplitude.getLevel();
    // Map the amplitude to the y-coordinate of the circle
    let stemHeight = random(map(level, 0, 1, height / 2, height / 2 - 100), height / 2);

    drawAFlower(stemHeight, StemX, petalColor, centerColor, petalLength);

}

function drawAFlower(stemHeight, stemStart, petalColor, centerColor, petalLength) {


    fill(0, 128, 0); // Green color
    rect(stemStart, stemHeight, 10, height / 2);

    // Draw petals
    fill(petalColor); // Yellow color
    for (let angle = 0; angle < 360; angle += 60) {
        push();
        translate(stemStart + 5, stemHeight);
        rotate(radians(angle));
        ellipse(0, -50, 40, 40 + petalLength);
        fill(centerColor);
        ellipse(0, -20, 30);
        pop();
    }

}


/*Draw fft spectrum- Exercise 8 from coursera intelligent signal processing course*/
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

/*Draw rectangles whos two sides are mapped to a feature value
applicable to first 4 features only*/
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

/*Draw circles whos two radius is mapped to a feature value
applicable to first 4 features only*/
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

/*A helper function: extracts a file name from the path*/
function extractFileName(fullPath) {
    /*ref:https://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript*/
    var filename = fullPath.split(['/', '\\']).pop();
    return filename
}

/*Draw circles whos two radius is mapped to a feature value
applicable to first 4 features only
Ref: Exercise 8 from coursera Intelligent signal processing course*/
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

/*Jumps to the next portion of the song
Ref: Exercise 8 from coursera Intelligent signal processing course*/
function jumpSong() {
    var dur = audioData[adoDataIndex]['loadedAudio'].duration();
    var t = random(dur);
    audioData[adoDataIndex]['loadedAudio'].jump(t);
}

/*Play and stop song control, also enables the analyzer and speech recogniser*/
function playStopSound() {
    if (audioData[adoDataIndex]['loadedAudio'].isPlaying()) {
        audioData[adoDataIndex]['loadedAudio'].stop();
        analyzer.stop();
        playStopButton.html('play');
        voiceCommandsRec.start()
        background(180);

    } else {
        //start running the track and enable the analyzer as well as the voice recorder
        audioData[adoDataIndex]['loadedAudio'].loop()
        analyzer.start();
        voiceCommandsRec.stop()
        playStopButton.html('stop');


    }

}

/*The app allows to select next track using this button*/
function loadNextTrack() {
    if (!audioData[adoDataIndex]['loadedAudio'].isPlaying()) {
        if (adoDataIndex < (audioData.length - 1)) {
            adoDataIndex++; //point to the next track
        } else {
            adoDataIndex = 0; //wrap over
        }
        //store the variables and then reload the app
        allowToPlayTrack = true;
        localStorage.setItem('allowToPlayTrack', JSON.stringify(allowToPlayTrack));
        localStorage.setItem('adoDataIndex', JSON.stringify(adoDataIndex));
        reloadSketch(); //reload the app
    }

}

function reloadSketch() {
    // Store the variable values in localStorage
    localStorage.setItem('adoDataIndex', JSON.stringify(adoDataIndex));
    localStorage.setItem('allowToPlayTrack', JSON.stringify(allowToPlayTrack));

    preload();
    // Reload the sketch by calling the setup like function again
    setupEverything()
}

/*Extract voice commands from the voice recorder and pass it for further processing*/
function extractCommands() {
    //Ref:https://idmnyu.github.io/p5.js-speech/
    let transcript = voiceCommandsRec.resultString;
    //ref: https://github.com/IDMNYU/p5.js-speech/blob/master/examples/05continuousrecognition.html
    var command = voiceCommandsRec.resultString.split(' ').pop();
    // Process the recognized commands
    processCommands(command);

}

/*Check if the voice input matches with the required commands and process it by changing the current shape*/
function processCommands(transcript) {
    // Check if expected commands are present in the speech, and set the appropriate shape for the recognised command
    if (transcript.includes('circle')) {
        shape = 'circle';
    } else if (transcript.includes('rectangle')) {
        shape = 'rectangle';
    } else if (transcript.includes('arc') || transcript.includes('Ark')) {
        shape = 'arc';
    }

}
