const rotate_jitter_css = new CSSStyleSheet();
rotate_jitter_css.replaceSync(`
`);

const rotate_jitter_html = document.createElement("template");
rotate_jitter_html.innerHTML = `
<div class="container">
    <slot></slot>
</div>`;

class RotateJitter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [rotate_jitter_css];
    this.shadowRoot.appendChild(rotate_jitter_html.content.cloneNode(true));

    this.range = +this.getAttribute("range").replace(/[a-z]+/g, "");
    this.rotate = Math.random() * (this.range * 2) - this.range;
  }

  connectedCallback() {
    this.shadowRoot.querySelector(
      "container"
    ).style.transform = `rotate(${this.rotate}deg)`;
  }
}

window.customElements.define("rotate-jitter", RotateJitter);
