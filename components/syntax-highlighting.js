import { codeToHtml } from "https://esm.run/shiki";
import { dedent } from "/vendor/dedent.js";

let syntax_highlighting_style = document.createElement("style");
syntax_highlighting_style.innerHTML = `
pre[is=syntax-highlighting] > pre {
  padding: 10px;
}
`;
document.head.appendChild(syntax_highlighting_style);

class SyntaxHighlighting extends HTMLPreElement {
  constructor() {
    super();
    this.style.display = "none";
  }

  async connectedCallback() {
    this.innerHTML = await codeToHtml(dedent(this.innerHTML.trim()), {
      lang: this.getAttribute("lang") || "js",
      theme: "solarized-light",
    });

    this.style.display = "block";
  }
}

window.customElements.define("syntax-highlighting", SyntaxHighlighting, {
  extends: "pre",
});
