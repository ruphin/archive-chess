import { html, render, LitElement } from "lit";

class thing extends LitElement {
  render() {
    return html`<span>Test</span>
      <style>
        span {
          color: var(--test);
        }
      </style>`;
  }
}
customElements.define("test-thing", thing);

const body = html`<test-thing></test-thing
  ><style>
    :root {
      --test: red;
    }
  </style>`;

render(body, document.body);
