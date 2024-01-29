import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { dedent } from "/vendor/dedent.js";

marked.use({
  renderer: {
    code(code, language) {
      return `<pre is="syntax-highlighting" lang="${language}">${code}</pre>`;
    },
  },
});

class MarkdownView extends HTMLPreElement {
  constructor() {
    super();
    this.style.display = "none";
    // Reset the CSS of pre to be that of a normal div
    this.style.whiteSpace = "normal";
    this.style.margin = "0";
    this.style.padding = "0";
    this.style.border = "none";
    this.style.backgroundColor = "transparent";
    this.style.font = "inherit";
  }

  async connectedCallback() {
    console.log("innerText", this.innerText);
    console.log("innerHTML", this.innerHTML);
    this.render();
  }

  render() {
    this.innerHTML = marked(dedent(this.innerHTML.trim()));
    this.style.display = "block";
  }
}

window.customElements.define("markdown-view", MarkdownView, {
  extends: "pre",
});
