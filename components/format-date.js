const format_date_css = new CSSStyleSheet();
format_date_css.replaceSync(`
`);

const format_date_html = document.createElement("template");
format_date_html.innerHTML = `
<div style="display:none;">
<slot></slot>
</div>
<div class="format-date"></div>
`;

class FormatDate extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [format_date_css];
    this.shadowRoot.appendChild(format_date_html.content.cloneNode(true));
  }

  connectedCallback() {
    let slot = this.shadowRoot.querySelector("slot");

    slot.addEventListener("slotchange", () => {
      let date = new Date(slot.assignedNodes()[0].textContent);
      console.log("date", date);

      let locale_date = this.shadowRoot.querySelector(".format-date");

      let options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };
      locale_date.textContent = date.toLocaleDateString(undefined, options);
    });
  }
}

window.customElements.define("format-date", FormatDate);
