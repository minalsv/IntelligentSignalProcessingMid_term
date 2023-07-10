let isPlaying = false;
let isLooping = false;
let isRecording = false;
let spectrumInCnv;
let fft;
let trackPlayer;

function preload() {
    trackPlayer = loadSound('audio/Poem.wav');
}

function setup() {

    trackPlayer.connect();
    trackPlayer.pause();

    var cnvElmnt = document.getElementById("specturmIn");
    spectrumInCnv = cnvElmnt.getContext("2d")
    fft = new p5.FFT();
}

function draw() {
    // Display the current state of the sound
    let spectrum = fft.analyze();

    // Draw the spectrum as a bar graph
    for (let i = 0; i < spectrum.length; i++) {
        let x = map(i, 0, spectrum.length, 0, width);
        let h = -height + map(spectrum[i], 0, 255, height, 0);
        fill(0, 255, 0);
        spectrumInCnv.rect(x, height, width / spectrum.length, h);
    }

}

function playClick() {
    getAudioContext().resume();
    if (isPlaying) {
        trackPlayer.pause();
    } else {
        trackPlayer.loop();
    }
    isPlaying = !isPlaying;
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
