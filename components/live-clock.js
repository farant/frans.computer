const live_clock_css = new CSSStyleSheet();
live_clock_css.replaceSync(`
`);

const live_clock_html = document.createElement("template");
live_clock_html.innerHTML = `
<span class="clock-output">
</span>
`;

class LiveClock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [live_clock_css];
    this.shadowRoot.appendChild(live_clock_html.content.cloneNode(true));
  }

  connectedCallback() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.update_clock();
    this.interval = setInterval(() => {
      this.update_clock();
    }, 1000);
  }

  update_clock() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    this.shadowRoot.querySelector(
      ".clock-output"
    ).textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
  }
}

window.customElements.define("live-clock", LiveClock);
