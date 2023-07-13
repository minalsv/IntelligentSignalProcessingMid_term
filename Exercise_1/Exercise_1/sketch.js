/*The goal of this code is to demonstrate the audio signal processing using p5.js 
It has implemented various filters and displayed the effects of it in the form of an FFT spectrum.

All the default values and min-max limits are taken from the p5.js library documentation
e.g. Ref: https://p5js.org/reference/#/p5.Compressor/attack*/
/*------------------Variables and data -----------------------------*/
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
const canvsWidth = 400;
const canvasHeight = 400;

//filters, analyzer and all other functionality related variables.
let fftIn;
let fftOut;

let amplitude;
let maxAmplitude;
let ctx;
let trackOriginalState;

let recordedAudioFile;
let audioRecorder;

//Filter variables
let appFilter;
var filterData = {
    filterType: 'lowpass',
    cutoffFreq: 22050,
    resonance: 10,
    drywet: 0.5,
    outputLevel: 0.5
};
let filterDrywetSlider;
let filterOutputLevelSlider;

//Reverb 
let appReverb;
var reverbData = {
    duration: 3,
    decayRate: 2,
    reverseStatus: 0,
    drywet: 0.5,
    outputLevel: 0.5
};
let reverbDrywetSlider;
let reverbOutputLevelSlider;

/*Master volume*/
let appMasterVolume;
let masterVolume = 1;
let masterVolumeSlider;

/*Dynamic compressor*/
let appDynamicCompressor;
let dComprDryWetSlider;
let dComprDistOutputLevelSlider;
let dynamicCompData = {
    attack: 0.003,
    knee: 30,
    release: 0.25,
    ratio: 12,
    threshold: 0,
    dryWet: 0,
    outputLevel: 0
};

/*Waveshaper distortion*/
let appWvShprDstortr;
let wvShprDstortrData = {
    distorionAmount: 0,
    oversample: 'none',
    dryWet: 0,
    outputLevel: 0
};
let wvShprDstortrDryWetSlider;
let wvShprDstortrOutputLevelSlider;
/*-------------------------------Implementation-----------------------------------------*/
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


    initializeCanvases();

    /*Need two ffts to show input file spectrum vs output file spectrum*/
    fftIn = new p5.FFT();
    fftOut = new p5.FFT();

    amplitude = new p5.Amplitude();

    //to record the audio and save it to the file
    audioRecorder = new p5.SoundRecorder();
    audioRecorder.setInput();
    recordedAudioFile = new p5.SoundFile();

    //get a new filter and connect it to the player
    trackPlayer.disconnect();

    initializeFilter();

    initializeWaveshaperDistortion();

    initializeDynamicCompressorControls();

    initializeReverb();

    initializeMasterVolume();

    trackPlayer.connect(appFilter);

    /*Connect the chain*/
    connectAllEffectsAsAChain();

}

/**
It updates the display for the app.
*/
function draw() {

    //set two canvases - for the input track display and for the output track display.
    spectrumInCnv.clearRect(0, 0, cnvElmntIn.width, cnvElmntIn.height);
    spectrumOutCnv.clearRect(0, 0, cnvElmntOut.width, cnvElmntOut.height);


    //display track's amplitude value in the form of the rectangle's dimension
    displayAplitudeMappedRect(spectrumInCnv);

    //if the track is ended then change the flag "playing" status
    if (isTrackEnded(trackPlayer)) {
        isPlaying = false;
    }

    // Display the fft spectrum of the current track based on the status of the track
    //i.e. unprocessed track - spectrum In and processed track - spectrum out

    let spectrumInput = fftIn.analyze();

    // Display the input spectrum
    drawSpectrum(spectrumInCnv, spectrumInput, cnvElmntIn);


    // Analyze the filtered audio with FFT
    let spectrumOutput = fftOut.analyze(appFilter);

    // Display the output spectrum
    drawSpectrum(spectrumOutCnv, spectrumOutput,cnvElmntOut);

}

