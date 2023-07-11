let isPlaying = false;
let isLooping = false;
let isRecording = false;
let spectrumInCnv;
let cnvElmntIn;
let spectrumOutCnv;
let cnvElmntOut;
let fft;
let trackPlayer;
let amplitude;
let maxAmplitude;
let ctx;
let trackOriginalState;
const canvsWidth=500;
const canvasHeight=400;
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

    displayAplitudeMappedRect(spectrumInCnv);
  
    if(isTrackEnded(trackPlayer)){
        isPlaying = false;
    }
}

function displayAplitudeMappedRect(cnvs){
    let ampLevel = amplitude.getLevel();
    let diameter = map(ampLevel, 0, 1, 0, 200);
    fill(0);
    cnvs.fillRect(250, 250, diameter, diameter);    
}

function isTrackEnded(track){
    if (track.isPlaying()) {
        return false;
    }
    return true;
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

        let ampLevel = amplitude.getLevel();
        let color = map(ampLevel, 0, 255);

        fill(color, color, color);
        if (inputSpectrum) {
            spectrumInCnv.fillRect(x, cnvElmntOut.height, width / spectrum.length, h);
        } else {
            spectrumOutCnv.fillRect(x, cnvElmntOut.height, width / spectrum.length, h);
        }

    }
}

function playClick() {
    getAudioContext().resume();
    if (!isPlaying) {
        trackPlayer.play();
        isPlaying = true;
    }
    
}

function pauseClick() {
    trackPlayer.pause();
    isPlaying = false;
}

function stopClick() {
    trackPlayer.stop();
    isPlaying = false;
}

function skipToStartClick() {
    trackPlayer.jump(0);
}

function skipToEndClick() {
    trackPlayer.jump(trackPlayer.duration());
    isPlaying = false;
}

function toggleLoop() {
    if (isLooping) {
        trackPlayer.setLoop(false);
    } else {
        trackPlayer.setLoop(true);
    }
    isLooping = !isLooping;
}

function toggleRecording() {
    if (isRecording) {
        trackPlayer.stopRecording();
    } else {
        trackPlayer.startRecording();
    }
    isRecording = !isRecording;
}
