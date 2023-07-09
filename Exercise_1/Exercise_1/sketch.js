   let sound;
    let isPlaying = false;
    let isLooping = false;
    let isRecording = false;

    function preload() {
      sound = loadSound('audio/Counting.wav'); // Replace with the path to your audio file
    }

    function setup() {
      createCanvas(400, 400);
    }

    function draw() {
      background(220);
      // Display the current state of the sound
      if (isPlaying) {
        fill('green');
        text('Playing', 10, 20);
      } else {
        fill('red');
        text('Paused', 10, 20);
      }
      if (isLooping) {
        fill('blue');
        text('Looping', 10, 40);
      }
      if (isRecording) {
        fill('purple');
        text('Recording', 10, 60);
      }
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