/*Reset all filters by setting all parameters to their default values.*/
function resetToDefault() {
    filterData = {
        filterType: 'lowpass',
        cutoffFreq: 22050,
        resonance: 10,
        drywet: 0.5,
        outputLevel: 0.5
    };

    filterDrywetSlider.value = 0.5;
    filterOutputLevelSlider.value = 0.5;
    appFilter.setType(filterData.filterType);
    appFilter.set(filterData.cutoffFreq, filterData.resonance);



    reverbData = {
        duration: 3,
        decayRate: 2,
        reverseStatus: 0,
        drywet: 0.5,
        outputLevel: 0.5
    };
    reverbDrywetSlider.value = 0.5;
    reverbOutputLevelSlider.value = 0.5;
    appReverb.set(reverbData.duration, reverbData.decayRate, reverbData.reverseStatus)

    dynamicCompData = {
        attack: 0.003,
        knee: 30,
        release: 0.25,
        ratio: 12,
        threshold: 0,
        dryWet: 0,
        outputLevel: 0
    };

    dComprDryWetSlider.value = 0.5;
    dComprDistOutputLevelSlider.value = 0.5;
    appDynamicCompressor.set(dynamicCompData.attack, dynamicCompData.knee, dynamicCompData.ratio, dynamicCompData.threshold, dynamicCompData.release)


    wvShprDstortrData = {
        distorionAmount: 0.25,
        oversample: 'none',
        dryWet: 0,
        outputLevel: 0
    };
    wvShprDstortrDryWetSlider.value = 0.5;
    wvShprDstortrOutputLevelSlider.value = 0.5;
    appWvShprDstortr.set(wvShprDstortrData.amount, wvShprDstortrData.oversample);
}

function initializeWaveshaperDistortion() {


    appWvShprDstortr = new p5.Distortion();

    wvShprDstortrDryWetSlider = document.getElementById('wDistDryWet');
    // Attach an event listener to the filter slider
    wvShprDstortrDryWetSlider.addEventListener('change', wvShprDstortrDryWetChanged);

    wvShprDstortrOutputLevelSlider = document.getElementById('wDistOutputLevel');
    // Attach an event listener to the filter slider
    wvShprDstortrOutputLevelSlider.addEventListener('change', wvShprDstortrOutputLevelChanged);
}

function distortionAmountClick() {
    if (wvShprDstortrData.distorionAmount >= 1.0) {
        wvShprDstortrData.distorionAmount = 0.0;
    } else {
        wvShprDstortrData.distorionAmount = wvShprDstortrData.distorionAmount + 0.1;
    }
    appWvShprDstortr.amount(wvShprDstortrData.distorionAmount);

}

function overSampleClick() {
    if (wvShprDstortrData.oversample == 'none') {
        wvShprDstortrData.oversample = '2X';
    } else if (wvShprDstortrData.oversample == '2x') {
        wvShprDstortrData.oversample = '4X';
    } else {
        wvShprDstortrData.oversample = 'none';
    }
    appWvShprDstortr.oversample(wvShprDstortrData.oversample);
}

function wvShprDstortrDryWetChanged() {
    wvShprDstortrData.dryWet = wvShprDstortrDryWetSlider.value;
    wvShprDstortrData.drywet(wvShprDstortrData.dryWet);
}

function wvShprDstortrOutputLevelChanged() {
    wvShprDstortrData.outputLevel = wvShprDstortrOutputLevelSlider.value;
    wvShprDstortrData.outputLevel(wvShprDstortrData.outputLevel);
}

function initializeDynamicCompressorControls() {

    appDynamicCompressor = new p5.Compressor();

    dComprDryWetSlider = document.getElementById('dComprDryWet');
    // Attach an event listener to the filter slider
    dComprDryWetSlider.addEventListener('change', dComprDryWetChanged);

    dComprDistOutputLevelSlider = document.getElementById('dComprDistOutputLevel');
    // Attach an event listener to the filter slider
    dComprDistOutputLevelSlider.addEventListener('change', dComprDistOutputLevelChanged);
}

function attackClick() {
    if (dynamicCompData.attack >= 1.0) {
        dynamicCompData.attack = 0.0;
    } else {
        dynamicCompData.attack = dynamicCompData.attack + 0.1;
    }
    appDynamicCompressor.attack(dynamicCompData.attack);
}

function kneeClick() {
    if (dynamicCompData.knee >= 40) {
        dynamicCompData.knee = 0;
    } else {
        dynamicCompData.knee = dynamicCompData.knee + 2;
    }
    appDynamicCompressor.knee(dynamicCompData.knee);

}

function releaseClick() {
    if (dynamicCompData.release >= 1) {
        dynamicCompData.release = 0;
    } else {
        dynamicCompData.release = dynamicCompData.release + 0.1;
    }
    appDynamicCompressor.release(dynamicCompData.release);

}

