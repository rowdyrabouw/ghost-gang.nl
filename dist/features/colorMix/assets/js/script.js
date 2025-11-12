const color1Input = document.getElementById("color1");
const color1Ghost = document.getElementById("color1-ghost");
const color2Input = document.getElementById("color2");
const color2Pacman = document.getElementById("color2-pacman");
const ghost = document.querySelector("#color-ghost");
const mixSlider = document.getElementById("mix-slider");
const sliderValue = document.getElementById("sliderValue");
const mixedColor = document.getElementById("mixedColor");
const colorCode = document.getElementById("colorCode");
const colorspaceSelect = document.getElementById("colorspace");

function updateMix() {
  const color1 = color1Input.value;
  const color2 = color2Input.value;
  const percentage = mixSlider.value;
  const colorspace = colorspaceSelect.value;

  //update ghost color1
  color1Ghost.style.color = color1;
  // update ghost color 2
  color2Pacman.style.color = color2;

  // Update slider value display
  sliderValue.textContent = `${percentage}%`;

  // Create the color-mix CSS
  const mixedColorValue = `color-mix(in ${colorspace}, ${color1}, ${color2} ${percentage}%)`;

  // Apply the mixed color
  ghost.style.color = mixedColorValue;

  // Update the color code display
  colorCode.textContent = mixedColorValue;

  // Update slider track gradient
  mixSlider.style.background = `linear-gradient(to right, ${color1}, ${color2})`;
}

// Add event listeners
color1Input.addEventListener("input", updateMix);
color2Input.addEventListener("input", updateMix);
mixSlider.addEventListener("input", updateMix);
colorspaceSelect.addEventListener("change", updateMix);

// Initial update
color1Ghost.addEventListener("click", () => {
  color1Input.click();
});
color2Pacman.addEventListener("click", () => {
  color2Input.click();
});

updateMix();
