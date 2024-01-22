import { nanoid } from '../vendor/nanoid.js'

class Random_nanoid extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
		this.shadowRoot.innerHTML = `<span>${nanoid()}</span>`
	}
}

customElements.define('random-nanoid', Random_nanoid)
