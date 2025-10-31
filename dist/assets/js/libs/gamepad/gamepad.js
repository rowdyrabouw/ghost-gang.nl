// ES6 Module version of gamepad.js

// EventEmitter class
class EventEmitter {
  constructor() {
    this._events = {};
    this.on = this.addEventListener;
    this.off = this.removeEventListener;
  }

  emit(type, detail) {
    if (Object.prototype.hasOwnProperty.call(this._events, type)) {
      const listeners = this._events[type];
      const event = { type, detail };
      for (let i = 0; i < listeners.length; i++) {
        this.handle(listeners[i], event);
      }
    }
  }

  handle(listener, event) {
    listener(event);
  }

  addEventListener(type, listener) {
    if (!Object.prototype.hasOwnProperty.call(this._events, type)) {
      this._events[type] = [];
    }
    if (this._events[type].indexOf(listener) < 0) {
      this._events[type].push(listener);
    }
  }

  removeEventListener(type, listener) {
    if (Object.prototype.hasOwnProperty.call(this._events, type)) {
      const listeners = this._events[type];
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
      if (listeners.length === 0) {
        delete this._events[type];
      }
    }
  }
}

// Options resolver class
class OptionsResolver {
  constructor(strict = true) {
    this.strict = strict;
    this.defaults = new Map();
    this.validators = new Map();
    this.types = new Map();
    this.optional = new Set();
    this.required = new Set();
  }

  allowExtra() {
    this.strict = false;
    return this;
  }

  setDefaults(defaults) {
    Object.entries(defaults).forEach(([key, value]) => {
      this.defaults.set(key, value);
    });
    return this;
  }

  setValidators(validators) {
    Object.entries(validators).forEach(([key, validator]) => {
      this.validators.set(key, validator);
    });
    return this;
  }

  setTypes(types) {
    Object.entries(types).forEach(([key, type]) => {
      this.types.set(key, type);
    });
    return this;
  }

  setOptional(keys) {
    keys.forEach((key) => this.optional.add(key));
    return this;
  }

  setRequired(keys) {
    keys.forEach((key) => this.required.add(key));
    return this;
  }

  resolve(options) {
    return this.validate(Object.assign(this.getDefaults(), options));
  }

  getDefaults() {
    const defaults = {};
    for (const [key, value] of this.defaults) {
      defaults[key] = value;
    }
    return defaults;
  }

  validate(options) {
    // Apply validators
    for (const key in options) {
      if (this.validators.has(key)) {
        options[key] = this.validators.get(key)(options[key]);
      }
    }

    // Check if options exist
    for (const key in options) {
      if (!this.optionExists(key)) {
        throw new Error(`Unknown option "${key}".`);
      }
      this.checkType(key, options[key]);
    }

    // Check required options
    for (const key of this.required.values()) {
      if (options[key] === undefined) {
        throw new Error(`Option "${key}" is required.`);
      }
    }

    return options;
  }

  checkType(key, value) {
    if (this.types.has(key)) {
      const expectedType = this.types.get(key);
      const actualType = typeof value;
      if (actualType !== expectedType) {
        throw new Error(
          `Wrong value for option "${key}": expected type "${expectedType}", got "${actualType}".`
        );
      }
    }
  }

  optionExists(key) {
    return (
      !this.strict ||
      this.defaults.has(key) ||
      this.validators.has(key) ||
      this.optional.has(key) ||
      this.required.has(key) ||
      this.types.has(key)
    );
  }
}

// GamepadHandler class
export class GamepadHandler extends EventEmitter {
  static optionResolver = new OptionsResolver()
    .setDefaults({ analog: true, deadZone: 0, precision: 0 })
    .setTypes({ analog: "boolean", deadZone: "number", precision: "number" })
    .setValidators({
      deadZone: (value) => Math.max(Math.min(value, 1), 0),
      precision: (value) => (value > 0 ? Math.pow(10, value) : 0),
    });

  constructor(index, gamepad, options = {}) {
    super();
    this.index = index;
    this.gamepad = gamepad;
    this.options = this.constructor.resolveOptions(options);
    this.axes = new Array(gamepad.axes.length).fill(null);
    this.buttons = new Array(gamepad.buttons.length).fill(null);
    this.initAxes();
    this.initButtons();
  }

  static resolveOptions(options) {
    const { axis, button } = options;
    return {
      axis: this.optionResolver.resolve(axis ?? button ?? options ?? {}),
      button: this.optionResolver.resolve(button ?? axis ?? options ?? {}),
    };
  }

  initAxes() {
    for (let i = 0; i < this.axes.length; i++) {
      this.axes[i] = this.resolveAxisValue(i);
    }
  }

