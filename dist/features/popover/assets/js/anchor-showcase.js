const config = {
  placements: [
    "top left",
    "top center",
    "top right",
    "center left",
    "center",
    "center right",
    "bottom left",
    "bottom center",
    "bottom right",
    "top",
    "bottom",
    "left",
    "right",
  ],
  offsets: ["xs", "sm", "md", "lg", "xl", "0"],
  initial_placement: "bottom right",
  initial_offsetBlock: "0",
  initial_offsetInline: "0",
};

const transforms = {
  "top left": "bottom right",
  "top center": "bottom center",
  "top right": "bottom left",
  "center left": "right center",
  center: "center",
  "center right": "left center",
  "bottom left": "top right",
  "bottom center": "top center",
  "bottom right": "top left",
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

function getSpacingVariable(size) {
  if (size.startsWith("-")) {
    return `calc(-1 * var(--spacer-${size.slice(1)}))`;
  }
  return `var(--spacer-${size})`;
}

function getTransformOrigin(placement) {
  return transforms[placement] ?? "center";
}

function generatePopoverStyles({ placement, offset }) {
  const styles = {
    "--variant-pos-area": placement,
    "--variant-trans-origin": getTransformOrigin(placement),
  };

  if (offset?.block) {
    styles["--variant__offset-block"] = getSpacingVariable(offset.block);
  }

  if (offset?.inline) {
    styles["--variant__offset-inline"] = getSpacingVariable(offset.inline);
  }

  return styles;
}

function applyPopoverStyles(element, styles) {
  for (const [key, value] of Object.entries(styles)) {
    if (value !== undefined) {
      element.style.setProperty(key, value);
    }
  }
}

function createPopoverPositioner() {
  return {
    generate: generatePopoverStyles,
    apply: applyPopoverStyles,
    updatePlacement(element, placement) {
      element.style.setProperty("--variant-pos-area", placement);
      element.style.setProperty(
        "--variant-trans-origin",
        getTransformOrigin(placement)
      );
    },
    updateOffset(element, offset) {
      if (offset.block) {
        element.style.setProperty(
          "--variant__offset-block",
          getSpacingVariable(offset.block)
        );
      }
      if (offset.inline) {
        element.style.setProperty(
          "--variant__offset-inline",
          getSpacingVariable(offset.inline)
        );
      }
    },
  };
}

function createControlPanel() {
  const panel = document.createElement("div");
  panel.id = "control-panel";
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", "Popover positioning controls");

  const placementOptions = config.placements
    .map(
      (opt) =>
        `<option value="${opt}" ${
          opt === config.initial_placement ? "selected" : ""
        }>${opt}</option>`
    )
    .join("");

  const offsetOptions = config.offsets
    .map(
      (opt) =>
        `<option value="${opt}" ${
          opt === config.initial_offsetBlock ? "selected" : ""
        }>${opt}</option>`
    )
    .join("");

  const offsetInlineOptions = config.offsets
    .map(
      (opt) =>
        `<option value="${opt}" ${
          opt === config.initial_offsetInline ? "selected" : ""
        }>${opt}</option>`
    )
    .join("");

  panel.innerHTML = `
    
    
    <div style="margin-bottom: 16px;">
      <label for="placement" class="sr-only">Placement:</label>
      <select id="placement" style="width: 100%; padding: 16px; border: 1px solid #ccc; border-radius: 4px; font-size: 1.25rem;">
        ${placementOptions}
      </select>
    </div>
      `;

  // <div style="margin-bottom: 16px;>
  //   <label for="offsetBlock" style="display: block; margin-bottom: 6px; font-weight: 500;">Offset Block (Y):</label>
  //   <div style="display: flex; gap: 8px; flex-flow: column wrap;">
  //     <select id="offsetBlock" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  //       ${offsetOptions}
  //     </select>
  //     <label style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
  //       <input type="checkbox" id="negateBlock" aria-label="Negate block offset" />
  //       <span>Negative</span>
  //     </label>
  //   </div>
  // </div>

  // <div style="margin-bottom: 16px;">
  //   <label for="offsetInline" style="display: block; margin-bottom: 6px; font-weight: 500;">Offset Inline (X):</label>
  //   <div style="display: flex; gap: 8px; flex-flow: column wrap;">
  //     <select id="offsetInline" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  //       ${offsetInlineOptions}
  //     </select>
  //     <label style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
  //       <input type="checkbox" id="negateInline" aria-label="Negate inline offset" />
  //       <span>Negative</span>
  //     </label>
  //   </div>
  // </div>

  return panel;
}

const AppState = (() => {
  let state = {
    placement: config.initial_placement,
    offsetBlock: config.initial_offsetBlock,
    offsetInline: config.initial_offsetInline,
    negateBlock: false,
  };

  return {
    getState: () => ({ ...state }),
    setState: (updates) => {
      state = { ...state, ...updates };
    },
    reset: () => {
      state = {
        placement: config.initial_placement,
        offsetBlock: config.initial_offsetBlock,
        offsetInline: config.initial_offsetInline,
        negateBlock: false,
        negateInline: false,
      };
    },
  };
})();

function updatePopover(popoverEl, positioner) {
  const currentState = AppState.getState();

  const blockOffset = currentState.negateBlock
    ? `-${currentState.offsetBlock}`
    : currentState.offsetBlock;

  const inlineOffset = currentState.negateInline
    ? `-${currentState.offsetInline}`
    : currentState.offsetInline;

  const styles = positioner.generate({
    placement: currentState.placement,
    offset: {
      block: blockOffset,
      inline: inlineOffset,
    },
  });

  positioner.apply(popoverEl, styles);
}

function attachEventListeners(popoverEl, positioner) {
  const placementSelect = document.getElementById("placement");
  const offsetBlockSelect = document.getElementById("offsetBlock");
  const offsetInlineSelect = document.getElementById("offsetInline");
  const negateBlockCheckbox = document.getElementById("negateBlock");
  const negateInlineCheckbox = document.getElementById("negateInline");

  if (placementSelect) {
    placementSelect.addEventListener("change", (e) => {
      AppState.setState({ placement: e.target.value });
      updatePopover(popoverEl, positioner);
    });
  }

  if (offsetBlockSelect) {
    offsetBlockSelect.addEventListener("change", (e) => {
      AppState.setState({ offsetBlock: e.target.value });
      updatePopover(popoverEl, positioner);
    });
  }

  if (offsetInlineSelect) {
    offsetInlineSelect.addEventListener("change", (e) => {
      AppState.setState({ offsetInline: e.target.value });
      updatePopover(popoverEl, positioner);
    });
  }

  if (negateBlockCheckbox) {
    negateBlockCheckbox.addEventListener("change", (e) => {
      AppState.setState({ negateBlock: e.target.checked });
      updatePopover(popoverEl, positioner);
    });
  }

  if (negateInlineCheckbox) {
    negateInlineCheckbox.addEventListener("change", (e) => {
      AppState.setState({ negateInline: e.target.checked });
      updatePopover(popoverEl, positioner);
    });
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const popoverEl = document.getElementById("popover");

    const positioner = createPopoverPositioner();

    const controlPanel = createControlPanel();
    document.querySelector("#controlPanel").appendChild(controlPanel);

    attachEventListeners(popoverEl, positioner);

    updatePopover(popoverEl, positioner);
  },
  { once: true }
);
