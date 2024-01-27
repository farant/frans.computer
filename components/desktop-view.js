
async function sha256(message) {
	// Encode the string into bytes
	const msgBuffer = new TextEncoder().encode(message);

	// Hash the message
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

	// Convert the hash to a readable format
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return hashHex;
}

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
		transition: 0.01s;
		transform: translateX(-9999px);
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


		this.processed_nodes = {}

		const desktop_view = this.shadowRoot.querySelector('.desktop-view')
		desktop_view.addEventListener('dragover', (event) => {
			// Prevent default to allow drop
			event.preventDefault();
		});

		desktop_view.addEventListener('drop', async (event) => {
			let drag_preview_offset = 20
			let item = this.dragging_item
			let node = await this.get_processed_node(item)
			if (!item || !node) return

			event.preventDefault();

			let mouse_offset_x = 0
			let mouse_offset_y = 0
			if (node.mouse_offset_x) {
				mouse_offset_x = node.mouse_offset_x
			}
			if (node.mouse_offset_y) {
				mouse_offset_y = node.mouse_offset_y
			}

			let x = (event.clientX - mouse_offset_x)
			let y = (event.clientY - mouse_offset_y) - drag_preview_offset
			item.style.left = x + "px"
			item.style.top = y + "px"

			this.set_position(item, x, y)

			this.dragging_item = null
		})

		const main_slot = this.shadowRoot.querySelector("slot")
		main_slot.addEventListener("slotchange", async () => {
			let items = main_slot.assignedNodes()
			for (let item of items) {
				if (item.nodeType === Node.TEXT_NODE) {
					// TODO: Wrap it in a div?
					// TODO: Ignore text nodes that are all whitespace?
					continue
				} else if (item.nodeType !== Node.ELEMENT_NODE) {
					console.log("Unknown node type: '" + item.nodeType + "'")
					continue
				}

				let node = await this.get_processed_node(item)
				if (node) {
					console.log("skipping item", item)
					continue
				}

				node = await this.set_processed_node(item)

				console.log("processing item", item)
				let id = await this.get_id(item)
				item.setAttribute('id', id)
				node.id = id

				item.style.position = "absolute"
				item.setAttribute("draggable", "true")
				this.initialize_position(item)

				item.addEventListener("dragstart", async (event) => {
					// x and y position of target
					const target = item
					const rect = target.getBoundingClientRect()
					const target_x = rect.x
					const target_y = rect.y
					const mouse_x = event.clientX
					const mouse_y = event.clientY

					let node = await this.get_processed_node(item)

					node.mouse_offset_x = mouse_x - target_x
					node.mouse_offset_y = mouse_y - target_y

					this.dragging_item = item;

					item.classList.add("desktop-dragging")
				})

				item.addEventListener("dragend", (event) => {
					item.classList.remove("desktop-dragging")
				})
			}
		})
	}

	async get_id(item) {
		let id = item.getAttribute("id")
		if (!id) {
			id = await sha256(item.outerHTML)
		}

		return id
	}

	async set_processed_node(item) {
		let id = await this.get_id(item)
		this.processed_nodes[id] = {}

		return this.processed_nodes[id]
	}

	async get_processed_node(item) {
		let id = await this.get_id(item)
		return this.processed_nodes[id] || null
	}

	get_form_id() {
		let desktop = this.shadowRoot.querySelector('.desktop-view')
		let id = desktop.getAttribute("id")

		let whole_id = `desktop-view:${id}-`
			+ window.location.origin
			+ window.location.pathname

		return whole_id
	}

	set_position(item, x, y) {
		let id = item.getAttribute("id")

		console.log("setting position", `${this.get_form_id()}-${id}`, x, y)
		localStorage.setItem(
			`${this.get_form_id()}-${id}`,
			JSON.stringify({ x, y })
		)
	}

	load_position(item) {
		let id = item.getAttribute("id")

		try {
			console.log("getting position", `${this.get_form_id()}-${id}`)
			return JSON.parse(localStorage.getItem(
				`${this.get_form_id()}-${id}`
			))
		} catch {
			return null
		}
	}

	initialize_position(item) {
		let position = this.load_position(item)

		if (position) {
			item.style.left = position.x + "px"
			item.style.top = position.y + "px"
		} else {
			this.last_x += this.increment
			this.last_y += this.increment
			item.style.left = this.last_x + "px"
			item.style.top = this.last_y + "px"
		}
	}
}

window.customElements.define('desktop-view', DesktopView)
