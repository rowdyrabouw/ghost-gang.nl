// gamepad navigation
import { GamepadListener } from "/assets/js/libs/gamepad/gamepad.js";

const filename = new URL(document.location.href).pathname.split("/").pop();
const currentIndex = parseInt(filename.split("index")[1].split(".")[0], 10);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    const nextIndex = currentIndex + 1;
    window.location.href = `/talk/index${nextIndex}.html?talk=true`;
  } else if (e.key === "ArrowLeft" && currentIndex > 1) {
    const prevIndex = currentIndex - 1;
    window.location.href = `/talk/index${prevIndex}.html?talk=true`;
  } else if (e.key === "ArrowUp") {
    const audio = document.getElementById("audio");
    if (audio) {
      audio.play();
    }
  }
});

// gamepad navigation
const LOG = true;

window.addEventListener("load", () => {
  const listener = new GamepadListener({
    deadZone: 0.05,
    precision: 3,
  });

  const log = (message) => {
    if (LOG) {
      console.info(message);
    }
  };

  listener.on("gamepad:connected", (event) => {
    const { gamepad } = event.detail;
    log(`Connected: ${gamepad.id}`, event.detail);
  });

  listener.on("gamepad:disconnected", (event) => {
    log("Disconnected", event.detail);
  });

  listener.on("gamepad:axis", (event) => {
    const { axis, value } = event.detail;
    if (axis === 0 && value === 1) {
      log("Move Right");
      const nextIndex = currentIndex + 1;
      window.location.href = `/talk/index${nextIndex}.html?talk=true`;
    }
    if (axis === 0 && value === -1 && currentIndex > 1) {
      log("Move Left");
      const prevIndex = currentIndex - 1;
      window.location.href = `/talk/index${prevIndex}.html?talk=true`;
    }
  });

  listener.on("gamepad:button", (event) => {
    const { button, pressed } = event.detail;
    if (button === 2 && pressed) {
      log("Fire!");
      const audio = document.getElementById("audio");
      if (audio) {
        audio.play();
      }
    }
  });

  listener.start();
});
