import { EventStore } from "./event-store";
const hm_server = "http://localhost:1323";
class LlmPrompt extends HTMLElement {
	connectedCallback() {
		console.log("connected callback");
		this.innerHTML = `
      <div class="prompt-container">
        <div class="prompt-input-container">
          <div>
            <textarea style="height: 200px; width: 60ch" class="prompt-thing"></textarea>
          </div>
          <div><button>Send Prompt</button></div>
        </div>
        <div class="prompt-output">
        </div>
        <div class="past-prompts">
        </div>
      </div>
      `;

		this.querySelector(".prompt-thing").addEventListener(
			"keypress",
			(e) => {
				if (e.key == "Enter" && e.shiftKey) {
					e.preventDefault();
					this.send_prompt();
					return false;
				}
			}
		);

		this.querySelector(".prompt-input-container button").addEventListener(
			"click",
			(e) => {
				this.send_prompt();
			}
		);

		this.render_past_prompts();
	}

	async render_past_prompts() {
		this.querySelector(".prompt-thing").value = "";

		this.querySelector(".prompt-output").innerHTML = "";

		let past_prompts =
			EventStore.get_events_for_category("llm-question").reverse();

		let html = "";
		for (let event of past_prompts) {
			html += `
        <div class="past-prompt-container" style="max-width: 60ch">
          <div class="past-prompt-question" style="white-space: pre-wrap; font-style: italic; font-size: 1.2em; margin-top: 2em; padding: 1em; background-color:#eee">${escape_html(
				event.data.question
			)}</div>
          <div class="past-prompt-answer" style="margin-bottom:8em">
            <pre is="markdown-view">${event.data.response}</pre>
          </div>
        </div>
        `;
		}

		this.querySelector(".past-prompts").innerHTML = html;
	}

	async send_prompt() {
		let val = this.querySelector(".prompt-thing").value;

		let data = new FormData();
		data.append("prompt", val);

		let prompt_id = (
			await (
				await fetch(hm_server + "/llm-prompt", {
					method: "POST",
					body: data,
				})
			).text()
		)
			.trim()
			.replace(/"/g, "");

		let get_prompt_progress = async () => {
			try {
				let response = await (
					await fetch(hm_server + `/llm-prompt/pending/${prompt_id}`)
				).json();
				response = JSON.parse(response);
				console.log({ response });
				this.querySelector(
					".prompt-output"
				).innerHTML = `<div style="margin-top:2em;width: 60ch;padding-bottom:200px;">
            <pre is="markdown-view">${escape_html(response.response)}</pre>
          </div>`;
				if (!response.done) {
					setTimeout(() => {
						get_prompt_progress();
					}, 500);
				} else {
					EventStore.write_event("ask-initial-question", {
						entity_type: "llm-question",
						payload: {
							question: response.original_prompt,
							response: response.response,
						},
					});

					this.render_past_prompts();
				}
			} catch (e) {
				console.log(e);
			}
		};

		console.log({ prompt_id });

		get_prompt_progress();
	}
}

window.customElements.define("llm-prompt", LlmPrompt);
