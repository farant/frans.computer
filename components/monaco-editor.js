import * as monaco from "https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/+esm";

let monaco_cdn_script =
  "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs/loader.min.js";
let monaco_cdn_css =
  "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs/editor/editor.main.min.css";

/*
let script_tag = document.createElement("script");
script_tag.src = monaco_cdn_script;
document.head.appendChild(script_tag);

let link_tag = document.createElement("link");
link_tag.href = monaco_cdn_css;
link_tag.rel = "stylesheet";
link_tag.setAttribute("data-name", "vs/editor/editor.main");
document.head.appendChild(link_tag);

require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs",
  },
});
*/

const monaco_editor_html = document.createElement("template");
monaco_editor_html.innerHTML = `
<div id="editor">
    <div style="display: none">
        <slot id="initial-markup"></slot>
    </div>
    <div id="monaco-container"></div>
</div>
`;

class MonacoEditor extends HTMLElement {
  // attributeChangedCallback will be called when the value of one of these attributes is changed in html
  static get observedAttributes() {
    return ["value", "language"];
  }

  editor = null;
  _form = null;

  constructor() {
    super();

    // keep reference to <form> for cleanup
    this._form = null;
    this._handleFormData = this._handleFormData.bind(this);

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(monaco_editor_html.content.cloneNode(true));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.editor) {
      if (name === "value") {
        this.editor.setValue(newValue);
      }

      if (name === "language") {
        let existing_value = this._getEditorValue();

        const currentModel = this.editor.getModel();
        if (currentModel) {
          currentModel.dispose();
        }

        this.editor.setModel(
          monaco.editor.createModel(existing_value, newValue)
        );
      }
    }
  }

  connectedCallback() {
    this._form = this._findContainingForm();
    if (this._form) {
      this._form.addEventListener("formdata", this._handleFormData);
    }

    const container = document.createElement("div");
    container.style.width = "90%";

    // editor
    const editor = document.createElement("div");
    editor.style.minHeight = "400px";
    editor.style.maxHeight = "100vh";
    editor.style.height = "100%";
    editor.style.width = "100%";
    editor.style.resize = "vertical";
    editor.style.overflow = "hidden";

    const language_dropdown = document.createElement("select");
    language_dropdown.style.fontSize = "var(--text-size)";
    language_dropdown.style.float = "right";
    language_dropdown.style.padding = "5px 10px";
    language_dropdown.style.marginBottom = "15px";
    language_dropdown.style.backgroundColor =
      "var(--color-background-floating)";
    language_dropdown.style.borderRadius = "3px";
    language_dropdown.style.borderColor = "var(--color-medium)";
    language_dropdown.style.fontFamily = "var(--font-body)";
    language_dropdown.style.color = "var(--color-text)";

    container.appendChild(language_dropdown);
    container.appendChild(editor);

    this.shadowRoot.getElementById("monaco-container").appendChild(container);

    // window.editor is accessible.
    var init = () => {
      //require(["vs/editor/editor.main"], () => {
      monaco.editor.defineTheme("bird-of-paradise", {
        base: "vs-dark",
        inherit: true,
        rules: [
          {
            background: "372725",
            token: "",
          },
          {
            foreground: "e6e1c4",
            background: "322323",
            token: "source",
          },
          {
            foreground: "6b4e32",
            fontStyle: "italic",
            token: "comment",
          },
          {
            foreground: "ef5d32",
            token: "keyword",
          },
          {
            foreground: "ef5d32",
            token: "storage",
          },
          {
            foreground: "efac32",
            token: "entity.name.function",
          },
          {
            foreground: "efac32",
            token: "keyword.other.name-of-parameter.objc",
          },
          {
            foreground: "efac32",
            fontStyle: "bold",
            token: "entity.name",
          },
          {
            foreground: "6c99bb",
            token: "constant.numeric",
          },
          {
            foreground: "7daf9c",
            token: "variable.language",
          },
          {
            foreground: "7daf9c",
            token: "variable.other",
          },
          {
            foreground: "6c99bb",
            token: "constant",
          },
          {
            foreground: "efac32",
            token: "variable.other.constant",
          },
          {
            foreground: "6c99bb",
            token: "constant.language",
          },
          {
            foreground: "d9d762",
            token: "string",
          },
          {
            foreground: "efac32",
            token: "support.function",
          },
          {
            foreground: "efac32",
            token: "support.type",
          },
          {
            foreground: "6c99bb",
            token: "support.constant",
          },
          {
            foreground: "efcb43",
            token: "meta.tag",
          },
          {
            foreground: "efcb43",
            token: "declaration.tag",
          },
          {
            foreground: "efcb43",
            token: "entity.name.tag",
          },
          {
            foreground: "efcb43",
            token: "entity.other.attribute-name",
          },
          {
            foreground: "ffffff",
            background: "990000",
            token: "invalid",
          },
          {
            foreground: "7daf9c",
            token: "constant.character.escaped",
          },
          {
            foreground: "7daf9c",
            token: "constant.character.escape",
          },
          {
            foreground: "7daf9c",
            token: "string source",
          },
          {
            foreground: "7daf9c",
            token: "string source.ruby",
          },
          {
            foreground: "e6e1dc",
            background: "144212",
            token: "markup.inserted",
          },
          {
            foreground: "e6e1dc",
            background: "660000",
            token: "markup.deleted",
          },
          {
            background: "2f33ab",
            token: "meta.diff.header",
          },
          {
            background: "2f33ab",
            token: "meta.separator.diff",
          },
          {
            background: "2f33ab",
            token: "meta.diff.index",
          },
          {
            background: "2f33ab",
            token: "meta.diff.range",
          },
        ],
        colors: {
          "editor.foreground": "#E6E1C4",
          "editor.background": "#372725",
          "editor.selectionBackground": "#16120E",
          "editor.lineHighlightBackground": "#1F1611",
          "editorCursor.foreground": "#E6E1C4",
          "editorWhitespace.foreground": "#42302D",
        },
      });

      monaco.editor.setTheme("bird-of-paradise");
      console.log(monaco.languages.getLanguages().map((lang) => lang.id));

      let languages = monaco.languages.getLanguages().map((lang) => lang.id);

      languages = [
        "c",
        "cpp",
        "css",
        "dockerfile",
        "go",
        "html",
        "javascript",
        "json",
        "lua",
        "markdown",
        "objective-c",
        "pgsql",
        "pug",
        "rust",
        "shell",
        "typescript",
        "yaml",
      ];

      for (let lang of languages) {
        let option = document.createElement("option");
        option.setAttribute("label", lang);
        option.setAttribute("value", lang);
        if (lang == "javascript") {
          option.setAttribute("selected", "true");
        }
        language_dropdown.appendChild(option);
      }

      language_dropdown.addEventListener("change", (e) => {
        let existing_value = this._getEditorValue();
        const currentModel = this.editor.getModel();

        if (currentModel) {
          currentModel.dispose();
        }

        this.editor.setModel(
          monaco.editor.createModel(existing_value, e.target.value)
        );
      });

      // Editor
      this.editor = monaco.editor.create(editor, {
        theme: "bird-of-paradise",
        model: monaco.editor.createModel(
          this.get_initial_value(),
          this.getAttribute("language")
        ),
        minimap: {
          enabled: false,
        },
        wordWrap: "on",
        fontSize: 18,
        lineNumbers: "off",
        folding: false,
        contextmenu: false,
        automaticLayout: true,
        hover: {
          enabled: false,
        },
        /*
					  scrollbar: {
							handleMouseWheel: false,
						},
						*/
        fontFamily: "var(--font-code)",
      });
      //});

      window.removeEventListener("load", init);
    };

    window.addEventListener("load", init);
  }

  disconnectedCallback() {
    if (this._form) {
      this._form.removeEventListener("formdata", this._handleFormData);
      this._form = null;
    }
  }

  get_initial_value() {
    if (this.hasAttribute("value")) {
      return this.getAttribute("value");
    } else {
      return (
        this.shadowRoot.getElementById("initial-markup").innerHTML.trim() || ""
      );
    }
  }

  _getEditorValue() {
    if (this.editor) {
      return this.editor.getModel().getValue();
    }

    return null;
  }

  _handleFormData(ev) {
    ev.formData.append(this.getAttribute("name"), this._getEditorValue());
  }

  _findContainingForm() {
    // can only be in a form in the same "scope", ShadowRoot or Document
    const root = this.getRootNode();
    if (root instanceof Document || root instanceof Element) {
      const forms = Array.from(root.querySelectorAll("form"));
      // we can only be in one <form>, so the first one to contain us is the correct one
      return forms.find((form) => form.contains(this)) || null;
    }

    return null;
  }
}

customElements.define("monaco-editor", MonacoEditor);
