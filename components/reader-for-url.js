const reader_for_url_css = new CSSStyleSheet();
reader_for_url_css.replace(`
    font-size: 1.4em;
    margin-bottom: 1em;
    font-weight: bold;
    font-family: monospace;
`);

const reader_for_url_html = document.createElement("template");
reader_for_url_html.innerHTML = `
<div>
    <div id="reader-for-url">
    </div>
    <div id="url-content">
    </div>
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

    this.shadowRoot.querySelector(
      "#reader-for-url"
    ).innerHTML = `Reader for ${url}`;

    if (!api_url || !url) {
      return console.error("Missing required attributes", { api_url, url });
    }
    let uri_encoded = encodeURIComponent(url);

    let markup = await (await fetch(`${api_url}?url=${uri_encoded}`)).text();

    this.shadowRoot.querySelector("#url-content").innerHTML = markup;
  }
}

window.customElements.define("reader-for-url", ReaderForUrl);
