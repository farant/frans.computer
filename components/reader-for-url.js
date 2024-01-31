const reader_for_url_css = new CSSStyleSheet();
reader_for_url_css.replace(`
`);

const reader_for_url_html = document.createElement("template");
reader_for_url_html.innerHTML = `
<div id="url-content">
</div>
`;

class ReaderForUrl extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [reader_for_url_css];
    this.shadowRoot.appendChild(reader_for_url_html.content.cloneNode(true));
  }

  async connectedCallback() {
    let url = this.getAttribute("url");
    let api_url = this.getAttribute("api-url");

    if (!api_url || !url) {
      return console.error("Missing required attributes", { api_url, url });
    }
    let uri_encoded = encodeURIComponent(url);

    let markup = await (await fetch(`${api_url}?url=${uri_encoded}`)).text();

    this.shadowRoot.querySelector("#url-content").innerHTML = markup;
  }
}

window.customElements.define("reader-for-url", ReaderForUrl);
