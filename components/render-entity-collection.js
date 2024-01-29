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
  connectedCallback() {
    this.style.display = "none";
    console.log(this.innerHTML);
    this.output_id = nanoid();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    let collection = document.querySelector(
      `entity-collection[id="${this.getAttribute("for")}"]`
    );

    let data = [];
    if (collection) data = collection.get_data();

    let output_id = this.output_id;
    let elements_to_delete = document.querySelectorAll(
      `[data-output-id="${output_id}"]`
    );
    elements_to_delete.forEach((element) => {
      element.parentNode.removeChild(element);
    });

    let raw_template = this.innerHTML;
    raw_template = raw_template.trim();

    let parser = new DOMParser();
    let template = parser.parseFromString(raw_template, "text/html");
    let elements = [];
    data.forEach((item) => {
      let clone = template.cloneNode(true);
      let fields = clone.querySelectorAll("field");
      for (let field of fields) {
        let field_name = field.innerHTML;
        field.replaceWith(document.createTextNode(item[field_name]));
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

    for (let element of elements) {
      element.setAttribute("data-output-id", output_id);
    }

    for (let i = elements.length - 1; i >= 0; i--) {
      this.parentNode.insertBefore(elements[i], this.nextSibling);
    }

    //console.log("Elements", elements);
  }
}

customElements.define("render-entity-collection", RenderEntityCollection);