function ratioClick() {
    if (dynamicCompData.ratio >= 20) {
        dynamicCompData.ratio = 1;
    } else {
        dynamicCompData.ratio = dynamicCompData.ratio + 1;
    }

    appDynamicCompressor.ratio(dynamicCompData.ratio);
}

function thresholdClick() {
    if (dynamicCompData.threshold <= -100) {
        dynamicCompData.threshold = 0;
    } else if (dynamicCompData.threshold >= 0) {
        dynamicCompData.threshold = -100;
    } else {
        dynamicCompData.threshold = dynamicCompData.threshold + 10;
    }

    appDynamicCompressor.threshold(dynamicCompData.threshold);

}

function dComprDryWetChanged() {
    dynamicCompData.dryWet = dComprDryWetSlider.value;
    appDynamicCompressor.drywet(dynamicCompData.dryWet);
}

function dComprDistOutputLevelChanged() {
    dynamicCompData.outputLevel = dComprDistOutputLevelSlider.value;
    appDynamicCompressor.amp(dynamicCompData.outputLevel);
}

/*Initializes all the canvas related elements*/
function initializeCanvases() {
    cnvElmntIn = document.getElementById('specturmIn');
    spectrumInCnv = cnvElmntIn.getContext('2d');
    cnvElmntIn.width = canvsWidth;
    cnvElmntIn.height = canvasHeight;

    cnvElmntOut = document.getElementById('specturmOut');
    spectrumOutCnv = cnvElmntOut.getContext('2d');
    cnvElmntOut.width = canvsWidth;
    cnvElmntOut.height = canvasHeight;
}

/*Initializes all the filter related elements*/
function initializeFilter() {
    appFilter = new p5.Filter(filterData.filterType);
    filterDrywetSlider = document.getElementById('filterDryWet');
    // Attach an event listener to the filter slider
    filterDrywetSlider.addEventListener('change', filterDrywetSliderChanged);


    filterOutputLevelSlider = document.getElementById('filterOutputLevel');
    // Attach an event listener to the filter slider
    filterOutputLevelSlider.addEventListener('change', filterOutputLevelSliderChanged);
}

/*Initializes MAster volume controls*/
function initializeMasterVolume() {
    appMasterVolume = new p5.Gain();
    appMasterVolume.amp(masterVolume);

    masterVolumeSlider = document.getElementById('masterVolume');
    // Attach an event listener to the filter slider
    masterVolumeSlider.addEventListener('change', masterVolumeChanged);
}

/*Initializes Reverbe controls*/
function initializeReverb() {
    appReverb = new p5.Reverb();
    reverbDrywetSlider = document.getElementById('reverbDryWet');
    // Attach an event listener to the filter slider
    reverbDrywetSlider.addEventListener('change', reverbDrywetSliderChanged);


    reverbOutputLevelSlider = document.getElementById('reverbOutputLevel');
    // Attach an event listener to the filter slider
    reverbOutputLevelSlider.addEventListener('change', reverbOutputLevelSliderChanged);
}

function masterVolumeChanged() {
    masterVolume = masterVolumeSlider.value;
    masterVolume = map(masterVolume, 0, 100, 0, 1);
    appMasterVolume.amp(masterVolume);
}


/*It directs the signal flow */
function connectAllEffectsAsAChain() {
    /*sound file/audio signal->filter->WaveshaperDistortion->DynamicCompressor->Reverb->MasterVolume->Speaker */

    trackPlayer.disconnect();

    fftIn.setInput(trackPlayer);

    trackPlayer.connect(appFilter);

    appFilter.chain(appWvShprDstortr, appDynamicCompressor, appReverb);
    fftOut = new p5.FFT();
    fftOut.setInput(appFilter.chain(appWvShprDstortr, appDynamicCompressor, appReverb));

    mic = new p5.AudioIn();
    recorder = new p5.SoundRecorder();
    recorder.setInput(appFilter.chain(appWvShprDstortr, appDynamicCompressor, appReverb));
    soundFileRec = new p5.SoundFile();

}

/*On change in dry/wet reverb value this event gets called and then updates the reverb value.*/
function reverbOutputLevelSliderChanged() {
    reverbData.outputLevel = reverbOutputLevelSlider.value;
    appReverb.setVolume(reverbData.outputLevel);
}

