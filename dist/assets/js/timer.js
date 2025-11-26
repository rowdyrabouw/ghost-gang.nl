class CountdownTimer {
  constructor() {
    this.minutes = 2;
    this.secondsRemaining = 0;
    this.intervalHandle = null;
  }

  tick() {
    const timeDisplay = document.querySelector("#time");

    // turn the seconds into mm:ss
    const min = Math.floor(this.secondsRemaining / 60);
    let sec = this.secondsRemaining - min * 60;

    //add a leading zero (as a string value) if seconds less than 10
    if (sec < 10) {
      sec = "0" + sec;
    }

    // concatenate with colon
    const message = min.toString() + ":" + sec;

    // now change the display
    timeDisplay.innerHTML = message;

    // stop is down to zero
    if (this.secondsRemaining === 0) {
      clearInterval(this.intervalHandle);
      const audio = new Audio("/assets/mp3/ghost.mp3");
      audio.play();
    }

    //subtract from seconds remaining
    this.secondsRemaining--;
    localStorage.setItem("secondsRemaining", this.secondsRemaining);
  }

  startCountdown(reset) {
    let minutes;
    if (reset) {
      this.secondsRemaining = this.minutes * 60;
    } else {
      const storedSeconds = localStorage.getItem("secondsRemaining");
      if (storedSeconds) {
        this.secondsRemaining = parseInt(storedSeconds, 10);
      }
    }

    if (isNaN(this.secondsRemaining)) {
      alert("Time not set correctly.");
      return;
    }

    if (this.secondsRemaining > 0) {
      this.intervalHandle = setInterval(() => this.tick(), 1000);
    }
  }

  init(reset) {
    this.startCountdown(reset);
  }
}

export default CountdownTimer;
