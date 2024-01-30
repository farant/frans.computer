const entity_collection_css = new CSSStyleSheet();
entity_collection_css.replace(`
`);

const entity_collection_html = document.createElement("template");
entity_collection_html.innerHTML = `
<div style="display: none;">
    <slot></slot>
</div>
`;

class EntityCollection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [entity_collection_css];
    this.shadowRoot.appendChild(entity_collection_html.content.cloneNode(true));
    this.style.display = "none";
  }

  async get_data() {
    let data = [];

    let entity_type = this.getAttribute("type");

    let slot = this.shadowRoot.querySelector("slot");
    for (let element of slot.assignedElements()) {
      if (element.tagName.toLowerCase() === "entity-data") {
        data.push(element.get_data());
      } else if (element.tagName.toLowerCase() === "entity-link") {
        data.push(...(await element.get_entities(entity_type)));
      }
    }

    return data;
  }
}

customElements.define("entity-collection", EntityCollection);
