   let sound;
    let isPlaying = false;
    let isLooping = false;
    let isRecording = false;

    function preload() {
      sound = loadSound('audio/Counting.wav'); // Replace with the path to your audio file
    }

    function setup() {

    }

    function draw() {

    }

    function togglePlayback() {
      if (isPlaying) {
        sound.pause();
      } else {
        sound.loop();
      }
      isPlaying = !isPlaying;
    }

    function pausePlayback() {
      sound.pause();
      isPlaying = false;
    }

    function stopPlayback() {
      sound.stop();
      isPlaying = false;
    }

    function skipToStart() {
      sound.jump(0);
    }

    function toggleLoop() {
      if (isLooping) {
        sound.setLoop(false);
      } else {
        sound.setLoop(true);
      }
      isLooping = !isLooping;
    }

    function toggleRecording() {
      if (isRecording) {
        sound.stopRecording();
      } else {
        sound.startRecording();
      }
      isRecording = !isRecording;
    }