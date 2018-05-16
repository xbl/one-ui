import styles from './cities.css';
import template from './cities.pug';

// extends some different native constructor
class Cities extends HTMLElement {
  constructor() {
    super();
  }

  // 监听属性列表
  static get observedAttributes() {
    return ['cities', 'toggle', 'value', 'test'];
  }

  connectedCallback() {
    this.className = styles['cities']
    this.render()
    this.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        this.setAttribute('toggle', false);
        this.setAttribute('value', 'abc');
        // this.setAttribute('test', 'test1111');
        this.value = 'def1'
        this.dispatchEvent(new CustomEvent('submit', {
          detail: 'def2'
        }))
      }
    }, false)
  }

  render() {
    this.innerHTML = template({
      styles,
      cities: this.cities
    });
  }

  // 属性变化的回调
  attributeChangedCallback(name, oldValue, newValue) {
    switch(name) {
      case 'cities':
        this.cities = newValue;
        this.render()
      break;
      default:
        console.log(name + ':' + newValue);
    }
  }
}

// define it specifying what's extending
customElements.define('cities-dialog', Cities);

