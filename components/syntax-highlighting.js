import { codeToHtml } from "https://esm.run/shiki";
import { dedent } from "/vendor/dedent.js";

let syntax_highlighting_style = document.createElement("style");
syntax_highlighting_style.innerHTML = `
pre[is=syntax-highlighting] > pre {
  padding: 10px;
}
`;
document.head.appendChild(syntax_highlighting_style);

let saved_syntax_highlighting = {};

class SyntaxHighlighting extends HTMLPreElement {
	constructor() {
		super();
		this.style.display = "none";
	}

	async connectedCallback() {
		let code = dedent(this.innerHTML.trim());
		let language = this.getAttribute("lang") || "js";
		let highlighted = "";
		let cache_key = `${language}:${code}`;

		if (saved_syntax_highlighting[cache_key]) {
			highlighted = saved_syntax_highlighting[cache_key];
		} else {
			highlighted = await codeToHtml(code, {
				lang: language,
				theme: "solarized-light",
			});

			saved_syntax_highlighting[cache_key] = highlighted;
		}

		this.innerHTML = highlighted;

		this.style.display = "block";
	}
}

window.customElements.define("syntax-highlighting", SyntaxHighlighting, {
	extends: "pre",
});
