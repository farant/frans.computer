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
  }

  render() {}
}

customElements.define("render-entity-collection", RenderEntityCollection);
