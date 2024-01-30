import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { dedent } from "/vendor/dedent.js";

marked.use({
  renderer: {
    code(code, language) {
      return `<pre is="syntax-highlighting" lang="${language}">${code}</pre>`;
    },
    codespan(text) {
      // Escape <, >, &, " and '
      const escapedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      return `<code>${escapedText}</code>`;
    },
  },
});

function html_decode(input) {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

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
    this.render();
  }

  render() {
    if (
      this.children.length === 1 &&
      this.children[0].tagName.toLowerCase() === "p"
    ) {
      this.innerHTML = this.children[0].innerHTML;
    }

    this.innerHTML = marked(dedent(this.innerHTML.trim()));
    this.style.display = "block";
  }
}

window.customElements.define("markdown-view", MarkdownView, {
  extends: "pre",
});
