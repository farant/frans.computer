import HtmlToPug from "../vendor/html-to-pug.js";

class PugEditor extends HTMLElement {
  constructor() {
    super();

    if (this.getAttribute("target")) {
      this._initial_inner_html = document.querySelector(
        this.getAttribute("target")
      ).innerHTML;
    } else if (this.innerHTML && this.getAttribute("target-href")) {
      this._initial_inner_html = this.innerHTML;
    }
  }

  async connectedCallback() {
    if (this.getAttribute("target-href")) {
      this._initial_inner_html = await fetch(
        this.getAttribute("target-href")
      ).then((response) => response.text());
    }

    let pug = await HtmlToPug(this._initial_inner_html);

    this.innerHTML = `<monaco-editor language="pug">${pug}</monaco-editor>`;
  }
}

window.customElements.define("pug-editor", PugEditor);
