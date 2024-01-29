const schema_browser_css = new CSSStyleSheet();
schema_browser_css.replaceSync(`
.schema-link {
    cursor: pointer;
    text-decoration: underline;
    color: blue;
}
`);

const schema_browser_html = document.createElement("template");
schema_browser_html.innerHTML = `
<div class="schema-browser-container">
    <div class="schema-browser-sidebar">
    </div>
    <div class="schema-browser-content">
    </div>
</div>
`;

class SchemaBrowser extends HTMLElement {
  state = {
    current_schema_view: null,
  };

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(schema_browser_html.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets = [schema_browser_css];

    const observer = new MutationObserver((mutationsList, observer) => {
      // TODO: Make this smart
      console.log("Rendering");
      this.render();
    });

    // Observe the body tag instead of this
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    this.render();
  }

  query_including_shadow_root(root, selector) {
    let elements = Array.from(root.querySelectorAll(selector));

    Array.from(root.querySelectorAll("*")).forEach((el) => {
      if (el.shadowRoot) {
        elements = elements.concat(
          this.query_including_shadow_root(el.shadowRoot, selector)
        );
      }
    });

    return elements;
  }

  get_schemas() {
    let schema_dictionary = {};

    let schemas = this.query_including_shadow_root(document, "entity-schema");
    for (let schema of schemas) {
      let name = schema.getAttribute("name");
      if (!name) {
        console.error("Schema has no name attribute", schema);
        continue;
      }

      let schema_data = {
        name,
        fields: [],
      };

      let fields = schema.querySelectorAll("entity-field");
      console.log(fields);

      for (let field of fields) {
        let raw_field_name = field.get_text();
        console.log(field, field.get_text());
        let field_name = raw_field_name.trim().toLowerCase();
        field_name = field_name.replace(/\W+/g, "-");
        field_name = field_name.replace(/-+/g, "-");
        field_name = field_name.replace(/^-+/, "");
        field_name = field_name.replace(/-+$/, "");

        schema_data.fields.push({
          name: field_name,
          raw_name: raw_field_name.trim(),
        });
      }

      schema_dictionary[name] = schema_data;
    }

    return schema_dictionary;
  }

  render() {
    let schemas = this.get_schemas();
    let schemas_array = Object.values(schemas);
    schemas_array.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    let sidebar = this.shadowRoot.querySelector(".schema-browser-sidebar");
    let content = this.shadowRoot.querySelector(".schema-browser-content");

    sidebar.innerHTML = "";
    content.innerHTML = "";

    if (schemas_array.length === 0) {
      sidebar.innerHTML = "No schemas found";
      return;
    }

    let schema_list_html = `<ul>`;

    for (let schema of schemas_array) {
      schema_list_html += `<li><span class="schema-link" data-schema="${schema.name}">${schema.name}</span></li>`;
    }

    schema_list_html += `</ul>`;

    sidebar.innerHTML = schema_list_html;

    if (this.state.current_schema_view) {
      this.render_schema_view(schemas[this.state.current_schema_view]);
    } else {
      let first_schema = schemas_array[0];
      this.render_schema_view(first_schema);
    }

    this.clickHandler = (event) => {
      let target = event.target;
      if (target.classList.contains("schema-link")) {
        let schema_name = target.getAttribute("data-schema");
        let schema = schemas[schema_name];
        this.state.current_schema_view = schema_name;
        this.render_schema_view(schema);
      }
    };

    let schema_browser_container = this.shadowRoot.querySelector(
      ".schema-browser-container"
    );

    schema_browser_container.removeEventListener("click", this.clickHandler);
    schema_browser_container.addEventListener("click", this.clickHandler);
  }

  render_schema_view(schema) {
    let content = this.shadowRoot.querySelector(".schema-browser-content");
    content.innerHTML = "";

    let schema_view_html = `<div class="schema-view" data-schema="${schema.name}">`;

    schema_view_html += `<h1>${schema.name}</h1>`;

    schema_view_html += `<ul>`;

    for (let field of schema.fields) {
      schema_view_html += `<li>${field.raw_name}</li>`;
    }

    schema_view_html += `</ul>`;

    schema_view_html += `</div>`;

    content.innerHTML = schema_view_html;
  }
}

window.customElements.define("schema-browser", SchemaBrowser);
