import 'document-register-element';
import styles from './my-div.css'
// https://github.com/parcel-bundler/parcel/issues/70
import fs from 'fs';
// 以字符串的形式读取内容
const str = fs.readFileSync(__dirname + '/my-div.ejs', 'utf8');

import ejs from 'ejs'

console.log(styles)

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
    console.log('connectedCallback')
    this.addEventListener('click', console.log);

    this.className = styles['one-ui-title']
    var divDom = document.createElement('div');
    divDom.innerHTML = ejs.render(str, { users: [ {name: 'AAAA'}, {name: 'BBB'} ]});
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

