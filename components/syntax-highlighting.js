import { codeToHtml } from "https://esm.sh/shiki@0.8.0";

class SyntaxHighlighting extends HTMLElement {
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
