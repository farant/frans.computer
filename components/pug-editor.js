import HtmlToPug from "../vendor/html-to-pug.js";

class PugEditor extends HTMLElement {
  constructor() {
    super();

    if (this.getAttribute("target")) {
      this._initial_inner_html = document.querySelector(
        this.getAttribute("target")
      ).innerHTML;
    } else if (this.innerHTML) {
      this._initial_inner_html = this.innerHTML;
    }
  }

  async connectedCallback() {
    let pug = await HtmlToPug(this._initial_inner_html);

    this.innerHTML = `<pre>${pug}</pre>`;
  }
}

window.customElements.define("pug-editor", PugEditor);
