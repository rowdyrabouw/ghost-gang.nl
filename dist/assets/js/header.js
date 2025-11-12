import { headerData } from "./data/header.js";

export class Header extends HTMLElement {
  constructor() {
    super();
    this.data = headerData;
  }

  static get observedAttributes() {
    return ["feature", "page"];
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
    // feature data
    const feature = this.getAttribute("feature");
    const featureData = this.data && this.data.features[feature];

    // navigation data
    const page = this.getAttribute("page");
    const navigationData = this.data.navigation;
    const currentIndex = navigationData.findIndex(
      (item) => item.name === feature
    );
    const prevItem = navigationData[currentIndex - 1];
    const nextItem = navigationData[currentIndex + 1];
    const totalPages = navigationData[currentIndex].pages;

    window.document.title = featureData.title;

    let previousLink;
    if (page === "1" && prevItem) {
      previousLink = `<a href="/features/${prevItem.name}/index1.html" id="previous"><img src="/assets/img/blinky-left.svg" alt="Previous" width="44px"/></a>`;
    } else if (page > 1) {
      previousLink = `<a href="/features/${feature}/index${
        parseInt(page, 10) - 1
      }.html" id="previous"><img src="/assets/img/pacman-left.svg" alt="Previous" width="44px"/></a>`;
    } else {
      previousLink = `<img src="/assets/img/ghost.svg" alt="" width="44px"/>`;
    }

    let nextLink;
    if (page < totalPages) {
      nextLink = `<a href="/features/${feature}/index${
        parseInt(page, 10) + 1
      }.html" id="next"><img src="/assets/img/pacman-right.svg" alt="Next" width="44px"/></a>`;
    } else if (page == totalPages && nextItem) {
      nextLink = `<a href="/features/${nextItem.name}/index1.html" id="next"><img src="/assets/img/blinky-right.svg" alt="Next" width="44px"/></a>`;
    } else {
      nextLink = `<img src="/assets/img/ghost.svg" alt="" width="44px"/>`;
    }

    let dots = "";
    for (let i = 1; i <= currentIndex; i++) {
      dots += "<span class='dot black'></span>";
    }
    for (let i = currentIndex + 1; i <= navigationData.length; i++) {
      dots += "<span class='dot yellow'></span>";
    }
    this.innerHTML = `<header>${previousLink}<h1>${featureData.title}</h1>${nextLink}</header><div class="dots">${dots}</div>`;
  }
}
