const entity_field_css = new CSSStyleSheet();
entity_field_css.replaceSync(`
`);

const entity_field_html = document.createElement("template");
entity_field_html.innerHTML = `
<div style="display: none;">
    <slot></slot>
</div>`;

class EntityField extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [entity_field_css];
    this.shadowRoot.appendChild(entity_field_html.content.cloneNode(true));
  }

  get_text() {
    return this.shadowRoot.querySelector("slot").assignedNodes()[0].textContent;
  }
}

window.customElements.define("entity-field", EntityField);
