class MovableAnchor extends HTMLElement {
  constructor() {
    super();
  }
  #controller = null;

  #dragging = false;

  #mousedown(event) {
    this.#dragging = true;
  }

  #mousemove(e) {
    if (this.hasAttribute("drag") && !this.#dragging) return;
    this?.style.setProperty("--pointer-x", `${e.clientX}px`);
    this?.style.setProperty("--pointer-y", `${e.clientY}px`);
  }
  #mouseup(event) {
    this.#dragging = false;
  }

  #height() {
    return this.clientHeight ? `${this.clientHeight}px` : "20px";
  }
  #width() {
    return this.clientWidth ? `${this.clientWidth}px` : "20px";
  }

  #setStyles() {
    this.setAttribute(
      "style",
      `position: absolute; display: block;
      --height: calc(${this.#height()} / 2);
      --width: calc(${this.#width()} / 2);
      top: calc(var(--pointer-y) - var(--height));
      left: calc(var(--pointer-x) - var(--width));`
    );
  }

  connectedCallback() {
    this.#setStyles();
    this.#controller = new AbortController();

    this.addEventListener("mousedown", this.#mousedown, {
      signal: this.#controller.signal,
    });
    document.addEventListener(
      "pointermove",
      (event) => this.#mousemove(event),
      {
        signal: this.#controller.signal,
      }
    );
    this.addEventListener("mouseup", this.#mouseup, {
      signal: this.#controller.signal,
    });
  }

  disconnectedCallback() {
    this.#controller.abort();
  }
}

// Registers custom element
window.customElements.define("movable-anchor", MovableAnchor);
