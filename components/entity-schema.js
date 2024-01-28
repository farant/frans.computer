const entity_schema_css = new CSSStyleSheet();
entity_schema_css.replaceSync(`
`);

const entity_schema_html = document.createElement("template");
entity_schema_html.innerHTML = `
<div style="display: none;">
    <slot></slot>
</div>
`;

class EntitySchema extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [entity_schema_css];
    this.shadowRoot.appendChild(entity_schema_html.content.cloneNode(true));
  }
}

window.customElements.define("entity-schema", EntitySchema);
