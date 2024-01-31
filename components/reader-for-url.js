import { nanoid } from "/vendor/nanoid.js";

const reader_for_url_css = new CSSStyleSheet();
reader_for_url_css.replace(`
#reader-for-url {
    font-size: 1.4em;
    margin-bottom: 1em;
    font-weight: bold;
    font-family: monospace;
}

#highlights-view {
    position: fixed;
    right: 0;
    top: 0;
    max-width: 60ch;
}

.saved-highlight {
    margin-bottom: 1em;
    padding: 1em;
    border: 1px solid #ccc;
    border-radius: 0.5em;
}

.saved-highlights {
    margin-bottom: 1em;
}
`);

const reader_for_url_html = document.createElement("template");
reader_for_url_html.innerHTML = `
<div>
    <div id="reader-for-url">
    </div>
    <div id="url-content">
    </div>
    <div id="highlights-view">
    </div>
</div>
`;

class ReaderForUrl extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [reader_for_url_css];
    this.shadowRoot.appendChild(reader_for_url_html.content.cloneNode(true));
    this.id = nanoid();
  }

  load_saved_highlights(url) {
    let highlights = [];
    try {
      let saved = JSON.parse(localStorage.getItem(`highlights:${url}`));
      if (saved) {
        highlights = saved;
      }
    } catch (e) {
      console.error(e);
    }

    this.highlights = highlights;

    return highlights;
  }

  save_highlight(url, text) {
    let highlights = this.load_saved_highlights(url);
    highlights.push(text);
    localStorage.setItem(`highlights:${url}`, JSON.stringify(highlights));
    this.load_saved_highlights(url);
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

    let existing_element = document.getElementById(this.id);
    if (existing_element) {
      existing_element.remove();
    }
    let new_element = document.createElement("div");
    new_element.id = this.id;
    new_element.innerHTML = markup;
    this.after(new_element);
    markup = new_element.outerHTML;

    window.getElementById(this.id).addEventListener("mouseup", () => {
      let selection = window.getSelection();

      this.pending_highlight = selection.toString();
      this.render_highlights();
    });

    this.render_highlights();
  }

  render_highlights() {
    let highlights = this.load_saved_highlights(this.getAttribute("url"));

    let markup = `<div class="saved-highlights">`;
    for (let highlight of highlights) {
      markup += `<div class="saved-highlight">${highlight}</div>`;
    }
    markup += `</div>`;

    if (this.pending_highlight) {
      markup += `<div class="pending-highlight">
        ${this.pending_highlight}
        <div><button>Save</button></div>
      </div>`;
    }

    this.shadowRoot.querySelector("#highlights-view").innerHTML = markup;

    if (this.pending_highlight) {
      let highlight_to_save = this.pending_highlight;
      this.shadowRoot
        .querySelector(".pending-highlight button")
        .addEventListener("click", () => {
          this.save_highlight(this.getAttribute("url"), highlight_to_save);
          this.pending_highlight = null;
          this.render_highlights();
        });
    }
  }
}

window.customElements.define("reader-for-url", ReaderForUrl);
