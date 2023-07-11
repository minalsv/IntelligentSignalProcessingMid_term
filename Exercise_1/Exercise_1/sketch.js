//track to be used in this app
let trackPlayer;

//track status related variables
let isPlaying = false;
let isLooping = false;
let isRecording = false
//canvas related variables
let spectrumInCnv;
let cnvElmntIn;
let spectrumOutCnv;
let cnvElmntOut;
const canvsWidth = 500;
const canvasHeight = 400;

let fft;
let amplitude;
let maxAmplitude;
let ctx;
let trackOriginalState;

/**
It loads the resources required for the app.
*/
function preload() {
    trackPlayer = loadSound('audio/Poem.wav');
}

/**
It initializes the resources required for the app.
*/
function setup() {

    trackOriginalState = true;
    trackPlayer.connect();
    trackPlayer.pause();

    cnvElmntIn = document.getElementById('specturmIn');
    spectrumInCnv = cnvElmntIn.getContext('2d');
    cnvElmntIn.width = canvsWidth;
    cnvElmntIn.height = canvasHeight;

    cnvElmntOut = document.getElementById('specturmOut');
    spectrumOutCnv = cnvElmntOut.getContext('2d');
    cnvElmntOut.width = canvsWidth;
    cnvElmntOut.height = canvasHeight;


    fft = new p5.FFT();
    amplitude = new p5.Amplitude();


}

/**
It updates the display for the app.
*/
function draw() {

    //set two canvases - for the input track display and for the output track display.
    spectrumInCnv.clearRect(0, 0, cnvElmntIn.width, cnvElmntIn.height);
    spectrumOutCnv.clearRect(0, 0, cnvElmntOut.width, cnvElmntOut.height);

    // Display the fft spectrum of the current track based on the status of the track
    //i.e. unprocessed track - spectrum In and processed track - spectrum out
    // true - unprocessed track.
    drawSpectrum(trackOriginalState);

    //display track's amplitude value in the form of the rectangle's dimension
    displayAplitudeMappedRect(spectrumInCnv);

    //if the track is ended then change the flag "playing" status
    if (isTrackEnded(trackPlayer)) {
        isPlaying = false;
    }
}

/**Display the rectangle which has it's dimensions mapped to the audio feature amplitude 
in the input canvas*/
function displayAplitudeMappedRect(cnvs) {
    let ampLevel = amplitude.getLevel();
    let diameter = map(ampLevel, 0, 1, 0, 200);
    fill(0);
    cnvs.fillRect(250, 250, diameter, diameter);
}

/**Returns the status of the input track if it's still playing or not*/
function isTrackEnded(track) {
    if (track.isPlaying()) {
        return false; //still playing
    }
    return true; //track is not running
}



function calculateMaxAmplitude(track) {
    track.play();
    track.setVolume(0); // Mute the audio
    maxAmplitude = track.getLevel();
    track.stop();
}

function getNormalisedFactor(track) {
    track.play();
    track.setVolume(1);
    let maxs = track.getPeaks();
    let maxPeak = Math.max(maxs);
    let normFactor = 1 / maxPeak;
    return normFactor;
}

function normaliseTrack(track, normalisedAmplitude) {

    track.amp(getNormalisedFactor(track));
    return track;
}

function drawSpectrum(inputSpectrum) {
    let spectrum = fft.analyze();

    // Draw the spectrum as a bar graph
    for (let i = 0; i < spectrum.length; i++) {
        let x = map(i, 0, spectrum.length, 0, cnvElmntIn.width);
        let h = -cnvElmntOut.height + map(spectrum[i], 0, 255, cnvElmntOut.height, 0);

        let hue = map(i, 0, spectrum.length, 0, 360);

        if (inputSpectrum) {

            spectrumInCnv.fillStyle = "blue";
            spectrumInCnv.fillRect(x, cnvElmntOut.height, width / spectrum.length, h);
        } else {
            spectrumOutCnv.fillStyle = "blue"; //'rgb(hue, 255, 255)';
            spectrumOutCnv.fillRect(x, cnvElmntOut.height, width / spectrum.length, h);
        }

    }
}

/*Play the track  when the button is pressed.*/
function playClick() {
    getAudioContext().resume();
    if (!isPlaying) {
        trackPlayer.play();
        isPlaying = true;
    }

}

/*Pause the track when the button is pressed.*/
function pauseClick() {
    trackPlayer.pause();
    isPlaying = false;
}

/*Stop the track when the button is pressed.*/
function stopClick() {
    trackPlayer.stop();
    isPlaying = false;
}

/*Start the track from the beginning.*/
function skipToStartClick() {
    trackPlayer.jump(0);
}

/*End the track.*/
function skipToEndClick() {
    trackPlayer.jump(trackPlayer.duration());
    isPlaying = false;
}

/*Toggle the loop status i.e. set the track to play in loop(keep playing) or not*/
function toggleLoop() {
    if (isLooping) {
        trackPlayer.setLoop(false);
    } else {
        trackPlayer.setLoop(true);
    }
    isLooping = !isLooping;
}

/*Start or Sop the recording.*/
function toggleRecording() {
    if (trackPlayer.isPlaying()) {
        //allow to start/stop recording only if the track is running else just ignore.
        if (isRecording) {
            trackPlayer.stopRecording();
        } else {
            trackPlayer.startRecording();
        }
        isRecording = !isRecording;
    }

}
