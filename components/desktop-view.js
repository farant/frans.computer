
const desktop_view_css = new CSSStyleSheet();
desktop_view_css.replaceSync(`
.desktop-view {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	box-sizing: border-box;
	border: 5px solid black;
}
`)

const desktop_view_html = document.createElement("template")
desktop_view_html.innerHTML = `
<div class="desktop-view">
	<slot></slot>
</div>
`

class DesktopView extends HTMLElement {
	connectedCallback() {
		this.attachShadow({ mode: "open" })
		this.shadowRoot.appendChild(
			desktop_view_html.content.cloneNode(true)
		)
		this.shadowRoot.adoptedStyleSheets([desktop_view_css])
	}
}

window.customElements.define('desktop-view', DesktopView)
