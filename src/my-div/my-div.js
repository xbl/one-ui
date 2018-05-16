import styles from './my-div.css';
import myDivTemplate from './my-div.pug';
// https://github.com/parcel-bundler/parcel/issues/70

console.log(styles);

// extends some different native constructor
class MyDiv extends HTMLElement {
  constructor() {
    super();
  }

  // 监听属性列表
  static get observedAttributes() {
    return ['country'];
  }

  connectedCallback() {
    this.addEventListener('click', console.log);

    this.className = styles['my-div']
    var divDom = document.createElement('div');
    divDom.innerHTML = myDivTemplate({});
    this.appendChild(divDom);
    // https://stackoverflow.com/questions/43836886/failed-to-construct-customelement-error-when-javascript-file-is-placed-in-head
  }

  // 属性变化的回调
  attributeChangedCallback(name, oldValue, newValue) {
    // react to changes for name
    console.log(name + ':' + newValue);
  }
}

// define it specifying what's extending
customElements.define('my-div', MyDiv);

