class HypermediaRepl extends HTMLElement {
	connectedCallback() {
		if (!this.id) {
			return this.print_error(
				"The repl element must have an id attribute"
			);
		}

		this.innerHTML = /*html*/ `
			                         <div class="${this.scoped_class("repl-editor")}">
			                             <div>
			                                 <textarea spellcheck="false" class="${this.scoped_class(
													"repl-input"
												)}" rows="10" cols="50"></textarea>
			                             </div>
			                             <div>
			                                 <button class="${this.scoped_class(
													"repl-save"
												)}">Save Changes</button>
			                             </div>
			                         </div>
			                         <div class="${this.scoped_class("repl-output")}">
			                         </div>
			                     `;

		this.scoped_selector("repl-save").addEventListener("click", () => {
			this.save();
		});

		this.scoped_selector("repl-input").addEventListener(
			"keydown",
			function (e) {
				// Check if the pressed key is the Tab key (keyCode 9)
				if (e.keyCode === 9) {
					e.preventDefault(); // Prevent the default tab action (focus change)

					// Get the current cursor position and selection
					let start = this.selectionStart;
					let end = this.selectionEnd;

					// Set the text value with two spaces inserted instead of a tab character
					this.value =
						this.value.substring(0, start) +
						"  " + // Inserting two spaces
						this.value.substring(end);

					// Move the cursor to after the inserted spaces
					this.selectionStart = this.selectionEnd = start + 2;
				}

				if (e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					const cursor_position = this.selectionStart;
					const lines = this.value.split("\n");
					const current_line_number =
						this.value.substr(0, cursor_position).split("\n")
							.length - 1;
					const current_line = lines[current_line_number];
					const indent = current_line.match(/^\s*/) || "";

					const insert_text = "\n" + indent;
					this.value =
						this.value.slice(0, cursor_position) +
						insert_text +
						this.value.slice(this.selectionEnd);
					this.selectionEnd = cursor_position + insert_text.length;
				}
			}
		);

		this.scoped_selector("repl-input").addEventListener(
			"keypress",
			(event) => {
				if (event.key === "Enter" && event.shiftKey) {
					event.preventDefault();
					this.save();
					return false;
				}
			}
		);

		const center_cursor = () => {
			var text_area = this.scoped_selector("repl-input");
			var line_index =
				text_area.value.substr(0, text_area.selectionStart).split("\n")
					.length - 1;
			var line_height =
				text_area.scrollHeight / text_area.value.split("\n").length;
			text_area.scrollTop =
				line_index * line_height - text_area.clientHeight / 2;
		};

		this.scoped_selector("repl-input").addEventListener(
			"input",
			center_cursor
		);
		this.scoped_selector("repl-input").addEventListener(
			"click",
			center_cursor
		);
		this.scoped_selector("repl-input").addEventListener(
			"keyup",
			center_cursor
		);

		this.load();

		center_cursor();
	}

	scoped_selector(class_name) {
		return this.querySelector(`.${this.scoped_class(class_name)}`);
	}

	load() {
		let saved_value = localStorage.getItem(`${this.id}-hypermedia-repl`);

		this.scoped_selector("repl-input").value = saved_value;
		this.scoped_selector("repl-output").innerHTML = saved_value;

		const url_params = new URLSearchParams(window.location.search);
		const cursor_position_param = url_params.get("repl-cursor");
		if (cursor_position_param) {
			const cursor_position = parseInt(cursor_position_param, 10);
			if (!isNaN(cursor_position)) {
				const repl_input = this.scoped_selector("repl-input");
				repl_input.focus();
				repl_input.setSelectionRange(cursor_position, cursor_position);
			}
		}

		this.run_saved_scripts();
	}

	run_saved_scripts() {
		var old_scripts =
			this.scoped_selector("repl-output").querySelectorAll("script");

		for (let old_script of old_scripts) {
			// Create a new script element
			var new_script = document.createElement("script");

			// Copy all attributes from the old script to the new script
			for (let attr of Array.from(old_script.attributes)) {
				new_script.setAttribute(attr.name, attr.value);
			}

			// If the script has content, copy it
			if (old_script.innerHTML) {
				new_script.innerHTML = old_script.innerHTML;
			}

			// Replace the old script with the new script
			old_script.parentNode.replaceChild(new_script, old_script);
		}
	}

	save() {
		const input = this.scoped_selector("repl-input").value;
		this.scoped_selector("repl-output").innerHTML = input;
		localStorage.setItem(`${this.id}-hypermedia-repl`, input);

		const repl_input = this.scoped_selector("repl-input");
		const cursor_position = repl_input.selectionStart;
		const new_url = new URL(window.location);
		new_url.searchParams.set("repl-cursor", cursor_position);
		window.history.pushState({}, "", new_url);

		window.location.reload();
	}

	scoped_class(name) {
		return `${this.id}-${name}`;
	}

	print_error(message) {
		this.innerHTML = `
			                         <div class="error">
			                             <h1>Something went wrong</h1>
			                             <p>${message}</p>
			                         </div>
			                     `;
	}
}

window.customElements.define("hypermedia-repl", HypermediaRepl);
