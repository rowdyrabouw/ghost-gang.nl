import { baselineData } from "./data/baseline.js";

export class Baseline extends HTMLElement {
  constructor() {
    super();
    this.data = baselineData;
  }

  static get observedAttributes() {
    return ["feature", "info"];
  }

  async connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "feature" && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const feature = this.getAttribute("feature");
    const featureData = this.data && this.data[feature];
    const info = this.getAttribute("info");

    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };

    const dateTimeFormat = new Intl.DateTimeFormat("en-GB", options);
    if (featureData) {
      let supportHTML = "";
      for (const browser in featureData.support) {
        const browserData = featureData.support[browser];
        supportHTML += `
<li class="feature-component ${browser} ${browserData.level}-support">
    <div><strong>${browserData.name}</strong>`;

        if (browserData.version) {
          supportHTML += `<span class="date">${
            browserData.version
          } - ${dateTimeFormat.format(new Date(browserData.date))}</span>`;
        }

        supportHTML += `</div></li>`;
      }

      const availabilityLevels = [
        { status: "widely", text: "Widely available" },
        { status: "newly", text: "Newly available" },
        { status: "limited", text: "Limited availability" },
      ];
      const availability = availabilityLevels.find(
        (level) => level.status === featureData.status
      )
        ? availabilityLevels.find(
            (level) => level.status === featureData.status
          ).text
        : "unknown";
      let extraInfo = "";
      if (info) {
        extraInfo = `<a
      href="${info}"
      target="_blank"
      class="documentation"
    >
      <img src="/assets/img/cherry.svg" alt="" />
      <span class="sr-only">Documentation (opens in new window)</span>
    </a>`;
      }
      this.innerHTML = `<footer><ul class="support"><li class="baseline ${featureData.status}">${availability}</li>${supportHTML}</ul></footer>${extraInfo}`;
    }
  }
}
