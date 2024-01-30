import { nanoid } from "../vendor/nanoid.js";

/*
    Example:

    <render-entity-collection for="favorite-books">
        <div class="card">
            <div class="card-name"><field>title</field></div>
            <div class="card-subheading">By <field>author</field></div>
        </div>
    </render-entity-collection>
*/

class RenderEntityCollection extends HTMLElement {
  constructor() {
    super();
    this.style.display = "none";
    console.log(this.innerHTML);
    this.saved_elements = [];
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    let collection = document.querySelector(
      `entity-collection[id="${this.getAttribute("for")}"]`
    );

    let data = [];
    if (collection) data = await collection.get_data();

    let elements_to_delete = this.saved_elements;
    elements_to_delete.forEach((element) => {
      element.parentNode.removeChild(element);
    });

    this.saved_elements = [];

    let raw_template = this.innerHTML;
    raw_template = raw_template.trim();

    let parser = new DOMParser();
    let template = parser.parseFromString(raw_template, "text/html");
    let elements = [];

    if (this.getAttribute("sort-by")) {
      let key = this.getAttribute("sort-by");
      data.sort((a, b) => {
        return a[key].localeCompare(b[key]);
      });
    }

    data.forEach((item) => {
      console.log("item data", item);
      let clone = template.cloneNode(true);
      let fields = clone.querySelectorAll("field");
      for (let field of fields) {
        let field_name = field.innerHTML;
        field.replaceWith(document.createTextNode(item[field_name]));
      }
      let if_fields = clone.querySelectorAll("if-field");
      console.log("if_fields", if_fields);
      for (let condition of if_fields) {
        let field_name = condition.getAttribute("field");
        console.log(
          "field_name",
          field_name,
          "value",
          !!item[field_name],
          "item",
          item[field_name]
        );
        if (!!item[field_name]) {
          condition.replaceWith(...condition.childNodes);
        } else {
          condition.parentNode.removeChild(condition);
        }
      }

      let attributeNodes = Array.from(clone.querySelectorAll("*")).filter(
        (node) => {
          return Array.from(node.attributes).some((attr) =>
            attr.value.startsWith("field-value:")
          );
        }
      );

      console.log("attributeNodes", attributeNodes);

      for (let node of attributeNodes) {
        for (let attr of node.attributes) {
          if (attr.value.startsWith("field-value:")) {
            let fieldName = attr.value.substring("field-value:".length);

            console.log("attr", attr);
            console.log("fieldName", fieldName);
            console.log("item[fieldName]", item[fieldName]);

            attr.value = item[fieldName] || "";
          }
        }
      }

      elements.push(...clone.body.childNodes);
    });

    elements = elements.map((e) => {
      if (!e.setAttribute) {
        let span = document.createElement("span");
        span.appendChild(e);
        return span;
      }
      return e;
    });

    console.log("Elements", elements);

    let relative_node = this;

    if (
      this.parentNode &&
      this.parentNode.classList.contains("desktop-draggable-container")
    ) {
      relative_node = this.parentNode;
    }

    this.saved_elements = elements;

    for (let i = elements.length - 1; i >= 0; i--) {
      relative_node.parentNode.insertBefore(
        elements[i],
        relative_node.nextSibling
      );
    }
  }
}

customElements.define("render-entity-collection", RenderEntityCollection);
