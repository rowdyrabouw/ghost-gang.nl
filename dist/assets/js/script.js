// web components
import { Header } from "./header.js";
import { Baseline } from "./baseline.js";

// hightlighting code
import hljs from "./libs/highlight/core.js";
import javascript from "./libs/highlight/javascript.js";
import css from "./libs/highlight/css.js";
import xml from "./libs/highlight/xml.js";

// gamepad navigation
import { GamepadListener } from "./libs/gamepad/gamepad.js";

// web components
customElements.define("gg-header", Header);
customElements.define("gg-baseline", Baseline);

// hightlighting code
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("xml", xml);
hljs.highlightAll();

const preElements = document.querySelectorAll("pre");
preElements.forEach((pre) => pre.classList.remove("hide"));

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
      const next = document.querySelector("#next");
      if (next) {
        next.click();
      }
    }
    if (axis === 0 && value === -1) {
      log("Move Left");
      const previous = document.querySelector("#previous");
      if (previous) {
        previous.click();
      }
    }
    if (axis === 1 && value === 1) {
      log("Move Down");
    }
    if (axis === 1 && value === -1) {
      log("Move Up");
    }
  });

  listener.on("gamepad:button", (event) => {
    const { button, pressed } = event.detail;
    if (button === 2 && pressed) {
      log("Fire!");
    }
  });

  listener.start();
});
