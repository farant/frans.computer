const locale_date_css = new CSSStyleSheet();
locale_date_css.replaceSync(`
`);

const locale_date_html = document.createElement("template");
locale_date_html.innerHTML = `
<div style="display:none;">
<slot></slot>
</div>
<div class="locale-date"></div>
`;

class LocaleDate extends HTMLElement {
  constructor() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [locale_date_css];
    this.shadowRoot.appendChild(locale_date_html.content.cloneNode(true));
    super();
  }

  connectedCallback() {
    let slot = this.shadowRoot.querySelector("slot");

    slot.addEventListener("slotchange", () => {
      let date = new Date(slot.assignedNodes()[0].textContent);
      console.log("date", date);

      let locale_date = this.shadowRoot.querySelector(".locale-date");
      locale_date.textContent = date.toLocaleDateString();
    });
  }
}

window.customElements.define("locale-date", LocaleDate);