/*On change in dry/wet filter value this event gets called and then updates the filter value.*/
function reverbDrywetSliderChanged() {
    reverbData.drywet = reverbDrywetSlider.value;
    appReverb.drywet(reverbData.drywet);
}

function reverbDurationClick() {
    if (reverbData.duration >= 10) {
        reverbData.duration = 0;
    } else {
        reverbData.duration = reverbData.duration + 1;
    }
    appReverb.set(reverbData.duration, reverbData.decayRate, reverbData.reverseStatus); //set the new duration  
}

function decayRateClick() {
    if (reverbData.decayRate >= 100) {
        reverbData.decayRate = 0;
    } else {
        reverbData.decayRate = reverbData.decayRate + 10;
    }

    appReverb.set(reverbData.duration, reverbData.decayRate, reverbData.reverseStatus); //set the new decayrate  
}

function reverseClick() {
    reverbData.reverseStatus = !reverbData.reverseStatus; //Toggle
    appReverb.set(reverbData.duration, reverbData.decayRate, reverbData.reverseStatus); //set the new reverse value
}

/*On change in dry/wet filter value this event gets called and then updates the filter value.*/
function filterOutputLevelSliderChanged() {
    filterData.outputLevel = filterOutputLevelSlider.value;
    appFilter.setVolume(filterData.outputLevel);
}

/*On change in dry/wet filter value this event gets called and then updates the filter value.*/
function filterDrywetSliderChanged() {
    filterData.drywet = filterDrywetSlider.value;
    appFilter.drywet(filterData.drywet);
}



/**Display the rectangle which has it's dimensions mapped to the audio feature amplitude 
in the input canvas*/
function displayAplitudeMappedRect(cnvs) {
    let ampLevel = amplitude.getLevel();
    let diameter = map(ampLevel, 0, 1, 0, 200);
    fill(0);
    let xPos = 350;
    let yPos = 50;

    cnvs.fillRect(xPos, yPos, diameter, diameter);
}

/**Returns the status of the input track if it's still playing or not*/
function isTrackEnded(track) {
    if (track.isPlaying()) {
        return false; //still playing
    }
    return true; //track is not running
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

function drawSpectrum(cnvs, inputSpectrum, inContext) {

    // Draw the spectrum as a bar graph
    for (let i = 0; i < inputSpectrum.length; i++) {
        let x = map(i, 0, inputSpectrum.length, 0, inContext.width);
        let h = -inContext.height + map(inputSpectrum[i], 0, 255, inContext.height, 0);

        let hue = map(i, 0, inputSpectrum.length, 0, 360);

        cnvs.fillStyle = "blue";
        cnvs.fillRect(x, inContext.height, width / inputSpectrum.length, h);
    }
}


/*Play the track  when the button is pressed.*/
function playClick() {
    //getAudioContext().resume();
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
            audioRecorder.stop();
            saveRecording(recordedAudioFile);
            isRecording = false;
        } else {
            trackPlayer.startRecording();
            audioRecorder.record(recordedAudioFile);
            isRecording = true;

        }
    }

}

/*Save the recording to a pre-defined file but in future, ask user to enter the file name*/
function saveRecording(recordedAudioFile) {
    if (recordedAudioFile && !isRecording) {
        saveSound(recordedAudioFile, 'recording.wav');
    }
}

/*Sets the type of the filter */
function setFilterType(type) {
    appFilter.setType(type); //set type as low-pass, high-pass or bandwidth filter.
    filterData.filterType = type;
}

/*On cutoff click, set the cut off freq from 10 to 22050 and every click increase it by 1000 */
function cutOffFreqClick() {
    if (filterData.cutoffFreq >= 22050) {
        filterData.cutoffFreq = 10;
    } else {
        filterData.cutoffFreq = cutoffFreq + 1000;
    }
    appFilter.freq(filterData.cutoffFreq);
}


/*On res click, set the resonance from 0.001 to 1000 and every click increase it by 10 */
function setResonanceClick() {
    if (filterData.resonance >= 1000) {
        filterData.resonance = 0.001;
    } else {
        filterData.resonance = filterData.resonance + 10;
    }
    appFilter.res(filterData.resonance); //set the new resonance
}

function filterDrywetSliderChanged() {
    appFilter.drywet(filterDrywetSlider.value()); //set the new drywet value
}
