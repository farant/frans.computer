import { codeToHtml } from "https://esm.run/shiki";

class SyntaxHighlighting extends HTMLPreElement {
  constructor() {
    super();
    this.style.display = "none";
  }

  async connectedCallback() {
    this.innerHTML = await codeToHtml(this.innerHTML.trim(), {
      lang: this.getAttribute("lang") || "js",
      theme: "rose-pine",
    });

    this.style.display = "block";
  }
}

window.customElements.define("syntax-highlighting", SyntaxHighlighting, {
  extends: "pre",
});
