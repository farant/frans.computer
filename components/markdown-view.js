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
  }

  async connectedCallback() {
    this.innerHTML = marked(dedent(this.innerHTML.trim()));

    this.style.display = "block";
  }
}

window.customElements.define("markdown-view", MarkdownView, {
  extends: "pre",
});
