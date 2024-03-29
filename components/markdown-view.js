import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { dedent } from "/vendor/dedent.js";

const markdown_view_css = new CSSStyleSheet();
markdown_view_css.replaceSync(`
  pre[is="markdown-view"] {
    white-space: pre-line;
  }
`);
document.adoptedStyleSheets = [
  ...document.adoptedStyleSheets,
  markdown_view_css,
];

marked.use({
  renderer: {
    code(code, language) {
      return `<pre is="syntax-highlighting" lang="${language}">${code}</pre>`;
    },
  },
});

marked.use({
  hooks: {
    postprocess(html) {
      html = html
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&");

      return html;
    },
    preprocess(html) {
      console.log("pre html", html);
      return html;
    },
  },
});

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

    let input = dedent(this.innerHTML.trim());
    console.log("input", input);
    console.log("decoded", input);

    let text = marked(input);

    console.log("text", text);
    /*
    console.log("input", input);
    console.log("decoded", html_decode(input));
    */

    this.innerHTML = text;
    this.style.display = "block";
  }
}

window.customElements.define("markdown-view", MarkdownView, {
  extends: "pre",
});
