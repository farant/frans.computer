/*
    Example:

    <entity-data>
        <title>Harry Potter and the Philosopher's Stone</title>
        <author>J. K. Rowling</author>
        <year-published>1997</year-published>
        <publisher>Bloomsbury</publisher>
    </entity-data>

*/

const entity_data_css = new CSSStyleSheet();
entity_data_css.replaceSync(`
`);

const entity_data_html = document.createElement("template");
entity_data_html.innerHTML = `
<div style="display: none;">
    <slot></slot>
</div>
`;

class EntityData extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [entity_data_css];
    this.shadowRoot.appendChild(entity_data_html.content.cloneNode(true));
  }

  get_data() {
    let data = {};

    let slot = this.shadowRoot.querySelector("slot");
    slot.assignedElements().forEach((element) => {
      let name = element.tagName;
      if (element.hasAttribute("is")) name = element.getAttribute("is");

      name = name.toLowerCase();

      data[name] = element.textContent;
    });

    return data;
  }
}

window.customElements.define("entity-data", EntityData);
