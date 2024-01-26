
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

	increment = 20
	last_x = 0
	last_y = 0

	connectedCallback() {
		this.attachShadow({ mode: "open" })
		this.shadowRoot.appendChild(
			desktop_view_html.content.cloneNode(true)
		)
		this.shadowRoot.adoptedStyleSheets = [desktop_view_css]

		const processed_nodes = {}

		const main_slot = this.shadowRoot.querySelector("slot")
		main_slot.addEventListener("slotchange", () => {
			let items = main_slot.assignedNodes()
			for (let item of items) {
				if (processed_nodes[item]) {
					console.log("skipping item", item)
					continue
				}

				if (item.nodeType === Node.TEXT_NODE) {
					// TODO: Wrap it in a div?
					continue
				} else if (item.nodeType !== Node.ELEMENT_NODE) {
					console.log("Unknown node type: '" + item.nodeType + "'")
					continue
				}

				console.log("processing item", item)
				processed_nodes[item] = true

				item.style.position = "absolute"
				item.setAttribute("draggable", "true")
				this.initialize_position(item)
			}
		})
	}

	initialize_position(item) {
		this.last_x += this.increment
		this.last_y += this.increment

		item.style.left = this.last_x + "px"
		item.style.top = this.last_y + "px"
	}

}

window.customElements.define('desktop-view', DesktopView)