  initButtons() {
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i] = this.resolveButtonValue(i);
    }
  }

  update(gamepad) {
    this.gamepad = gamepad;
    this.updateAxis();
    this.updateButtons();
  }

  updateAxis() {
    for (let i = 0; i < this.axes.length; i++) {
      this.setAxisValue(i, this.resolveAxisValue(i));
    }
  }

  updateButtons() {
    for (let i = 0; i < this.buttons.length; i++) {
      this.setButtonValue(i, this.resolveButtonValue(i));
    }
  }

  setAxisValue(index, value) {
    if (this.axes[index] !== value) {
      this.axes[index] = value;
      this.emit("axis", {
        gamepad: this.gamepad,
        index: this.index,
        axis: index,
        value: value,
      });
    }
  }

  setButtonValue(index, value) {
    if (this.buttons[index] !== value) {
      this.buttons[index] = value;
      this.emit("button", {
        gamepad: this.gamepad,
        index: this.index,
        button: index,
        pressed: this.gamepad.buttons[index].pressed,
        value: value,
      });
    }
  }

  resolveAxisValue(index) {
    const { deadZone, analog, precision } = this.options.axis;
    const value = this.gamepad.axes[index];

    if (deadZone && value < deadZone && value > -deadZone) {
      return 0;
    }

    if (analog) {
      return precision ? Math.round(value * precision) / precision : value;
    }

    return value > 0 ? 1 : value < 0 ? -1 : 0;
  }

  resolveButtonValue(index) {
    const { deadZone, analog, precision } = this.options.button;
    const value = this.gamepad.buttons[index].value;

    if (deadZone > 0 && value < deadZone && value > -deadZone) {
      return 0;
    }

    if (analog) {
      return precision ? Math.round(value * precision) / precision : value;
    }

    return value === 0 ? 0 : 1;
  }
}

// AnimationLoop class
class AnimationLoop {
  constructor(callback) {
    this.callback = callback;
    this.frame = null;
    this.update = this.update.bind(this);
  }

  setCallback(callback) {
    this.callback = callback;
  }

  start() {
    if (!this.frame) {
      this.frame = window.requestAnimationFrame(this.update);
    }
  }

  stop() {
    if (this.frame) {
      window.cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }

  update() {
    this.frame = window.requestAnimationFrame(this.update);
    this.callback();
  }
}

// GamepadListener class
export class GamepadListener extends EventEmitter {
  constructor(options = {}) {
    super();

    if (typeof navigator.getGamepads !== "function") {
      throw new Error("This browser does not support gamepad API.");
    }

    this.options = options;
    this.onAxis = this.onAxis.bind(this);
    this.update = this.update.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.discover = this.discover.bind(this);
    this.onButton = this.onButton.bind(this);
    this.handlers = new Array(4).fill(null);
    this.loop = new AnimationLoop(this.update);

    window.addEventListener("error", this.stop);
  }

  start() {
    this.loop.start();
  }

  stop() {
    this.loop.stop();
  }

  update() {
    const gamepads = navigator.getGamepads();
    this.discover(gamepads[0], 0);
    this.discover(gamepads[1], 1);
    this.discover(gamepads[2], 2);
    this.discover(gamepads[3], 3);
  }

  discover(gamepad, index) {
    if (gamepad) {
      if (this.handlers[index] === null) {
        this.registerHandler(index, gamepad);
      }
      this.handlers[index].update(gamepad);
    } else if (this.handlers[index]) {
      this.removeGamepad(index);
    }
  }

  registerHandler(index, gamepad) {
    const handler = new GamepadHandler(index, gamepad, this.options);
    this.handlers[index] = handler;
    handler.addEventListener("axis", this.onAxis);
    handler.addEventListener("button", this.onButton);
    this.emit("gamepad:connected", { index, gamepad });
    this.emit(`gamepad:${index}:connected`, { index, gamepad });
  }

  removeGamepad(index) {
    const handler = this.handlers[index];
    handler.removeEventListener("axis", this.onAxis);
    handler.removeEventListener("button", this.onButton);
    this.handlers[index] = null;
    this.emit("gamepad:disconnected", { index });
    this.emit(`gamepad:${index}:disconnected`, { index });
  }

  onAxis(event) {
    const { index } = event.detail;
    this.emit("gamepad:axis", event.detail);
    this.emit(`gamepad:${index}:axis`, event.detail);
    this.emit(`gamepad:${index}:axis:${event.detail.axis}`, event.detail);
  }

  onButton(event) {
    const { index } = event.detail;
    this.emit("gamepad:button", event.detail);
    this.emit(`gamepad:${index}:button`, event.detail);
    this.emit(`gamepad:${index}:button:${event.detail.button}`, event.detail);
  }
}

// Default export for backwards compatibility
export default { GamepadHandler, GamepadListener };
