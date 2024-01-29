/*
  Example:

<entity-collection id="favorite-books" type="book">
    <entity-link src="/church-father-books.html"></entity-link>
    <entity-link src="/novels.html"></entity-link>

*/
const entity_link_css = new CSSStyleSheet();
entity_link_css.replaceSync(`
`);

const entity_link_html = document.createElement("template");
entity_link_html.innerHTML = `
<div style="display: none;"></div>
`;

class EntityLink extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [entity_link_css];
    this.shadowRoot.appendChild(entity_link_html.content.cloneNode(true));
  }

  async get_entities(entity_type) {
    let remote_src = this.getAttribute("src");

    try {
      let response = await fetch(remote_src);
      let text = await response.text();

      console.log("text", text);

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      let result = [];

      let collections = doc.querySelectorAll(
        `entity-collection[type="${entity_type}"]`
      );

      console.log("collections", collections);

      await customElements.whenDefined("entity-collection");

      for (let collection of collections) {
        let entities = collection.outerHTML;
        let hidden_container = document.createElement("div");
        hidden_container.style.display = "none";
        document.body.appendChild(hidden_container);

        let template = document.createElement("template");
        template.innerHTML = entities.trim();
        hidden_container.appendChild(template.content.cloneNode(true));

        let collection_component =
          hidden_container.querySelector("entity-collection");

        result = result.concat(await collection_component.get_data());

        document.body.removeChild(hidden_container);
      }
      console.log("result", result);

      return result;
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}

window.customElements.define("entity-link", EntityLink);
