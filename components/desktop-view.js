
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

let desktop_dragging_style = document.createElement("style")
desktop_dragging_style.innerHTML = `
	.desktop-dragging {
		opacity: 0;
	}
`

document.body.appendChild(desktop_dragging_style)

console.log(desktop_dragging_style)


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

		const desktop_view = this.shadowRoot.querySelector('.desktop-view')
		desktop_view.addEventListener('dragover', (event) => {
			// Prevent default to allow drop
			event.preventDefault();
		});

		desktop_view.addEventListener('drop', (event) => {
			let item = this.dragging_item
			if (!item) return

			event.preventDefault();

			let mouse_offset_x = 0
			let mouse_offset_y = 0
			if (processed_nodes[item].mouse_offset_x) {
				mouse_offset_x = processed_nodes[item].mouse_offset_x
			}
			if (processed_nodes[item].mouse_offset_y) {
				mouse_offset_y = processed_nodes[item].mouse_offset_y
			}

			item.style.left = (event.clientX - mouse_offset_x) + "px"
			item.style.top = (event.clientY - mouse_offset_y) + "px"

			this.dragging_item = null
		})

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
				processed_nodes[item] = {}

				item.style.position = "absolute"
				item.setAttribute("draggable", "true")
				this.initialize_position(item)

				item.addEventListener("dragstart", (event) => {
					// x and y position of target
					const target = item
					const rect = target.getBoundingClientRect()
					const target_x = rect.x
					const target_y = rect.y
					const mouse_x = event.clientX
					const mouse_y = event.clientY

					processed_nodes[item].mouse_offset_x = mouse_x - target_x
					processed_nodes[item].mouse_offset_y = mouse_y - target_y

					this.dragging_item = item;

					item.classList.add("desktop-dragging")
				})

				item.addEventListener("dragend", (event) => {
					item.classList.remove("desktop-dragging")
				})
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
