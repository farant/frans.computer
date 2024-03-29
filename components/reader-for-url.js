import { nanoid } from "../vendor/nanoid.js";

const reader_for_url_css = new CSSStyleSheet();
reader_for_url_css.replace(`
#reader-for-url {
    font-size: 1.4em;
    margin-bottom: 1em;
    font-weight: bold;
    font-family: monospace;
}

#highlights-view {
    position: fixed;
    right: 0;
    top: 0;
    max-width: 60ch;
    overflow-y: scroll;
    bottom: 0;
    padding-top: 100px;
    padding-bottom: 300px;
    box-sizing: border-box;
    padding-right: 2em;
}

#highlights-view::-webkit-scrollbar {
    width: 0;
}

#highlights-view {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

.saved-highlight {
    margin-bottom: 1em;
    padding: 1em;
    border: 1px solid #ccc;
    border-radius: 0.5em;
    white-space: pre-line;
    line-height: 128%;
}

.saved-highlight span {
    background-color: #ffdf5e7a;
}

.pending-highlight-text {
    white-space: pre-line;
}

.saved-highlights {
    margin-bottom: 1em;
}

.pending-highlight {
    margin-bottom: 1em;
}
`);

const reader_for_url_html = document.createElement("template");
reader_for_url_html.innerHTML = `
<div>
    <div id="reader-for-url">
    </div>
    <div id="url-content">
    </div>
    <div id="highlights-view">
    </div>
</div>
`;

class ReaderForUrl extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [reader_for_url_css];
		this.shadowRoot.appendChild(
			reader_for_url_html.content.cloneNode(true)
		);
		this.unique_id = nanoid();
		this.show_highlights = this.getAttribute("hide-highlights") !== "true";

		console.log({ id: this.unique_id });
	}

	load_saved_highlights(url) {
		if (!this.show_highlights) return;
		let highlights = [];
		try {
			let saved = JSON.parse(localStorage.getItem(`highlights:${url}`));
			if (saved) {
				highlights = saved;
			}
		} catch (e) {
			console.error(e);
		}

		this.highlights = highlights;

		return highlights;
	}

	save_highlight(url, text) {
		let highlights = this.load_saved_highlights(url);
		highlights.push(text);
		localStorage.setItem(`highlights:${url}`, JSON.stringify(highlights));
		this.load_saved_highlights(url);
	}

	async connectedCallback() {
		let url = this.getAttribute("url");
		let api_url = this.getAttribute("api-url");

		this.shadowRoot.querySelector(
			"#reader-for-url"
		).innerHTML = `Reader for ${url}`;

		if (!api_url || !url) {
			return console.error("Missing required attributes", {
				api_url,
				url,
			});
		}
		let uri_encoded = encodeURIComponent(url);

		let markup = await (
			await fetch(`${api_url}?url=${uri_encoded}`)
		).text();

		let existing_element = document.getElementById(this.unique_id);
		if (existing_element) {
			existing_element.remove();
		}
		let new_element = document.createElement("div");
		new_element.id = this.unique_id;
		new_element.innerHTML = markup;
		this.after(new_element);

		console.log(new_element);

		if (!this.show_highlights) return;

		document
			.getElementById(this.unique_id)
			.addEventListener("mouseup", () => {
				let selection = window.getSelection();

				this.pending_highlight = selection.toString();
				this.render_highlights();
			});

		this.render_highlights();
	}

	escape_html(unsafe) {
		return unsafe
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	render_highlights() {
		let highlights = this.load_saved_highlights(this.getAttribute("url"));
		highlights = highlights.reverse();

		let markup = "";

		if (this.pending_highlight) {
			markup += `<div class="pending-highlight">
        <div class="pending-highlight-text">${this.escape_html(
			this.pending_highlight
		)}</div>
        <div><button>Save</button></div>
      </div>`;
		}

		markup += `<div class="saved-highlights">`;
		for (let highlight of highlights) {
			markup += `<div class="saved-highlight"><span>${this.escape_html(
				highlight
			)}</span></div>`;
		}
		markup += `</div>`;

		this.shadowRoot.querySelector("#highlights-view").innerHTML = markup;

		if (this.pending_highlight) {
			let highlight_to_save = this.pending_highlight;
			this.shadowRoot
				.querySelector(".pending-highlight button")
				.addEventListener("click", () => {
					this.save_highlight(
						this.getAttribute("url"),
						highlight_to_save
					);
					this.pending_highlight = null;
					this.render_highlights();
				});
		}
	}
}

window.customElements.define("reader-for-url", ReaderForUrl);
